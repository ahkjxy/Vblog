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
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Force a full page reload to the unified auth page to clear all state
      window.location.href = '/auth/unified'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/auth/unified'
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
