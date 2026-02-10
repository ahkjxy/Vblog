'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { LayoutDashboard, LogOut, ChevronDown, Sparkles, BookOpen, FolderOpen, Tag, Menu, X, Calendar } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<{ name: string; avatar_url?: string; role?: string; avatar_color?: string } | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // 检查用户登录状态
  useEffect(() => {
    let mounted = true
    
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!mounted || !authUser) return
        
        // 一次查询获取所有需要的信息
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('name, avatar_url, avatar_color, role')
          .eq('id', authUser.id)
          .maybeSingle()

        if (!mounted) return

        // 设置用户信息
        if (userProfile) {
          setUser({
            name: userProfile.name || authUser.email?.split('@')[0] || '用户',
            avatar_url: userProfile.avatar_url,
            role: userProfile.role || 'author',
            avatar_color: userProfile.avatar_color
          })
        } else {
          // 如果没有 profile，使用基本信息
          setUser({
            name: authUser.email?.split('@')[0] || '用户',
            role: 'author'
          })
        }
      } catch (error) {
        // Silently fail during SSG/build time when Supabase env vars aren't available
      }
    }
    
    checkUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (mounted) {
        if (session?.user) {
          checkUser()
        } else {
          setUser(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // 只在组件挂载时执行一次

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // 退出登录
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  // 关闭移动菜单
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-100/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl md:rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white p-1.5 md:p-2 shadow-lg group-hover:scale-105 transition-transform">
              <Logo className="w-full h-full" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              元气银行
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 font-medium hidden sm:block">Family Bank</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link 
            href="/blog" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>文档</span>
          </Link>
          <Link 
            href="/categories" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span>分类</span>
          </Link>
          <Link 
            href="/tags" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <Tag className="w-4 h-4" />
            <span>标签</span>
          </Link>
          <Link 
            href="/changelog" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>更新日志</span>
          </Link>
          
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          
          <a 
            href="https://www.familybank.chat" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>元气银行</span>
          </a>
          
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-all group"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-purple-200 group-hover:border-purple-400 transition-colors"
                  />
                ) : user.avatar_color ? (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-purple-200 group-hover:border-purple-400 transition-colors"
                    style={{ backgroundColor: user.avatar_color }}
                  >
                    <span className="text-white text-sm font-bold">
                      {user.name.slice(-1)}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-purple-100 py-2 animate-slide-up overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    {user.role && (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span className="text-purple-700">
                          {user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑' : '作者'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-purple-600" />
                      </div>
                      <span>进入 Blog 后台</span>
                    </Link>
                    
                    <a
                      href="https://www.familybank.chat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <span>进入元气银行后台</span>
                    </a>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>登录</span>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && (
            <Link 
              href="/dashboard"
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-600" />
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-100 bg-white animate-slide-up">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            <Link 
              href="/blog"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>文档</span>
            </Link>
            <Link 
              href="/categories"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <FolderOpen className="w-5 h-5" />
              <span>分类</span>
            </Link>
            <Link 
              href="/tags"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <Tag className="w-5 h-5" />
              <span>标签</span>
            </Link>
            <Link 
              href="/changelog"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span>更新日志</span>
            </Link>
            
            <div className="h-px bg-gray-200 my-2"></div>
            
            <a 
              href="https://www.familybank.chat" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>元气银行</span>
            </a>
            
            {user ? (
              <>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="px-4 py-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-purple-200"
                      />
                    ) : user.avatar_color ? (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-purple-200"
                        style={{ backgroundColor: user.avatar_color }}
                      >
                        <span className="text-white text-sm font-bold">
                          {user.name.slice(-1)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      {user.role && (
                        <p className="text-xs text-purple-600">
                          {user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑' : '作者'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="h-px bg-gray-200 my-2"></div>
                <Link 
                  href="/auth/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>登录</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
