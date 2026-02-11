import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// 创建 Supabase 客户端实例（单例模式）
export function createClient(): SupabaseClient {
  // 只能在浏览器环境中调用
  if (typeof window === 'undefined') {
    throw new Error('createClient can only be called in browser environment')
  }

  // 如果已经创建过实例，直接返回
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  const isProduction = process.env.NODE_ENV === 'production'
  
  // 配置 Cookie 存储，支持跨域同步
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // 从 Cookie 读取
        const cookies = document.cookie.split('; ')
        const cookie = cookies.find(row => row.startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1] : null
      },
      set(name: string, value: string, options: any) {
        // 设置 Cookie，生产环境使用跨域 domain
        const domain = isProduction ? 'domain=.familybank.chat;' : ''
        const maxAge = 'max-age=31536000' // 1年
        const sameSite = 'SameSite=Lax'
        const secure = isProduction ? 'Secure' : ''
        const path = 'path=/'
        
        document.cookie = `${name}=${value}; ${domain}${maxAge}; ${sameSite}; ${secure}; ${path}`
      },
      remove(name: string) {
        // 删除 Cookie
        const domain = isProduction ? 'domain=.familybank.chat;' : ''
        document.cookie = `${name}=; ${domain}path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      },
    },
  })
  
  return supabaseInstance
}
