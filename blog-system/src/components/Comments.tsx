'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui'
import { MessageCircle, Send, User, CheckCircle, XCircle, Smile } from 'lucide-react'

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠',
  '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁',
  '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
  '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
  '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
  '👍', '👎', '👏', '🙌', '👌', '✌️', '🤞', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋',
  '🤚', '🖐️', '🖖', '👋', '🤝', '💪', '🙏', '✍️',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  '⭐', '🌟', '✨', '⚡', '🔥', '💥', '💫', '💦',
  '💨', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️',
  '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️'
]

interface Comment {
  id: string
  content: string
  created_at: string
  author_name: string
  author_email: string
  profiles?: {
    name?: string
    avatar_url?: string
  }
}

interface CommentsProps {
  postId: string
}

type ToastType = 'success' | 'error'

export function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar_url?: string } | null>(null)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  // Toast helper
  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        // 获取用户资料
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setCurrentUser({ 
            id: user.id, 
            name: profile.name || user.email?.split('@')[0] || '匿名用户',
            avatar_url: profile.avatar_url 
          })
        }
      }
    }
    checkUser()
  }, [])

  // 加载评论
  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(name, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (err) {
      console.error('加载评论失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + emoji + content.substring(end)
    
    setContent(newContent)
    setShowEmojiPicker(false)
    
    // 将光标移到插入的表情后面
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      showToast('error', '请输入评论内容')
      return
    }

    if (!isLoggedIn && (!authorName.trim() || !authorEmail.trim())) {
      showToast('error', '请填写姓名和邮箱')
      return
    }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 获取当前用户的 profile 信息
      let isSuperAdmin = false
      let userName = authorName.trim()
      let userEmail = authorEmail.trim()
      
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role, family_id, name')
          .eq('id', user.id)
          .maybeSingle()

        isSuperAdmin = userProfile?.role === 'admin' && 
                      userProfile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
        
        // 使用 profile 中的 name，如果没有则使用 email 前缀
        userName = userProfile?.name || user.email?.split('@')[0] || '匿名用户'
        userEmail = user.email || ''
      }

      const commentData = {
        post_id: postId,
        content: content.trim(),
        author_name: userName,
        author_email: userEmail,
        user_id: user?.id || null,
        status: isSuperAdmin ? 'approved' : 'pending' as const // 超级管理员自动通过审核
      }

      const { error } = await supabase
        .from('comments')
        .insert([commentData])

      if (error) throw error

      showToast('success', isSuperAdmin ? '评论已发布' : '评论已提交，等待审核后显示')
      setContent('')
      if (!isLoggedIn) {
        setAuthorName('')
        setAuthorEmail('')
      }
      
      // 如果是超级管理员，立即刷新评论列表
      if (isSuperAdmin) {
        loadComments()
      }
    } catch (err) {
      console.error('提交评论失败:', err)
      showToast('error', '提交评论失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes === 0 ? '刚刚' : `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days} 天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">评论</h2>
            <p className="text-sm text-gray-600">{comments.length} 条评论</p>
          </div>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="space-y-4">
            {!isLoggedIn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入您的姓名"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    id="authorEmail"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                评论内容 *
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="分享你的想法..."
                  required
                />
                
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-3 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="添加表情"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-10 w-80 max-h-64 overflow-y-auto"
                  >
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJIS.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="text-2xl hover:bg-purple-50 rounded p-1 transition-colors"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                {isLoggedIn ? (
                  <span>以 <strong>{currentUser?.name}</strong> 的身份评论</span>
                ) : (
                  <span>评论需要审核后才会显示</span>
                )}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>发表评论</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">还没有评论</p>
            <p className="text-gray-400 text-sm mt-2">成为第一个评论的人吧！</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Avatar */}
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.name || 'User'}
                    className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                    {comment.profiles?.name ? (
                      <span className="text-white font-semibold text-sm">
                        {comment.profiles.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {comment.profiles?.name || comment.author_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-base">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
