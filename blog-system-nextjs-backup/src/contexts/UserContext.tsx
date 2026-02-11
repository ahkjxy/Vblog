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
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  // 在客户端初始化 Supabase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const client = createClient()
        setSupabase(client)
      } catch (error) {
        console.error('Failed to create Supabase client:', error)
      }
    }
  }, [])

  // 获取用户信息
  const fetchUser = async () => {
    if (!supabase) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setUser(null)
        setLoading(false)
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
    if (!supabase) return
    setLoading(true)
    await fetchUser()
  }

  // 登出
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    window.location.href = 'https://blog.familybank.chat/auth/unified'
  }

  // 初始化：在 supabase 初始化后执行
  useEffect(() => {
    if (!supabase) return

    // 总是获取最新的用户信息
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          setUser(null)
          setLoading(false)
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

    loadUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string) => {
      if (event === 'SIGNED_IN') {
        await loadUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase]) // 依赖 supabase，确保在客户端初始化后才执行

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
