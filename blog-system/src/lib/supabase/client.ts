import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// 获取或创建 Supabase 客户端实例
function getSupabaseClient(): SupabaseClient {
  // 如果已经创建过实例，直接返回
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// 导出单例客户端 - 只在客户端环境中初始化
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null

// 为了兼容现有代码，保留 createClient 函数
export function createClient(): SupabaseClient {
  return getSupabaseClient()
}
