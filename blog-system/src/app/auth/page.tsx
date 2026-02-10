'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

type Mode = 'password' | 'magic'

function AuthPageContent() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [showResetRequest, setShowResetRequest] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const msg = searchParams.get('message')
    if (msg) {
      setMessage({ type: 'info', text: msg })
    }
  }, [searchParams])

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const em = email.trim()
    const pw = password.trim()
    
    if (!em || !pw) {
      showToast('error', '请输入邮箱和密码')
      return
    }
    
    setLoading(true)

    try {
      // 1. 尝试登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: em,
        password: pw,
      })

      if (!signInError && signInData?.session) {
        showToast('success', '登录成功，正在进入...')
        // 等待一下让 auth state change 事件触发
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/dashboard')
        return
      }

      // 如果是其他错误（如"Email not confirmed"），直接提示
      const isCredentialError = signInError?.message === "Invalid login credentials"
      if (signInError && !isCredentialError) {
        showToast('error', signInError.message)
        return
      }

      // 2. 如果是凭证错误，尝试注册（可能是新用户）
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: em,
        password: pw,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: em.split('@')[0],
          }
        }
      })

      if (signUpError) {
        // 注册失败
        console.error('注册错误:', signUpError)
        
        // 检查是否是用户已存在的错误
        const userExistsErrors = [
          'User already registered',
          'Database error',
          'already been registered',
          'duplicate key value'
        ]
        
        const isUserExists = userExistsErrors.some(msg => 
          signUpError.message?.toLowerCase().includes(msg.toLowerCase())
        )
        
        if (isUserExists) {
          // 用户已存在，说明是密码错误
          showToast('error', '密码错误，如忘记密码请点击下方找回')
        } else {
          // 其他注册错误
          showToast('error', `注册失败: ${signUpError.message}`)
        }
      } else {
        // 注册成功
        
        if (signUpData?.session) {
          // 自动登录成功
          showToast('success', '注册并登录成功，欢迎加入元气银行博客!')
          // 等待一下让 auth state change 事件触发
          await new Promise(resolve => setTimeout(resolve, 500))
          router.push('/dashboard')
        } else if (signUpData?.user) {
          // 注册成功但需要验证邮件
          showToast('info', '注册成功！请前往邮箱验证链接以完成激活')
        } else {
          // 未知情况
          showToast('error', '注册状态未知，请刷新页面重试')
        }
      }

    } catch (err) {
      console.error('认证错误:', err)
      showToast('error', (err as Error)?.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const em = email.trim()
    
    if (!em) {
      showToast('error', '请输入邮箱')
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) throw error
      showToast('info', '已发送登录链接，请前往邮箱点击确认')
    } catch (err) {
      showToast('error', (err as Error)?.message || '发送失败')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = () => {
    setResetEmail(email.trim())
    setShowResetRequest(true)
  }

  const handleSendReset = async () => {
    const em = resetEmail.trim()
    
    if (!em) {
      showToast('error', '请输入邮箱')
      return
    }
    
    setResetLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(em, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      
      if (error) throw error
      showToast('success', '重置邮件已发送，请查收邮箱并按链接设置新密码')
      setShowResetRequest(false)
    } catch (err) {
      showToast('error', (err as Error)?.message || '发送失败')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] sm:px-6 py-12 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D94]/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C4DFF]/10 blur-[100px] rounded-full animate-pulse duration-[4000ms]"></div>
      
      <div className="w-full sm:max-w-[420px] bg-white sm:bg-white/80 backdrop-blur-3xl sm:rounded-[48px] sm:shadow-[0_32px_100px_-24px_rgba(0,0,0,0.12)] sm:border border-white/50 p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="space-y-3 text-center">
          <Link href="/" className="inline-block">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] opacity-30 blur-2xl rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-[24px] flex items-center justify-center relative shadow-2xl shadow-[#FF4D94]/30 rotate-3 hover:rotate-0 transition-all duration-500 group overflow-hidden">
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Logo className="w-8 h-8 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
              </div>
            </div>
          </Link>
          
          <div className="mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D94]">博 客 系 统</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mt-1">欢迎来到元气银行博客</h2>
            <p className="text-[11px] font-bold text-gray-400 leading-snug mt-2 max-w-[240px] mx-auto opacity-80">
              分享家庭管理智慧，记录成长点滴
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
            message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
            'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-1.5 p-1 bg-gray-50 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-[#FF4D94]">
          <button
            className={`flex-1 py-3.5 rounded-[18px] transition-all duration-300 ${
              mode === 'password' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-400 hover:text-gray-500'
            }`}
            onClick={() => setMode('password')}
          >
            密码登录 / 注册
          </button>
          <button
            className={`flex-1 py-3.5 rounded-[18px] transition-all duration-300 ${
              mode === 'magic' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-400 hover:text-gray-500'
            }`}
            onClick={() => setMode('magic')}
          >
            魔法链接
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                电子邮箱
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
                placeholder="请输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                通行密码
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
                placeholder="请输入您的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[#FF4D94]/20 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '一键登录'
                )}
              </button>
              
              <button
                type="button"
                disabled={loading}
                onClick={handleResetPassword}
                className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-[#7C4DFF] transition-colors pb-2"
              >
                忘记密码？点击找回
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                验证邮箱
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#7C4DFF] to-[#9E7AFF] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[#7C4DFF]/20 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '发送魔法链接'
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-3 opacity-60">
            <span className="w-10 h-px bg-gray-100 dark:bg-gray-800"></span>
            SUPABASE 安全支持
            <span className="w-10 h-px bg-gray-100 dark:bg-gray-800"></span>
          </p>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            还没有元气银行账号？
            <a 
              href="https://www.familybank.chat" 
              className="text-[#FF4D94] hover:text-[#7C4DFF] font-bold ml-1 transition-colors"
            >
              前往注册
            </a>
          </p>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="mb-6">
              <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">Reset Portal</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-2">找回通行密码</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                我们将发送重置链接到您的注册邮箱
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  验证邮箱 / Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  disabled={resetLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetRequest(false)}
                  disabled={resetLoading}
                  className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={resetLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    '发送邮件'
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] dark:bg-[#0F172A]">
        <div className="w-16 h-16 border-4 border-[#FF4D94]/20 border-t-[#FF4D94] rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
