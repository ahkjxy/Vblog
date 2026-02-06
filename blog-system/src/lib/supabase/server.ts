import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

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
              // 只在生产环境设置跨域 cookie
              const isProduction = process.env.NODE_ENV === 'production'
              cookieStore.set(name, value, isProduction ? {
                ...options,
                domain: '.familybank.chat',
                sameSite: 'lax',
                secure: true,
              } : options)
            })
          } catch {
            // Server component
          }
        },
      },
    }
  )
}
