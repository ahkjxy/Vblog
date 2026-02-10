'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, ChevronLeft, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface FeedbackMessage {
  id: string
  subject: string
  message: string
  category: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  profile_id: string
  family_id: string
  family?: {
    name: string
  }
  profile?: {
    name: string
    family_id: string
  }
}

interface FeedbackReply {
  id: string
  message: string
  is_admin_reply: boolean
  created_at: string
  profile_id: string
}

interface FeedbackManagementProps {
  userId: string
  userName: string
  familyId: string
  isSuperAdmin: boolean
}

export function FeedbackManagement({ userId, userName, familyId, isSuperAdmin }: FeedbackManagementProps) {
  const [feedbackList, setFeedbackList] = useState<FeedbackMessage[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackMessage | null>(null)
  const [replies, setReplies] = useState<FeedbackReply[]>([])
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10
  
  // 新建反馈表单状态
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  
  useEffect(() => {
    loadFeedbackList()
  }, [filter, currentPage])

  const loadFeedbackList = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // 先获取总数
      let countQuery = supabase
        .from('feedback_messages')
        .select('*', { count: 'exact', head: true })

      // 超级管理员可以看到所有反馈
      // 普通家长只能看到自己发送的反馈
      if (!isSuperAdmin) {
        countQuery = countQuery.eq('profile_id', userId)
      }

      if (filter !== 'all') {
        countQuery = countQuery.eq('status', filter)
      }

      const { count } = await countQuery
      setTotalCount(count || 0)

      // 获取当前页数据，关联 families 和 profiles 表
      let query = supabase
        .from('feedback_messages')
        .select(`
          *,
          family:families(name),
          profile:profiles(name, family_id)
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

      // 超级管理员可以看到所有反馈
      // 普通家长只能看到自己发送的反馈
      if (!isSuperAdmin) {
        query = query.eq('profile_id', userId)
      }

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setFeedbackList(data || [])
    } catch (error) {
      console.error('Load feedback error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeedbackDetail = async (feedback: FeedbackMessage) => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    setSelectedFeedback(feedback)
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('feedback_replies')
        .select('*')
        .eq('feedback_id', feedback.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (error) {
      console.error('Load replies error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!supabase) return
    
    if (!replyMessage.trim() || !selectedFeedback) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('feedback_replies').insert({
        feedback_id: selectedFeedback.id,
        family_id: selectedFeedback.family_id,
        profile_id: userId,
        message: replyMessage.trim(),
        is_admin_reply: true,
      })

      if (error) throw error

      setReplyMessage('')
      loadFeedbackDetail(selectedFeedback)
      
      // 如果状态是待处理，自动更新为处理中
      if (selectedFeedback.status === 'pending') {
        await handleUpdateStatus('in_progress')
      }
    } catch (error) {
      console.error('Send reply error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!supabase) return
    
    if (!selectedFeedback) return

    try {
      const { error } = await supabase
        .from('feedback_messages')
        .update({ status })
        .eq('id', selectedFeedback.id)

      if (error) throw error

      setSelectedFeedback({ ...selectedFeedback, status: status as any })
      loadFeedbackList()
    } catch (error) {
      console.error('Update status error:', error)
    }
  }

  const handleCreateFeedback = async () => {
    if (!supabase) return
    
    if (!newSubject.trim() || !newMessage.trim()) {
      alert('请填写主题和消息内容')
      return
    }

    setSubmitting(true)
    try {
      // 普通家长发送反馈时，使用超级管理员的 family_id
      const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
      
      const { error } = await supabase
        .from('feedback_messages')
        .insert({
          family_id: SUPER_ADMIN_FAMILY_ID, // 发送给超级管理员家庭
          profile_id: userId,
          subject: newSubject.trim(),
          message: newMessage.trim(),
          category: newCategory,
          priority: newPriority,
          status: 'pending'
        })

      if (error) throw error

      // 重置表单
      setNewSubject('')
      setNewMessage('')
      setNewCategory('general')
      setNewPriority('normal')
      setShowCreateForm(false)
      
      // 重置到第一页并刷新列表
      setCurrentPage(1)
      loadFeedbackList()
    } catch (error) {
      console.error('Create feedback error:', error)
      alert('创建反馈失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: '待处理' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle, label: '处理中' },
      resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: '已解决' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: '已关闭' },
    }
    const style = styles[status as keyof typeof styles] || styles.pending
    const Icon = style.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: { bg: 'bg-rose-100', text: 'text-rose-700', label: '紧急' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', label: '高' },
      normal: { bg: 'bg-blue-100', text: 'text-blue-700', label: '普通' },
      low: { bg: 'bg-gray-100', text: 'text-gray-700', label: '低' },
    }
    const style = styles[priority as keyof typeof styles] || styles.normal
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    )
  }

  if (selectedFeedback) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <button
            onClick={() => setSelectedFeedback(null)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回列表
          </button>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedFeedback.subject}</h2>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {getStatusBadge(selectedFeedback.status)}
                {getPriorityBadge(selectedFeedback.priority)}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {selectedFeedback.category}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedFeedback.message}</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>创建于: {new Date(selectedFeedback.created_at).toLocaleString('zh-CN')}</span>
                  {isSuperAdmin && selectedFeedback.profile?.name && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-purple-600">
                        提交人: {selectedFeedback.profile.name}
                      </span>
                    </>
                  )}
                </div>
                {isSuperAdmin && selectedFeedback.profile?.family_id && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-gray-500 break-all">
                      🏠 {selectedFeedback.profile.family_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <select
              value={selectedFeedback.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pending">待处理</option>
              <option value="in_progress">处理中</option>
              <option value="resolved">已解决</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        </div>

        {/* Replies */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-700">回复记录 ({replies.length})</h3>
          
          {replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">暂无回复</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className={`p-4 rounded-xl ${
                  reply.is_admin_reply
                    ? 'bg-purple-50 border border-purple-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    reply.is_admin_reply ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gray-400'
                  }`}>
                    {reply.is_admin_reply ? '管' : '用'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">
                        {reply.is_admin_reply ? '管理员' : '用户'}
                      </span>
                      {reply.is_admin_reply && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white">
                          官方回复
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(reply.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input - 只有超级管理员可以回复 */}
        {isSuperAdmin && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <label className="block text-sm font-bold text-gray-700 mb-2">添加回复</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="输入您的回复..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={handleSendReply}
              disabled={submitting || !replyMessage.trim()}
              className="mt-3 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  发送回复
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filter Tabs */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待处理' },
              { value: 'in_progress', label: '处理中' },
              { value: 'resolved', label: '已解决' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* 普通家长可以创建新反馈 */}
          {!isSuperAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              新建反馈
            </button>
          )}
        </div>
      </div>

      {/* Feedback List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">暂无反馈消息</p>
            <p className="text-sm text-gray-400 mt-1">用户提交的反馈将显示在这里</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {feedbackList.map((feedback) => (
                <button
                  key={feedback.id}
                  onClick={() => loadFeedbackDetail(feedback)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left border border-gray-200 hover:border-purple-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{feedback.subject}</h3>
                        {getStatusBadge(feedback.status)}
                        {getPriorityBadge(feedback.priority)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{feedback.message}</p>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{new Date(feedback.created_at).toLocaleDateString('zh-CN')}</span>
                          {isSuperAdmin && feedback.profile?.name && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-purple-600">
                                {feedback.profile.name}
                              </span>
                            </>
                          )}
                        </div>
                        {isSuperAdmin && feedback.profile?.family_id && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-gray-500 break-all">
                              🏠 {feedback.profile.family_id}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 shrink-0" />
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  共 {totalCount} 条，第 {currentPage} / {Math.ceil(totalCount / pageSize)} 页
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 创建反馈弹窗 */}
      {showCreateForm && !isSuperAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">新建反馈</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="简要描述您的问题或建议"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general">一般反馈</option>
                    <option value="bug">错误报告</option>
                    <option value="feature">功能建议</option>
                    <option value="question">使用咨询</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">详细说明</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="请详细描述您的问题、建议或遇到的情况..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateFeedback}
                  disabled={submitting || !newSubject.trim() || !newMessage.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      提交反馈
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
