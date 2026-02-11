'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2, Eye, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog, useToast, EmptyState } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
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

interface PostsTableProps {
  initialPosts: Post[]
  totalCount: number
  isSuperAdmin: boolean
  currentUserId: string
}

export function PostsTable({ initialPosts, totalCount: initialTotalCount, isSuperAdmin, currentUserId }: PostsTableProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reviewFilter, setReviewFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  
  const postsPerPage = 20
  const { success, error: showError } = useToast()
  const router = useRouter()

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
      const supabase = createClient()
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deletePostId)

      if (error) throw error

      success('文章已删除')
      setDeletePostId(null)
      
      // 更新本地状态
      const newPosts = posts.filter(p => p.id !== deletePostId)
      setPosts(newPosts)
      setTotalCount(prev => prev - 1)
      router.refresh() // 刷新服务端数据
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent mb-2 tracking-tight">
            文章管理
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">共 {totalCount} 篇文章</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          新建文章
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* 搜索 */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题或 Slug..."
              className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent transition-all text-sm sm:text-base font-medium"
            />
          </div>

          {/* 发布状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent transition-all text-sm sm:text-base font-bold bg-white"
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
            className="px-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent transition-all text-sm sm:text-base font-bold bg-white"
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
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              找到 <span className="font-black text-[#FF4D94]">{filteredPosts.length}</span> 篇文章
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-b border-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">标题</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">状态</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">审核</th>
                    {isSuperAdmin && (
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">作者</th>
                    )}
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">发布时间</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">阅读</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-black text-gray-700 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-black text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:text-[#FF4D94] transition-colors">{post.title}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">/blog/{post.slug}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold ${
                          post.status === 'published' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : post.status === 'draft'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {post.review_status ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold ${
                            post.review_status === 'approved' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : post.review_status === 'rejected'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {post.review_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {post.review_status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {post.review_status === 'pending' && <Clock className="w-3 h-3" />}
                            {post.review_status === 'approved' ? '已通过' : post.review_status === 'rejected' ? '已拒绝' : '待审核'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">-</span>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 font-bold">
                          {post.profiles?.name ? `${post.profiles.name}的家庭` : '未知家庭'}
                        </td>
                      )}
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 font-medium">
                        {post.published_at ? formatDate(post.published_at) : '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 font-bold">
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {post.view_count}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <Link
                            href={`/dashboard/posts/${post.id}/edit`}
                            className="p-2 text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-xl transition-all"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {isSuperAdmin && post.review_status === 'pending' && (
                            <Link
                              href={`/dashboard/posts/${post.id}/review`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                              title="审核"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Link>
                          )}
                          {(isSuperAdmin || post.author_id === currentUserId) && (
                            <button
                              onClick={() => setDeletePostId(post.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                显示 <span className="font-black text-[#FF4D94]">{startIndex + 1}</span> - <span className="font-black text-[#FF4D94]">{Math.min(endIndex, filteredPosts.length)}</span> 条，共 <span className="font-black text-[#FF4D94]">{filteredPosts.length}</span> 条
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-bold"
                >
                  上一页
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-2 text-gray-400 text-xs sm:text-sm">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 sm:px-4 py-2 rounded-xl transition-all text-xs sm:text-sm font-bold ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                            : 'border border-gray-200 hover:bg-gray-50 hover:border-[#FF4D94]/30'
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
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-bold"
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
