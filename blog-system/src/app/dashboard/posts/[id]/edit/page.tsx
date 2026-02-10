'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

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

export default function EditPostPage({ params }: PageProps) {
  const [id, setId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 分类和标签
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const router = useRouter()

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      loadPost(p.id)
    })
    loadCategoriesAndTags()
  }, [])

  const loadCategoriesAndTags = async () => {
    if (!supabase) return
    
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

  const loadPost = async (postId: string) => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (fetchError) throw fetchError
      if (!post) throw new Error('文章未找到')

      setTitle(post.title)
      setSlug(post.slug)
      // 确保 content 是字符串格式
      if (typeof post.content === 'string') {
        setMarkdownContent(post.content)
      } else if (post.content && typeof post.content === 'object') {
        // 如果是旧的 JSON 格式，尝试提取文本（向后兼容）
        setMarkdownContent(JSON.stringify(post.content, null, 2))
      } else {
        setMarkdownContent('')
      }
      setExcerpt(post.excerpt || '')
      setStatus(post.status)
      
      // 加载文章的分类和标签
      const { data: postCategories } = await supabase
        .from('post_categories')
        .select('category_id')
        .eq('post_id', postId)
      
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('tag_id')
        .eq('post_id', postId)
      
      if (postCategories) {
        setSelectedCategories(postCategories.map((pc: { category_id: string }) => pc.category_id))
      }
      
      if (postTags) {
        setSelectedTags(postTags.map((pt: { tag_id: string }) => pt.tag_id))
      }
      
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post')
      setLoading(false)
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // 获取当前用户的 profile，判断是否是超级管理员
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .maybeSingle()

      // 判断是否是超级管理员
      const isSuperAdmin = userProfile?.role === 'admin' && 
                          userProfile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

      // Get current post to check if slug changed
      const { data: currentPost } = await supabase
        .from('posts')
        .select('slug, status')
        .eq('id', id)
        .single()

      let finalSlug = slug

      // If slug changed, check for duplicates
      if (currentPost && currentPost.slug !== slug) {
        let slugExists = true
        let counter = 1

        while (slugExists) {
          const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', finalSlug)
            .neq('id', id)
            .single()

          if (!existingPost) {
            slugExists = false
          } else {
            finalSlug = `${slug}-${counter}`
            counter++
          }
        }
      }

      const updateData: Record<string, unknown> = {
        title,
        slug: finalSlug,
        content: markdownContent,
        excerpt,
        status,
      }

      // Set published_at if changing from draft to published
      if (status === 'published' && currentPost?.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }

      // 超级管理员发布的文章自动审核通过
      if (isSuperAdmin && status === 'published') {
        updateData.review_status = 'approved'
        updateData.reviewed_by = user.id
        updateData.reviewed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      // 更新分类关联
      // 先删除旧的关联
      await supabase
        .from('post_categories')
        .delete()
        .eq('post_id', id)
      
      // 插入新的关联
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          post_id: id,
          category_id: categoryId
        }))
        
        await supabase
          .from('post_categories')
          .insert(categoryRelations)
      }

      // 更新标签关联
      // 先删除旧的关联
      await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id)
      
      // 插入新的关联
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: id,
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
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!supabase) return
    
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">编辑文章</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            标题
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="文章 URL 别名"
          />
          <p className="text-xs text-gray-500 mt-1">
            文章 URL 将是: /blog/{slug || 'your-slug'}
          </p>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
            摘要
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="输入文章摘要"
            rows={3}
          />
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
                      setSelectedCategories(selectedCategories.filter(cid => cid !== category.id))
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
                      setSelectedTags(selectedTags.filter(tid => tid !== tag.id))
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
          <label className="block text-sm font-medium mb-2">
            内容 <span className="text-gray-400 text-xs">(支持 Markdown 格式)</span>
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
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存更改'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
          >
            删除文章
          </button>
        </div>
      </form>
    </div>
  )
}
