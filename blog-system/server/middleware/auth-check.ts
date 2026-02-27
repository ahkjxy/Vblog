import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  
  // 只检查 dashboard 路由的 HTML 请求
  if (!url.startsWith('/dashboard') || url.includes('.') || url.startsWith('/api')) {
    return
  }

  try {
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      console.log('[Server Middleware] No user, redirecting to login')
      // 服务端重定向到登录页
      return sendRedirect(event, '/auth/unified?error=ssr_no_session', 302)
    }
    
    console.log('[Server Middleware] User authenticated:', user.id)
  } catch (error) {
    console.error('[Server Middleware] Error:', error)
    return sendRedirect(event, '/auth/unified?error=ssr_error', 302)
  }
})
