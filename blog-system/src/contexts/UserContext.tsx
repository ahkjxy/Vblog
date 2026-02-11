'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  avatar_color?: string
  role?: string
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ 
  children, 
  initialUser 
}: { 
  children: ReactNode
  initialUser?: UserProfile | null 
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser || null)
  const [loading, setLoading] = useState(!initialUser)
  const supabase = createClient()

  // 获取用户信息
  const fetchUser = async () => {

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setUser(null)
        return
      }

      const authUser = session.user

      // 获取用户 profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('name, avatar_url, avatar_color, role')
        .eq('id', authUser.id)
        .maybeSingle()

      if (userProfile) {
        setUser({
          id: authUser.id,
          name: userProfile.name || authUser.email?.split('@')[0] || '用户',
          email: authUser.email || '',
          avatar_url: userProfile.avatar_url,
          avatar_color: userProfile.avatar_color,
          role: userProfile.role || 'author'
        })
      } else {
        setUser({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || '用户',
          email: authUser.email || '',
          role: 'author'
        })
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // 刷新用户信息
  const refreshUser = async () => {
    setLoading(true)
    await fetchUser()
  }

  // 登出
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  // 初始化：只执行一次
  useEffect(() => {
    // 总是获取最新的用户信息
    fetchUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string) => {
      if (event === 'SIGNED_IN') {
        await fetchUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 空依赖数组，只执行一次

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

// Hook to use user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
