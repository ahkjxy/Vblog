import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// 创建 Supabase 客户端实例（单例模式）
export function createClient(): SupabaseClient {
  // 只能在浏览器环境中调用
  if (typeof window === 'undefined') {
    // 在服务端渲染期间被调用时，返回一个临时客户端或抛出错误
    // 但为了 safety，这里我们允许它创建一个新的 ephemeral client
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
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
  
  // 使用标准的 createBrowserClient，不手动重写 cookie 逻辑
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  
  return supabaseInstance
}
