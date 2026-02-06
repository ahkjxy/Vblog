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
    isProduction ? {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined
          const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
          return value
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return
          const maxAge = options?.maxAge ? `max-age=${options.maxAge}; ` : ''
          document.cookie = `${name}=${value}; path=/; domain=.familybank.chat; ${maxAge}SameSite=Lax; Secure`
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=/; domain=.familybank.chat; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`
        },
      },
    } : {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined
          const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
          return value
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return
          const maxAge = options?.maxAge ? `max-age=${options.maxAge}; ` : ''
          document.cookie = `${name}=${value}; path=/; ${maxAge}SameSite=Lax`
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )
}
