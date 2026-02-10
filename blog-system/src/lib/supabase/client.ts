import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 直接创建并导出单例客户端（与家庭系统一致）
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'sb-auth-token',
        persistSession: true,
        detectSessionInUrl: true,
      }
    })
  : null

// 为了兼容现有代码，保留 createClient 函数
export function createClient() {
  if (!supabase) {
    // 返回一个 mock 客户端用于构建时
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
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
  
  return supabase
}
