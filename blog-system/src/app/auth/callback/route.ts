import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTarget = requestUrl.searchParams.get('redirect') || 'blog'
  const returnUrl = requestUrl.searchParams.get('returnUrl')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      const errorUrl = new URL('/auth', request.url)
      errorUrl.searchParams.set('error', 'callback')
      if (redirectTarget) errorUrl.searchParams.set('redirect', redirectTarget)
      return NextResponse.redirect(errorUrl)
    }
  }

  // 根据 redirect 参数跳转到不同系统
  if (returnUrl) {
    return NextResponse.redirect(returnUrl)
  } else if (redirectTarget === 'family') {
    return NextResponse.redirect('https://www.familybank.chat')
  } else {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
