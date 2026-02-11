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
  // 使用 @supabase/ssr 内置的 cookie 处理，只配置 domain
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      domain: isProduction ? '.familybank.chat' : undefined,
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 31536000,
    }
  })
  
  return supabaseInstance
}
