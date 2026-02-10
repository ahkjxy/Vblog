import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 在构建时如果环境变量不存在，返回一个 mock 客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // 返回一个 mock 客户端用于构建时
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
            limit: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      }),
    } as any
  }
  
  // 检测是否在生产环境（familybank.chat 域名）
  const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('familybank.chat')
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        // 使用与 family-points-bank 相同的 storage key
        storageKey: 'sb-auth-token',
        // 生产环境使用 Cookie，本地开发也使用 Cookie（但不跨域）
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            
            // 优先从 Cookie 读取
            const cookieValue = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${key}=`))
              ?.split('=')[1]
            
            if (cookieValue) return cookieValue
            
            // 如果 Cookie 中没有，尝试从 localStorage 读取（兼容旧数据）
            try {
              return localStorage.getItem(key)
            } catch {
              return null
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            
            // 设置 Cookie
            if (isProduction) {
              // 生产环境：跨子域 Cookie
              document.cookie = `${key}=${value}; path=/; domain=.familybank.chat; max-age=31536000; SameSite=Lax; Secure`
            } else {
              // 本地开发：普通 Cookie
              document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`
            }
            
            // 同时保存到 localStorage 作为备份
            try {
              localStorage.setItem(key, value)
            } catch {
              // Ignore localStorage errors
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            
            // 删除 Cookie
            if (isProduction) {
              document.cookie = `${key}=; path=/; domain=.familybank.chat; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`
            } else {
              document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
            }
            
            // 同时删除 localStorage
            try {
              localStorage.removeItem(key)
            } catch {
              // Ignore localStorage errors
            }
          },
        },
      },
    }
  )
}
