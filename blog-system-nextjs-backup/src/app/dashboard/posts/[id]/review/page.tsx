import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MarkdownContent } from '@/components/MarkdownContent'
import { ReviewActions } from '@/components/dashboard/ReviewActions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. 验证登录
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/unified')
  }

  // 2. 验证超级管理员权限
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.id)
    .maybeSingle()

  const isSuperAdmin = profile?.role === 'admin' &&
    profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  // 3. 获取文章
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_author_id_fkey (
        name,
        family_id
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (!post) {
    notFound()
  }

  // 4. 获取家庭信息
  let familyName: string | null = null
  if (post.profiles?.family_id) {
    const { data: familyData } = await supabase
      .from('families')
      .select('name')
      .eq('id', post.profiles.family_id)
      .maybeSingle()
    familyName = familyData?.name || null
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
              {familyName && (
                <span>家庭：{familyName}</span>
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

      {/* Review Actions (Client Component) */}
      <ReviewActions postId={post.id} reviewStatus={post.review_status || 'pending'} />
    </div>
  )
}
