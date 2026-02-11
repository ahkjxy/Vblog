'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // 先清除本地存储
      if (typeof window !== 'undefined') {
        // 清除 Supabase 相关的存储
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // 清除 sessionStorage
        sessionStorage.clear()
      }
      
      // 执行退出
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
      }
      
      // 清除所有认证相关的 cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
            // 清除 cookie（尝试多种方式）
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.familybank.chat`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=familybank.chat`
          }
        })
      }
      
      // 直接跳转，不等待 router
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // 即使出错也强制跳转
      window.location.href = '/'
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-red-50 transition-all text-sm font-black text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
      title="退出登录"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>{loading ? '退出中...' : '退出'}</span>
    </button>
  )
}
