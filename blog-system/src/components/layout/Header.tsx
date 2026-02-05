'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { LayoutDashboard, LogOut, ChevronDown, Sparkles, BookOpen, FolderOpen, Tag } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<{ username: string; avatar_url?: string; role?: string } | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, role')
          .eq('id', authUser.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }
      }
    }
    checkUser()
  }, [])

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
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-100/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white p-2 shadow-lg group-hover:scale-105 transition-transform">
              <Logo className="w-full h-full" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              元气银行
            </span>
            <span className="text-xs text-gray-500 font-medium">Family Bank</span>
          </div>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center gap-2">
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
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-purple-200 group-hover:border-purple-400 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800">{user.username}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-purple-100 py-2 animate-slide-up overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
                    <p className="text-sm font-bold text-gray-900">{user.username}</p>
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
                      <span>进入后台</span>
                    </Link>
                    
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
      </div>
    </header>
  )
}
