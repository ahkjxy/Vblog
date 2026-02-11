import { createBrowserClient } from '@supabase/ssr'
import { COOKIE_OPTIONS } from './config'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: COOKIE_OPTIONS
  })
}
