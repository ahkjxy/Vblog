import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const isProduction = process.env.NODE_ENV === 'production'

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'sb-mfgfbwhznqpdjumtsrus-auth-token',
      storage: isProduction ? {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          const name = `${key}=`
          const ca = document.cookie.split(';')
          for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') {
              c = c.substring(1)
            }
            if (c.indexOf(name) === 0) {
              let value = c.substring(name.length, c.length)
              try {
                value = decodeURIComponent(value)
              } catch (e) {
                // use raw value
              }

              // Handle base64 prefix
              if (value.startsWith('base64-')) {
                try {
                  const base64 = value.substring(7)
                  return atob(base64)
                } catch (e) {
                  console.error('Failed to decode base64 cookie', e)
                  return null
                }
              }
              return value
            }
          }
          return null
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          // 生产环境设置跨域 Cookie
          const domain = '.familybank.chat'
          document.cookie = `${key}=${value}; path=/; domain=${domain}; max-age=31536000; SameSite=Lax; Secure`
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          const domain = '.familybank.chat'
          document.cookie = `${key}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`
        },
      } : undefined // 开发环境使用默认 localStorage
    }
  })
}
