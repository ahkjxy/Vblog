import { createClient } from '@/lib/supabase/server'
import { FileText, Eye, MessageSquare, Users, Plus, ArrowRight, FolderOpen, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user?.id)
    .single()

  // Get statistics
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalComments },
    { count: totalUsers },
    { data: totalViews }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('view_count')
  ])

  const viewCount = totalViews?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, status, updated_at, view_count')
    .order('updated_at', { ascending: false })
    .limit(5)

  const stats = {
    totalPosts: totalPosts || 0,
    totalViews: viewCount,
    totalComments: totalComments || 0,
    totalUsers: totalUsers || 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            欢迎回来，{profile?.name}
          </h1>
          <p className="text-gray-600 text-lg">这是您的内容管理概览</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>新建文章</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="text-sm text-gray-600">总文章数</div>
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
            <div className="text-sm text-gray-600">总浏览量</div>
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
            <div className="text-sm text-gray-600">总评论数</div>
          </div>
        </div>

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
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">最近文章</h2>
              <p className="text-sm text-gray-600">您最近发布的内容</p>
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
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/dashboard/posts/${post.id}/edit`}
                className="flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all group"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count} 浏览
                    </span>
                    <span>{formatDate(post.updated_at)}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>还没有文章，开始创作第一篇吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
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
    </div>
  )
}
