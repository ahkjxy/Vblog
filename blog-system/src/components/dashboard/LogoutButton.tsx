'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-all text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300"
      title="退出登录"
    >
      <LogOut className="w-4 h-4" />
      <span>退出</span>
    </button>
  )
}
