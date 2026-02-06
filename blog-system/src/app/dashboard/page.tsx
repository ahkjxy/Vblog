import { createClient } from '@/lib/supabase/server'
import { FileText, Eye, MessageSquare, Users, Plus, ArrowRight, FolderOpen, Tag, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { QuickReviewActions } from '@/components/dashboard/QuickReviewActions'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, family_id')
    .eq('id', user?.id)
    .maybeSingle()

  // 检查是否是超级管理员
  const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

  // Get statistics - 根据权限过滤
  // 构建统计查询
  let postsCountQuery = supabase.from('posts').select('*', { count: 'exact', head: true })
  let commentsCountQuery = supabase.from('comments').select('*', { count: 'exact', head: true })
  let viewsQuery = supabase.from('posts').select('view_count')
  
  // 如果不是超级管理员，只统计自己的数据
  if (!isSuperAdmin) {
    postsCountQuery = postsCountQuery.eq('author_id', user?.id)
    viewsQuery = viewsQuery.eq('author_id', user?.id)
    
    // 评论：只统计自己文章的评论
    // 需要通过 posts 表关联
    commentsCountQuery = supabase
      .from('comments')
      .select('*, posts!inner(author_id)', { count: 'exact', head: true })
      .eq('posts.author_id', user?.id)
  }
  
  const [
    { count: totalPosts },
    { count: totalComments },
    { data: totalViews }
  ] = await Promise.all([
    postsCountQuery,
    commentsCountQuery,
    viewsQuery
  ])

  // 用户数统计：只有超级管理员才显示
  let totalUsers = 0
  if (isSuperAdmin) {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    totalUsers = count || 0
  }

  const viewCount = totalViews?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

  // Get recent posts with author info
  // 非超级管理员只能看到自己的文章
  let recentPostsQuery = supabase
    .from('posts')
    .select(`
      id, 
      title, 
      status, 
      review_status,
      updated_at, 
      view_count,
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .order('updated_at', { ascending: false })
    .limit(5)
  
  // 如果不是超级管理员，只显示自己的文章
  if (!isSuperAdmin) {
    recentPostsQuery = recentPostsQuery.eq('author_id', user?.id)
  }
  
  const { data: recentPosts } = await recentPostsQuery

  // Get pending posts (only for super admin)
  let pendingPosts = null
  if (isSuperAdmin) {
    const { data } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        status,
        review_status,
        created_at,
        profiles!posts_author_id_fkey(name, avatar_url)
      `)
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
    pendingPosts = data
  }

  // Get pending comments (only for super admin)
  let pendingComments = null
  if (isSuperAdmin) {
    const { data } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        author_name,
        created_at,
        post_id,
        posts!inner(title, slug)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
    pendingComments = data
  }

  const stats = {
    totalPosts: totalPosts || 0,
    totalViews: viewCount,
    totalComments: totalComments || 0,
    totalUsers: totalUsers || 0,
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            欢迎回来，{profile?.name || user?.email?.split('@')[0] || '用户'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg">查看数据统计和最新动态</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>新建文章</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        <div className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">文章</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPosts}</div>
            <div className="text-sm text-gray-600">{isSuperAdmin ? '总文章数' : '我的文章'}</div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-pink-100 hover:shadow-xl hover:border-pink-200 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-xs font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">浏览</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{isSuperAdmin ? '总浏览量' : '我的浏览量'}</div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-indigo-100 hover:shadow-xl hover:border-indigo-200 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">评论</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalComments}</div>
            <div className="text-sm text-gray-600">{isSuperAdmin ? '总评论数' : '我的评论数'}</div>
          </div>
        </div>

        {/* 只有超级管理员才显示用户统计 */}
        {isSuperAdmin && (
          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-fuchsia-100 hover:shadow-xl hover:border-fuchsia-200 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-100 to-pink-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-fuchsia-600" />
                </div>
                <span className="text-xs font-medium text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full">用户</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">注册用户</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">最近文章</h2>
              <p className="text-sm text-gray-600">{isSuperAdmin ? '最近发布的内容' : '您最近发布的内容'}</p>
            </div>
            <Link
              href="/dashboard/posts"
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-pink-600 transition-colors"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentPosts && recentPosts.length > 0 ? (
            recentPosts.map((post: any) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all group"
              >
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="flex-1"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium text-purple-600">
                      {formatAuthorName(post.profiles)}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></span>
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </span>
                    {post.review_status && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.review_status === 'approved' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : post.review_status === 'pending'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {post.review_status === 'approved' ? '已审核' : post.review_status === 'pending' ? '待审核' : '已拒绝'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count} 浏览
                    </span>
                    <span>{formatDate(post.updated_at)}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && post.review_status === 'pending' && (
                    <QuickReviewActions
                      type="post"
                      id={post.id}
                    />
                  )}
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>还没有文章，开始创作第一篇吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Posts (Admin Only) */}
      {isSuperAdmin && pendingPosts && pendingPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">待审核文章</h2>
                  <p className="text-sm text-gray-600">需要您审核的文章</p>
                </div>
              </div>
              <Link
                href="/dashboard/posts"
                className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingPosts.map((post: any) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-yellow-50/50 transition-all group"
              >
                <Link href={`/dashboard/posts/${post.id}/review`} className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium text-purple-600">
                      {formatAuthorName(post.profiles)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      <AlertCircle className="w-3 h-3" />
                      待审核
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <QuickReviewActions type="post" id={post.id} />
                  <Link href={`/dashboard/posts/${post.id}/review`}>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-all" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Comments (Admin Only) */}
      {isSuperAdmin && pendingComments && pendingComments.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">待审核评论</h2>
                  <p className="text-sm text-gray-600">需要您审核的评论</p>
                </div>
              </div>
              <Link
                href="/dashboard/comments"
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingComments.map((comment: any) => (
              <div
                key={comment.id}
                className="flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{comment.author_name}</span>
                    <span className="text-sm text-gray-500">评论了</span>
                    <Link 
                      href={`/blog/${comment.posts?.slug}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 truncate max-w-xs"
                    >
                      {comment.posts?.title}
                    </Link>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <AlertCircle className="w-3 h-3" />
                      待审核
                    </span>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <QuickReviewActions type="comment" id={comment.id} />
                  <Link href="/dashboard/comments">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - 只有超级管理员才显示 */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/categories"
            className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">管理分类</h3>
              <p className="text-sm text-gray-600 mb-4">组织和管理文章分类</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                <span>前往管理</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/tags"
            className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-pink-100 hover:shadow-xl hover:border-pink-200 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                <Tag className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">管理标签</h3>
              <p className="text-sm text-gray-600 mb-4">添加和编辑文章标签</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-pink-600">
                <span>前往管理</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/comments"
            className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-indigo-100 hover:shadow-xl hover:border-indigo-200 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">管理评论</h3>
              <p className="text-sm text-gray-600 mb-4">审核和回复用户评论</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <span>前往管理</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
