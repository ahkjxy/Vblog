'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { generateSlug } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

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

interface NewPostFormProps {
  categories: Category[]
  tags: Tag[]
}

export function NewPostForm({ categories, tags }: NewPostFormProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const router = useRouter()

  // Auto-generate slug when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    // 自动生成拼音 slug
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  // 自动生成摘要
  const generateExcerpt = () => {
    // 从 Markdown 内容提取文本
    let text = markdownContent
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // 验证 slug（可选，因为会自动生成）
      let finalSlug: string
      if (!slug || !slug.trim()) {
        finalSlug = generateSlug(title)
      } else {
        finalSlug = slug
      }

      // 如果没有摘要，自动生成
      let finalExcerpt = excerpt
      if (!finalExcerpt.trim()) {
        const text = markdownContent
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

      // Check unique slug
      let slugExists = true
      let counter = 1
      while (slugExists) {
        const { data: existingPost } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', finalSlug)
          .maybeSingle()

        if (!existingPost) {
          slugExists = false
        } else {
          finalSlug = `${slug || generateSlug(title)}-${counter}`
          counter++
        }
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .maybeSingle()

      const isSuperAdmin = userProfile?.role === 'admin' && 
                          userProfile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

      // 插入文章
      const { data: post, error: insertError } = await supabase
        .from('posts')
        .insert({
          title,
          slug: finalSlug,
          content: markdownContent,
          excerpt: finalExcerpt,
          status,
          author_id: user.id,
          published_at: status === 'published' ? new Date().toISOString() : null,
          review_status: isSuperAdmin ? 'approved' : 'pending',
          reviewed_by: isSuperAdmin ? user.id : null,
          reviewed_at: isSuperAdmin ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Relation updates...
      if (selectedCategories.length > 0) {
        await supabase.from('post_categories').insert(
          selectedCategories.map(catId => ({ post_id: post.id, category_id: catId }))
        )
      }

      if (selectedTags.length > 0) {
        await supabase.from('post_tags').insert(
          selectedTags.map(tagId => ({ post_id: post.id, tag_id: tagId }))
        )
      }

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl">
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
            placeholder="自动生成拼音或手动输入"
          />
          <p className="text-xs text-gray-500 mt-1">
            文章 URL 将是: /blog/{slug || 'your-slug-here'}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            💡 中文标题会自动转换为拼音，也可以手动修改
          </p>
        </div>

        {/* 分类选择 */}
        {categories.length > 0 && (
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
          </div>
        )}

        {/* 标签选择 */}
        {tags.length > 0 && (
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
          </div>
        )}

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
            内容 * <span className="text-gray-400 text-xs">(支持 Markdown 格式)</span>
          </label>
          <MarkdownEditor
            content={markdownContent}
            onChange={setMarkdownContent}
          />
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
