'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Mail, ExternalLink, Sparkles, HelpCircle, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface UserProfile {
  id: string
  family_id: string | null
}

interface FeedbackMessage {
  id: string
  message: string
  created_at: string
  status: string
}

interface FeedbackReply {
  feedback_id: string
  message: string
  created_at: string
}

const FAQ_ITEMS = [
  {
    question: '如何开始使用元气银行？',
    answer: '访问 blog.familybank.chat 即可免费体验，无需注册。您可以创建家庭、添加成员、设置任务和奖励。'
  },
  {
    question: '元气银行和博客系统是什么关系？',
    answer: '元气银行是家庭积分管理系统，博客系统用于分享使用经验和家庭管理智慧。两个系统共享同一个账号，登录后可以在两个系统间无缝切换。'
  },
  {
    question: '支持哪些平台？',
    answer: '元气银行支持网页版和安卓应用。博客系统支持所有现代浏览器。iOS 版本正在开发中，敬请期待！'
  },
  {
    question: '如何在博客和元气银行之间切换？',
    answer: '登录后，点击右上角用户菜单，选择"进入元气银行后台"或"进入 Blog 后台"即可快速切换。两个系统使用相同的账号。'
  },
  {
    question: '如何联系技术支持？',
    answer: '您可以通过邮箱 ahkjxy@qq.com 联系我们，我们会在24小时内回复。'
  },
  {
    question: '数据安全吗？',
    answer: '我们使用 Supabase 提供的企业级安全保障，所有数据都经过加密存储和传输。'
  }
]

// 全局事件，用于从外部打开聊天窗口
export const openCustomerSupport = () => {
  window.dispatchEvent(new CustomEvent('openCustomerSupport'))
}

export function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '你好！我是元气银行智能助手 👋\n\n有什么可以帮助你的吗？你可以：\n• 点击下方常见问题快速了解\n• 直接输入你的问题\n• 联系人工客服',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [showFAQ, setShowFAQ] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      
      if (user) {
        // 获取用户 profile 信息（profiles 表的 id 就是 auth.users 的 id）
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, family_id')
          .eq('id', user.id)
          .maybeSingle()
        
        if (profile) {
          setUserProfile(profile)
        }
      }
    }
    
    checkAuth()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // 加载历史消息
  useEffect(() => {
    const loadHistory = async () => {
      if (!isLoggedIn || !userProfile || historyLoaded) return

      setIsLoadingHistory(true)
      
      try {
        // 获取用户的反馈消息
        const { data: feedbacks } = await supabase
          .from('feedback_messages')
          .select(`
            id,
            message,
            created_at,
            status
          `)
          .eq('profile_id', userProfile.id)
          .order('created_at', { ascending: true })
          .limit(20)

        if (!feedbacks || feedbacks.length === 0) {
          setHistoryLoaded(true)
          setIsLoadingHistory(false)
          return
        }

        // 获取所有反馈的回复
        const feedbackIds = feedbacks.map((f: FeedbackMessage) => f.id)
        const { data: replies } = await supabase
          .from('feedback_replies')
          .select('feedback_id, message, created_at')
          .in('feedback_id', feedbackIds)
          .order('created_at', { ascending: true })

        // 合并消息和回复
        const historyMessages: Message[] = []
        
        feedbacks.forEach((feedback: FeedbackMessage) => {
          // 添加用户消息
          historyMessages.push({
            id: feedback.id,
            type: 'user',
            content: feedback.message,
            timestamp: new Date(feedback.created_at)
          })

          // 添加对应的回复
          const feedbackReplies = replies?.filter((r: FeedbackReply) => r.feedback_id === feedback.id) || []
          feedbackReplies.forEach((reply: FeedbackReply) => {
            historyMessages.push({
              id: `reply-${reply.feedback_id}`,
              type: 'bot',
              content: `💬 客服回复：\n\n${reply.message}`,
              timestamp: new Date(reply.created_at)
            })
          })
        })

        // 如果有历史消息，替换初始消息
        if (historyMessages.length > 0) {
          setMessages([
            {
              id: '0',
              type: 'bot',
              content: '📜 以下是您的历史消息记录：',
              timestamp: new Date()
            },
            ...historyMessages,
            {
              id: 'welcome-back',
              type: 'bot',
              content: '👋 欢迎回来！有什么可以帮助你的吗？',
              timestamp: new Date()
            }
          ])
          setShowFAQ(false)
        }
        
        setHistoryLoaded(true)
        setIsLoadingHistory(false)
      } catch (error) {
        console.error('加载历史消息失败:', error)
        setHistoryLoaded(true)
        setIsLoadingHistory(false)
      }
    }

    if (isOpen && isLoggedIn && userProfile) {
      loadHistory()
    }
  }, [isOpen, isLoggedIn, userProfile, historyLoaded, supabase])

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 打开聊天窗口时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // 监听外部打开事件
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
    }
    window.addEventListener('openCustomerSupport', handleOpen)
    return () => {
      window.removeEventListener('openCustomerSupport', handleOpen)
    }
  }, [])

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    // 检查登录状态
    if (!isLoggedIn || !userProfile) {
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '⚠️ 请先登录后再发送消息。\n\n登录后，您的消息将被保存，我们的客服团队会尽快回复。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputValue
    setInputValue('')
    setShowFAQ(false)
    setIsSubmitting(true)

    try {
      // 获取最新的 profile 信息（包含 family_id）
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, family_id')
        .eq('id', userProfile.id)
        .maybeSingle()

      if (profileError || !currentProfile) {
        throw new Error('无法获取用户信息')
      }

      if (!currentProfile.family_id) {
        throw new Error('用户没有关联的家庭，请先在元气银行系统中完成设置')
      }

      // 保存到数据库
      const { error } = await supabase.from('feedback_messages').insert({
        family_id: currentProfile.family_id,
        profile_id: currentProfile.id,
        subject: '博客系统客服咨询',
        message: messageContent,
        category: 'question',
        priority: 'normal',
        status: 'pending'
      })

      if (error) {
        throw error
      }

      // 成功提示
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '✅ 您的消息已成功发送！\n\n我们的客服团队会在24小时内回复您。您可以在元气银行后台的"系统设置 → 反馈与建议"中查看回复。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error: any) {
      console.error('发送消息失败:', error)
      const errorMessage = error.message || '未知错误'
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ 消息发送失败：${errorMessage}\n\n如需紧急帮助，请发送邮件至：ahkjxy@qq.com`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理快捷问题
  const handleFAQClick = (faq: typeof FAQ_ITEMS[0]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: faq.question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setShowFAQ(false)

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: faq.answer,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 500)
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="打开客服"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          
          {/* 提示气泡 */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            需要帮助？
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-purple-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">元气银行客服</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  在线
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                setHistoryLoaded(false) // 重置历史加载状态
              }}
              className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">
            {isLoadingHistory && (
              <div className="flex justify-center items-center py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                  <span>加载历史消息...</span>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* FAQ 快捷按钮 */}
            {showFAQ && messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium px-2">常见问题：</p>
                {FAQ_ITEMS.map((faq, index) => (
                  <button
                    key={index}
                    onClick={() => handleFAQClick(faq)}
                    className="w-full text-left px-4 py-3 bg-white border border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all text-sm text-gray-700 flex items-start gap-2"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 联系方式卡片 */}
            {messages.length > 2 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  联系我们
                </p>
                <div className="space-y-2 text-sm">
                  <a
                    href="mailto:ahkjxy@qq.com"
                    className="flex items-center gap-2 text-purple-600 hover:text-pink-600 transition-colors"
                  >
                    <span>📧 ahkjxy@qq.com</span>
                  </a>
                  <a
                    href="https://blog.familybank.chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-600 hover:text-pink-600 transition-colors"
                  >
                    <span>🌐 访问元气银行</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://blog.familybank.chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-600 hover:text-pink-600 transition-colors"
                  >
                    <span>📝 访问博客系统</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {!isLoggedIn ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  请先登录后再发送消息
                </p>
                <a
                  href="/auth"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>立即登录</span>
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleSendMessage()}
                    placeholder="输入你的问题..."
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isSubmitting}
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    aria-label="发送"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  消息将保存到数据库，我们会在24小时内回复
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
