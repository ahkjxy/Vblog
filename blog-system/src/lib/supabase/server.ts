import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 统一 Cookie 设置逻辑
              const cookieOptions = {
                ...options,
                domain: isProduction ? '.familybank.chat' : options.domain,
                sameSite: 'lax' as const,
                secure: isProduction,
                httpOnly: false, // Explicitly allow client-side access
                maxAge: 31536000, // 1年
              }
              
              cookieStore.set(name, value, cookieOptions)
            })
          } catch {
            // 在服务端组件中调用时可能会失败
          }
        },
      },
    }
  )
}
