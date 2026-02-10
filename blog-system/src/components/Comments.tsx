'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { LoadingSpinner } from '@/components/ui'
import { MessageCircle, Send, User, CheckCircle, XCircle, Smile, Reply, CornerDownRight } from 'lucide-react'

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
  parent_id: string | null
  user_id: string | null
  profiles?: {
    name?: string
    avatar_url?: string
  }
  replies?: Comment[]
  parent?: Comment // 父评论信息，用于显示"回复谁"
}

interface CommentsProps {
  postId: string
}

type ToastType = 'success' | 'error'

// 格式化作者名称为"XX的家庭"
function formatAuthorName(profile: any): string {
  if (!profile) return '匿名用户'
  
  if (profile.name) {
    return `${profile.name}的家庭`
  }
  
  return '匿名用户'
}

export function Comments({ postId }: CommentsProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [currentUserProfile, setCurrentUserProfile] = useState<{ id: string; name: string; avatar_url?: string } | null>(null)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
  const isLoggedIn = !!user

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

  // 获取用户 profile 信息
  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return
      
      if (!user) {
        setCurrentUserProfile(null)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setCurrentUserProfile({ 
          id: user.id, 
          name: profile.name || user.email?.split('@')[0] || '匿名用户',
          avatar_url: profile.avatar_url 
        })
      }
    }

    fetchProfile()
  }, [user, supabase])

  // 加载评论
  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(name, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // 组织评论为树形结构
      const commentsMap = new Map<string, Comment>()
      const topLevelComments: Comment[] = []
      
      // 先创建所有评论的映射
      data?.forEach((comment: any) => {
        commentsMap.set(comment.id, { ...comment, replies: [] })
      })
      
      // 然后组织父子关系
      data?.forEach((comment: any) => {
        const commentWithReplies = commentsMap.get(comment.id)!
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id)
          if (parent) {
            // 保存父评论信息用于显示"回复谁"
            commentWithReplies.parent = parent
            parent.replies = parent.replies || []
            parent.replies.push(commentWithReplies)
          }
        } else {
          topLevelComments.push(commentWithReplies)
        }
      })
      
      setComments(topLevelComments)
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
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, name: authorName })
    textareaRef.current?.focus()
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

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
        
        userName = userProfile?.name || user.email?.split('@')[0] || '匿名用户'
        userEmail = user.email || ''
      }

      const commentData = {
        post_id: postId,
        content: content.trim(),
        author_name: userName,
        author_email: userEmail,
        user_id: user?.id || null,
        parent_id: replyingTo?.id || null,
        status: isSuperAdmin ? 'approved' : 'pending' as const
      }

      const { error } = await supabase
        .from('comments')
        .insert([commentData])

      if (error) throw error

      showToast('success', isSuperAdmin ? (replyingTo ? '回复已发布' : '评论已发布') : '评论已提交，等待审核后显示')
      setContent('')
      setReplyingTo(null)
      if (!isLoggedIn) {
        setAuthorName('')
        setAuthorEmail('')
      }
      
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

  const renderComment = (comment: Comment, depth = 0) => {
    const maxDepth = 6
    const indentLevel = Math.min(depth, maxDepth)
    const isGuest = !comment.user_id // 判断是否是游客
    
    return (
      <div key={comment.id}>
        <div 
          className="flex gap-3 py-3 hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${12 + indentLevel * 20}px` }}
        >
          {/* Avatar */}
          {comment.profiles?.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.name || 'User'}
              className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm ${
              isGuest 
                ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              {comment.profiles?.name ? (
                <span className="text-white font-semibold text-xs">
                  {comment.profiles.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.profiles ? formatAuthorName(comment.profiles) : comment.author_name}
              </span>
              
              {/* 游客标识 */}
              {isGuest && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  游客
                </span>
              )}
              
              {/* 显示"回复谁" */}
              {comment.parent && (
                <>
                  <Reply className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    回复 <span className="font-medium text-purple-600">
                      {comment.parent.profiles ? formatAuthorName(comment.parent.profiles) : comment.parent.author_name}
                    </span>
                  </span>
                </>
              )}
              
              <span className="text-xs text-gray-400">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {/* Content */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-sm mb-2">
              {comment.content}
            </p>
            
            {/* Reply Button */}
            <button
              onClick={() => handleReply(comment.id, comment.profiles?.name || comment.author_name)}
              className="text-xs text-gray-500 hover:text-purple-600 font-medium inline-flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
            >
              <Reply className="w-3 h-3" />
              回复
            </button>
          </div>
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const countComments = (comments: Comment[]): number => {
    return comments.reduce((acc, comment) => {
      return acc + 1 + (comment.replies ? countComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countComments(comments)

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

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">评论</h2>
              <p className="text-xs text-gray-500">{totalComments} 条评论</p>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
          <div className="space-y-3">
            {/* Reply Indicator */}
            {replyingTo && (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-purple-700">
                  <Reply className="w-3.5 h-3.5" />
                  <span>回复 <strong>{replyingTo.name}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="text-purple-600 hover:text-purple-700 text-xs font-medium hover:bg-white px-2 py-1 rounded transition-colors"
                >
                  取消
                </button>
              </div>
            )}

            {!isLoggedIn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="authorName" className="block text-xs font-medium text-gray-700 mb-1.5">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入您的姓名"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="authorEmail" className="block text-xs font-medium text-gray-700 mb-1.5">
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    id="authorEmail"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1.5">
                {replyingTo ? '回复内容 *' : '评论内容 *'}
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder={replyingTo ? "输入你的回复..." : "分享你的想法..."}
                  required
                />
                
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="添加表情"
                >
                  <Smile className="w-4 h-4" />
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

            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-gray-500">
                {isLoggedIn ? (
                  <span>以 <strong>{currentUserProfile?.name}</strong> 的身份{replyingTo ? '回复' : '评论'}</span>
                ) : (
                  <span>评论需要审核后才会显示</span>
                )}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{replyingTo ? '发表回复' : '发表评论'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">还没有评论</p>
              <p className="text-gray-400 text-xs mt-1">成为第一个评论的人吧！</p>
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
