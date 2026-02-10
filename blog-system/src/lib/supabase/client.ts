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
        storage: isProduction ? {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${key}=`))
              ?.split('=')[1]
            return value || null
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            // 设置跨子域的 cookie，与 family-points-bank 共享
            document.cookie = `${key}=${value}; path=/; domain=.familybank.chat; max-age=31536000; SameSite=Lax; Secure`
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            document.cookie = `${key}=; path=/; domain=.familybank.chat; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`
          },
        } : undefined, // 本地开发使用默认 localStorage
      },
    }
  )
}
