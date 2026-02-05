'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { generateSlug } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

type EditorType = 'markdown' | 'rich'

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [editorType, setEditorType] = useState<EditorType>('markdown')
  const [content, setContent] = useState<Record<string, unknown> | null>(null)
  const [markdownContent, setMarkdownContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 分类和标签
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  // 加载分类和标签
  useEffect(() => {
    loadCategoriesAndTags()
  }, [])

  const loadCategoriesAndTags = async () => {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    const { data: tagsData } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    
    if (categoriesData) setCategories(categoriesData)
    if (tagsData) setTags(tagsData)
  }

  // Auto-generate slug when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  // 自动生成摘要
  const generateExcerpt = () => {
    let text = ''
    
    if (editorType === 'markdown') {
      text = markdownContent
    } else if (content && typeof content === 'object' && 'content' in content) {
      // 从 TipTap JSON 提取文本
      text = extractTextFromTipTap(content)
    }
    
    // 清理文本：移除 Markdown 标记、多余空格等
    text = text
      .replace(/#{1,6}\s/g, '') // 移除标题标记
      .replace(/\*\*|__/g, '') // 移除加粗标记
      .replace(/\*|_/g, '') // 移除斜体标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // 移除代码块
      .replace(/\n+/g, ' ') // 换行转空格
      .replace(/\s+/g, ' ') // 多个空格转单个
      .trim()
    
    // 截取前 150 个字符
    const maxLength = 150
    if (text.length > maxLength) {
      text = text.substring(0, maxLength).trim() + '...'
    }
    
    setExcerpt(text)
  }

  // 从 TipTap JSON 提取纯文本
  const extractTextFromTipTap = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    
    const obj = node as Record<string, unknown>
    let text = ''
    
    if ('text' in obj && typeof obj.text === 'string') {
      text += obj.text
    }
    
    if ('content' in obj && Array.isArray(obj.content)) {
      for (const child of obj.content) {
        text += extractTextFromTipTap(child) + ' '
      }
    }
    
    return text
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // 如果没有摘要，自动生成
      let finalExcerpt = excerpt
      if (!finalExcerpt.trim()) {
        let text = editorType === 'markdown' ? markdownContent : extractTextFromTipTap(content)
        text = text
          .replace(/#{1,6}\s/g, '')
          .replace(/\*\*|__/g, '')
          .replace(/\*|_/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/`{1,3}[^`]*`{1,3}/g, '')
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        if (text.length > 150) {
          finalExcerpt = text.substring(0, 150).trim() + '...'
        } else {
          finalExcerpt = text
        }
      }

      // Use provided slug or generate from title
      let finalSlug = slug || generateSlug(title)
      let slugExists = true
      let counter = 1

      // Check if slug exists and add counter if needed
      while (slugExists) {
        const { data: existingPost } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', finalSlug)
          .single()

        if (!existingPost) {
          slugExists = false
        } else {
          finalSlug = `${slug || generateSlug(title)}-${counter}`
          counter++
        }
      }

      // 插入文章
      const { data: post, error: insertError } = await supabase
        .from('posts')
        .insert({
          title,
          slug: finalSlug,
          content: editorType === 'markdown' ? markdownContent : content,
          excerpt: finalExcerpt,
          status,
          author_id: user.id,
          published_at: status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 插入分类关联
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }))
        
        await supabase
          .from('post_categories')
          .insert(categoryRelations)
      }

      // 插入标签关联
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }))
        
        await supabase
          .from('post_tags')
          .insert(tagRelations)
      }

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        新建文章
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            标题 *
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="输入文章标题"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            URL 别名 (Slug)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="自动生成或手动输入"
          />
          <p className="text-xs text-gray-500 mt-1">
            文章 URL 将是: /blog/{slug || 'your-slug'}
          </p>
        </div>

        {/* 分类选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            分类 {selectedCategories.length === 0 && <span className="text-gray-400">(未选择将归入&ldquo;未分类&rdquo;)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <label
                key={category.id}
                className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.id])
                    } else {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                    }
                  }}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{category.name}</span>
              </label>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              暂无分类，请先在<a href="/dashboard/categories" className="text-purple-600 hover:underline">分类管理</a>中创建
            </p>
          )}
        </div>

        {/* 标签选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            标签 <span className="text-gray-400">(可选)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <label
                key={tag.id}
                className={`px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all text-sm ${
                  selectedTags.includes(tag.id)
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tag.id])
                    } else {
                      setSelectedTags(selectedTags.filter(id => id !== tag.id))
                    }
                  }}
                  className="sr-only"
                />
                <span>#{tag.name}</span>
              </label>
            ))}
          </div>
          {tags.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              暂无标签，请先在<a href="/dashboard/tags" className="text-purple-600 hover:underline">标签管理</a>中创建
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="excerpt" className="block text-sm font-medium">
              摘要 <span className="text-gray-400">(留空自动生成)</span>
            </label>
            <button
              type="button"
              onClick={generateExcerpt}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Sparkles className="w-4 h-4" />
              自动生成
            </button>
          </div>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="输入文章摘要，或点击自动生成从正文提取"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            编辑器类型
          </label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="markdown"
                checked={editorType === 'markdown'}
                onChange={(e) => setEditorType(e.target.value as EditorType)}
                className="w-4 h-4 text-purple-600"
              />
              <span>Markdown</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="rich"
                checked={editorType === 'rich'}
                onChange={(e) => setEditorType(e.target.value as EditorType)}
                className="w-4 h-4 text-purple-600"
              />
              <span>富文本编辑器</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            内容 *
          </label>
          {editorType === 'markdown' ? (
            <MarkdownEditor
              content={markdownContent}
              onChange={setMarkdownContent}
            />
          ) : (
            <TipTapEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            状态
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
          >
            {loading ? '保存中...' : status === 'published' ? '发布文章' : '保存草稿'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
