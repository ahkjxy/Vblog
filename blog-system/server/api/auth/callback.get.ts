import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const redirectTarget = (query.redirect as string) || 'blog'
  const returnUrl = query.returnUrl as string

  if (code) {
    const supabase = await serverSupabaseClient(event)
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 处理重定向
  if (returnUrl) {
    return sendRedirect(event, returnUrl)
  }

  if (redirectTarget === 'family') {
    return sendRedirect(event, 'https://www.familybank.chat')
  }

  return sendRedirect(event, '/dashboard')
})
