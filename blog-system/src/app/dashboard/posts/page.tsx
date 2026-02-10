'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search, Trash2, Eye, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  review_status?: 'pending' | 'approved' | 'rejected'
  author_id: string
  published_at: string | null
  view_count: number
  created_at: string
  profiles: {
    name: string
  }
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reviewFilter, setReviewFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  
  const postsPerPage = 20
  const supabase = createClient()
  const router = useRouter()
  const { success, error: showError } = useToast()

  // 加载文章列表
  const loadPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setCurrentUserId(user.id)

      // 获取当前用户的 profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile) {
        setLoading(false)
        return
      }

      // 检查是否是超级管理员
      const isAdmin = profile.role === 'admin' && 
        profile.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
      setIsSuperAdmin(isAdmin)

      // 构建查询
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // 如果不是超级管理员，只显示自己的文章
      if (!isAdmin) {
        query = query.eq('author_id', user.id)
      }

      const { data, error, count } = await query

      if (error) throw error

      setPosts(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      showError('加载文章列表失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  // 搜索和过滤
  useEffect(() => {
    let result = posts

    // 搜索
    if (searchQuery) {
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(post => post.status === statusFilter)
    }

    // 审核状态筛选
    if (reviewFilter !== 'all') {
      result = result.filter(post => post.review_status === reviewFilter)
    }

    setFilteredPosts(result)
    setCurrentPage(1) // 重置到第一页
  }, [posts, searchQuery, statusFilter, reviewFilter])

  // 分页
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  // 删除文章
  const handleDelete = async () => {
    if (!deletePostId) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deletePostId)

      if (error) throw error

      success('文章已删除')
      setDeletePostId(null)
      loadPosts()
    } catch (err) {
      showError('删除文章失败')
      console.error(err)
    }
  }

  // 生成页码
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            文章管理
          </h1>
          <p className="text-gray-600">共 {totalCount} 篇文章</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          新建文章
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题或 Slug..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 发布状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>

          {/* 审核状态筛选 */}
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">全部审核状态</option>
            <option value="approved">已通过</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>

        {/* 筛选结果统计 */}
        {(searchQuery || statusFilter !== 'all' || reviewFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              找到 <span className="font-bold text-purple-600">{filteredPosts.length}</span> 篇文章
              {searchQuery && ` · 搜索: "${searchQuery}"`}
              {statusFilter !== 'all' && ` · 状态: ${statusFilter}`}
              {reviewFilter !== 'all' && ` · 审核: ${reviewFilter}`}
            </p>
          </div>
        )}
      </div>

      {/* 文章列表 */}
      {currentPosts.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="暂无文章"
          description={searchQuery || statusFilter !== 'all' || reviewFilter !== 'all' ? '尝试调整筛选条件' : '开始创建你的第一篇文章'}
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">标题</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">审核</th>
                    {isSuperAdmin && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">作者</th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">发布时间</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">阅读</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 line-clamp-2">{post.title}</div>
                        <div className="text-xs text-gray-500 mt-1">/blog/{post.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {post.review_status ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            post.review_status === 'approved' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : post.review_status === 'rejected'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {post.review_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {post.review_status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {post.review_status === 'pending' && <Clock className="w-3 h-3" />}
                            {post.review_status === 'approved' ? '已通过' : post.review_status === 'rejected' ? '已拒绝' : '待审核'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {post.profiles?.name ? `${post.profiles.name}的家庭` : '未知家庭'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.published_at ? formatDate(post.published_at) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          {post.view_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/posts/${post.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {isSuperAdmin && post.review_status === 'pending' && (
                            <Link
                              href={`/dashboard/posts/${post.id}/review`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="审核"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Link>
                          )}
                          {(isSuperAdmin || post.author_id === currentUserId) && (
                            <button
                              onClick={() => setDeletePostId(post.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                显示 {startIndex + 1} - {Math.min(endIndex, filteredPosts.length)} 条，共 {filteredPosts.length} 条
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDelete}
        title="删除文章"
        message="确定要删除这篇文章吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
