'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { generateSlug } from '@/lib/utils'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>(null)
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

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
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const slug = generateSlug(title)

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          title,
          slug,
          content,
          excerpt,
          status,
          author_id: user.id,
          published_at: status === 'published' ? new Date().toISOString() : null,
        })

      if (insertError) throw insertError

      router.push('/dashboard/posts')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">新建文章</h1>

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
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '保存中...' : status === 'published' ? '发布' : '保存草稿'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
