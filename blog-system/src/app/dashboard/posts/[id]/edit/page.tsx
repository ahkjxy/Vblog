'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TipTapEditor } from '@/components/editor/TipTapEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditPostPage({ params }: PageProps) {
  const [id, setId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState<Record<string, unknown> | null>(null)
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      loadPost(p.id)
    })
  }, [])

  const loadPost = async (postId: string) => {
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
      setContent(post.content)
      setExcerpt(post.excerpt || '')
      setStatus(post.status)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post')
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

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
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

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
        content,
        excerpt,
        status,
      }

      // Set published_at if changing from draft to published
      if (status === 'published' && currentPost?.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

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

        <div>
          <label className="block text-sm font-medium mb-2">
            内容
          </label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
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
