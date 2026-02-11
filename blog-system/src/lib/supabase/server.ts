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
              // 生产环境设置跨域 Cookie
              const cookieOptions = isProduction ? {
                ...options,
                domain: '.familybank.chat',
                sameSite: 'lax' as const,
                secure: true,
                maxAge: 31536000, // 1年
              } : options
              
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
