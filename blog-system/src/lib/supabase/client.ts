import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 单例模式：在模块级别创建客户端
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // 如果已经存在实例，直接返回
  if (supabaseInstance) {
    return supabaseInstance
  }

  // 在构建时如果环境变量不存在，返回一个 mock 客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
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
  
  // 创建并缓存实例 - 使用标准客户端
  supabaseInstance = createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // 禁用自动刷新
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token',
      }
    }
  )

  return supabaseInstance
}
