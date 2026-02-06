'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MarkdownContent } from '@/components/MarkdownContent'

interface Post {
  id: string
  title: string
  content: any
  excerpt: string | null
  status: string
  review_status: string
  author_id: string
  created_at: string
  profiles: {
    name: string
    family_id: string | null
  }
  families?: {
    name: string
  }
}

export default function ReviewPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    try {
      // 检查当前用户是否是超级管理员
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .maybeSingle()

      const isSuper = profile?.role === 'admin' && 
        profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
      
      setIsSuperAdmin(isSuper)

      if (!isSuper) {
        setError('只有超级管理员可以审核文章')
        setLoading(false)
        return
      }

      // 获取文章详情
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            name,
            family_id
          )
        `)
        .eq('id', postId)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!data) {
        setError('文章不存在')
        setLoading(false)
        return
      }

      // 如果有 family_id，获取家庭信息
      if (data.profiles?.family_id) {
        const { data: familyData } = await supabase
          .from('families')
          .select('name')
          .eq('id', data.profiles.family_id)
          .maybeSingle()
        
        if (familyData) {
          data.families = familyData
        }
      }

      setPost(data)
    } catch (err) {
      console.error('加载文章失败:', err)
      setError('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (approve: boolean) => {
    if (!post) return

    setSubmitting(true)
    setError('')

    try {
      const { error: reviewError } = await supabase.rpc('approve_post', {
        post_id: post.id,
        approve: approve
      })

      if (reviewError) throw reviewError

      alert(approve ? '文章已通过审核' : '文章已被拒绝')
      router.push('/dashboard/posts')
    } catch (err: any) {
      console.error('审核失败:', err)
      setError(err.message || '审核失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || '文章不存在'}</p>
          <Link
            href="/dashboard/posts"
            className="mt-4 inline-flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <ArrowLeft className="w-4 h-4" />
            返回文章列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回文章列表
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          审核文章
        </h1>
      </div>

      {/* Post Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>作者：{post.profiles?.name}</span>
              {post.families && (
                <span>家庭：{post.families.name}</span>
              )}
              <span>创建时间：{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              post.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {post.status === 'published' ? '已发布' : '草稿'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              post.review_status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : post.review_status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {post.review_status === 'approved' ? '已通过' : post.review_status === 'rejected' ? '已拒绝' : '待审核'}
            </span>
          </div>
        </div>

        {post.excerpt && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{post.excerpt}</p>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">文章内容</h3>
        <div className="prose prose-lg max-w-none">
          <MarkdownContent content={post.content} />
        </div>
      </div>

      {/* Review Actions */}
      {post.review_status === 'pending' && isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">审核操作</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleReview(true)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              通过审核
            </button>
            <button
              onClick={() => handleReview(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="w-5 h-5" />
              拒绝文章
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      {post.review_status !== 'pending' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            此文章已经{post.review_status === 'approved' ? '通过审核' : '被拒绝'}
          </p>
        </div>
      )}
    </div>
  )
}
