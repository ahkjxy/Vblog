'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'

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

interface EditPostFormProps {
  post: any // Using specific type would be better but keeping it flexible for now
  categories: Category[]
  tags: Tag[]
  initialSelectedCategories: string[]
  initialSelectedTags: string[]
}

export function EditPostForm({ 
  post, 
  categories, 
  tags, 
  initialSelectedCategories, 
  initialSelectedTags 
}: EditPostFormProps) {
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  
  // Handle content: string or JSON
  const initialContent = typeof post.content === 'string' 
    ? post.content 
    : (post.content ? JSON.stringify(post.content, null, 2) : '')
    
  const [markdownContent, setMarkdownContent] = useState(initialContent)
  const [excerpt, setExcerpt] = useState(post.excerpt || '')
  const [status, setStatus] = useState<'draft' | 'published'>(post.status)
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // Check permissions (admin or author)
      // For simplicity in client component, we assume server page checked access to VIEW the page,
      // but RLS will still enforce WRITE access.
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .maybeSingle()

      const isSuperAdmin = userProfile?.role === 'admin' && 
                          userProfile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

      // Slug check logic
      let finalSlug = slug
      if (post.slug !== slug) {
        let slugExists = true
        let counter = 1
        while (slugExists) {
          const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', finalSlug)
            .neq('id', post.id)
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

      if (status === 'published' && post.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }

      if (isSuperAdmin && status === 'published') {
        updateData.review_status = 'approved'
        updateData.reviewed_by = user.id
        updateData.reviewed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)

      if (updateError) throw updateError

      // Update Categories
      await supabase.from('post_categories').delete().eq('post_id', post.id)
      if (selectedCategories.length > 0) {
        await supabase.from('post_categories').insert(
          selectedCategories.map(catId => ({ post_id: post.id, category_id: catId }))
        )
      }

      // Update Tags
      await supabase.from('post_tags').delete().eq('post_id', post.id)
      if (selectedTags.length > 0) {
        await supabase.from('post_tags').insert(
          selectedTags.map(tagId => ({ post_id: post.id, tag_id: tagId }))
        )
      }

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (deleteError) throw deleteError

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
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
                        setSelectedCategories(selectedCategories.filter(cid => cid !== category.id))
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
                        setSelectedTags(selectedTags.filter(tid => tid !== tag.id))
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
