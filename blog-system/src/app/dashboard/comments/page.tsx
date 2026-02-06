'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react'
import { ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string | null
  post_id: string
  author_name: string
  author_email: string
  profiles: {
    name: string
    avatar_url: string | null
    role: string
  } | null
  posts: {
    title: string
    slug: string
    author_id: string
  } | null
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const supabase = createClient()
  const { success, error: showError } = useToast()

  // 检查当前用户权限
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, family_id')
          .eq('id', user.id)
          .maybeSingle()
        
        const isAdmin = profile?.role === 'admin' && 
          profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
        setIsSuperAdmin(isAdmin)
      }
    }
    checkUser()
  }, [])

  // 加载评论列表
  const loadComments = async () => {
    try {
      // 构建查询
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles(name, avatar_url, role),
          posts!inner(title, slug, author_id)
        `)
        .order('created_at', { ascending: false })
      
      // 如果不是超级管理员，只显示自己文章的评论
      if (!isSuperAdmin && currentUserId) {
        query = query.eq('posts.author_id', currentUserId)
      }

      const { data, error } = await query

      if (error) throw error
      setComments(data || [])
    } catch (err) {
      showError('加载评论失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId !== null) {
      loadComments()
    }
  }, [currentUserId, isSuperAdmin])

  // 过滤评论
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredComments(comments)
    } else {
      setFilteredComments(comments.filter(c => c.status === statusFilter))
    }
  }, [comments, statusFilter])

  // 批准评论
  const handleApprove = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', commentId)

      if (error) throw error

      success('评论已批准')
      loadComments()
    } catch (err) {
      showError('批准评论失败')
      console.error(err)
    }
  }

  // 拒绝评论
  const handleReject = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', commentId)

      if (error) throw error

      success('评论已拒绝')
      loadComments()
    } catch (err) {
      showError('拒绝评论失败')
      console.error(err)
    }
  }

  // 删除评论
  const handleDelete = async () => {
    if (!commentToDelete) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentToDelete.id)

      if (error) throw error

      success('评论已删除')
      setIsDeleteDialogOpen(false)
      loadComments()
    } catch (err) {
      showError('删除评论失败')
      console.error(err)
    }
  }

  // 批量批准
  const handleBulkApprove = async () => {
    if (selectedComments.size === 0) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .in('id', Array.from(selectedComments))

      if (error) throw error

      success(`已批准 ${selectedComments.size} 条评论`)
      setSelectedComments(new Set())
      loadComments()
    } catch (err) {
      showError('批量批准失败')
      console.error(err)
    }
  }

  // 批量拒绝
  const handleBulkReject = async () => {
    if (selectedComments.size === 0) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .in('id', Array.from(selectedComments))

      if (error) throw error

      success(`已拒绝 ${selectedComments.size} 条评论`)
      setSelectedComments(new Set())
      loadComments()
    } catch (err) {
      showError('批量拒绝失败')
      console.error(err)
    }
  }

  // 批量删除
  const handleBulkDelete = async () => {
    if (selectedComments.size === 0) return

    setIsBulkDeleting(true)

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .in('id', Array.from(selectedComments))

      if (error) throw error

      success(`已删除 ${selectedComments.size} 条评论`)
      setSelectedComments(new Set())
      loadComments()
    } catch (err) {
      showError('批量删除失败')
      console.error(err)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // 切换选择
  const toggleSelect = (commentId: string) => {
    const newSelected = new Set(selectedComments)
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId)
    } else {
      newSelected.add(commentId)
    }
    setSelectedComments(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedComments.size === filteredComments.length) {
      setSelectedComments(new Set())
    } else {
      setSelectedComments(new Set(filteredComments.map(c => c.id)))
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  // 获取状态徽章样式
  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      approved: '已批准',
      pending: '待审核',
      rejected: '已拒绝',
    }
    return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = {
    total: comments.length,
    approved: comments.filter(c => c.status === 'approved').length,
    pending: comments.filter(c => c.status === 'pending').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          评论管理
        </h1>
        <p className="text-gray-600">管理所有文章评论</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">总评论数</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-gray-600">已批准</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Filter className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-gray-600">待审核</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <div className="text-sm text-gray-600">已拒绝</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>

        {selectedComments.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              已选择 {selectedComments.size} 条
            </span>
            <button
              onClick={handleBulkApprove}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              批量批准
            </button>
            <button
              onClick={handleBulkReject}
              className="px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              批量拒绝
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isBulkDeleting ? '删除中...' : '批量删除'}
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="暂无评论"
          description={statusFilter === 'all' ? '还没有收到任何评论' : `没有${getStatusBadge(statusFilter).label}的评论`}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100">
          {/* Select All */}
          <div className="px-6 py-3 border-b bg-gray-50 flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedComments.size === filteredComments.length && filteredComments.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">全选</span>
          </div>

          <div className="divide-y">
            {filteredComments.map((comment) => {
              const badge = getStatusBadge(comment.status)
              return (
                <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedComments.has(comment.id)}
                      onChange={() => toggleSelect(comment.id)}
                      className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {comment.profiles?.avatar_url ? (
                        <img
                          src={comment.profiles.avatar_url}
                          alt={comment.profiles.name || '用户'}
                          className="w-12 h-12 rounded-full ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
                          {comment.user_id 
                            ? (comment.profiles?.name || '').charAt(0).toUpperCase()
                            : comment.author_name?.charAt(0).toUpperCase() || '?'
                          }
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {comment.user_id ? (comment.profiles?.name || '用户') : comment.author_name}
                          </span>
                          {comment.profiles?.role && (
                            <span className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              comment.profiles.role === 'admin' && 'bg-purple-100 text-purple-700',
                              comment.profiles.role === 'editor' && 'bg-blue-100 text-blue-700',
                              comment.profiles.role === 'author' && 'bg-green-100 text-green-700'
                            )}>
                              {comment.profiles.role === 'admin' ? '管理员' : 
                               comment.profiles.role === 'editor' ? '编辑' : '作者'}
                            </span>
                          )}
                          {!comment.user_id && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              访客
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400">·</span>
                        <span className="text-sm text-gray-600">{formatDate(comment.created_at)}</span>
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', badge.style)}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Email (for anonymous users) */}
                      {!comment.user_id && comment.author_email && (
                        <div className="text-sm text-gray-500 mb-2">
                          📧 {comment.author_email}
                        </div>
                      )}

                      {/* Comment Content */}
                      <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>

                      {/* Post Link */}
                      {comment.posts && (
                        <Link
                          href={`/blog/${comment.posts.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-pink-600 transition-colors"
                        >
                          <span>评论于: {comment.posts.title}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(comment.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="批准"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(comment.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="拒绝"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setCommentToDelete(comment)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="删除评论"
        message={`确定要删除这条评论吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
