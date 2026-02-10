import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// 获取或创建 Supabase 客户端实例
function getSupabaseClient(): SupabaseClient | null {
  // 只在浏览器环境中创建客户端
  if (typeof window === 'undefined') {
    return null
  }

  // 如果已经创建过实例，直接返回
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl,
      keyPrefix: supabaseAnonKey?.substring(0, 20)
    })
    return null
  }

  try {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully')
    return supabaseInstance
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    return null
  }
}

// 导出 getter 函数，确保在客户端调用时总是尝试创建
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null

// 为了兼容现有代码，保留 createClient 函数
export function createClient(): SupabaseClient | null {
  return getSupabaseClient()
}
