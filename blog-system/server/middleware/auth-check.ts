import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  
  // 只检查 dashboard 路由
  if (!url.startsWith('/dashboard')) {
    return
  }

  // 跳过 API 路由和静态资源
  if (url.startsWith('/api') || url.includes('.')) {
    return
  }

  try {
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      console.log('[Server Middleware] No user found for:', url)
      // 设置一个标记，让客户端中间件知道 SSR 没有用户
      event.context.noUser = true
    } else {
      console.log('[Server Middleware] User authenticated:', user.id)
      event.context.userId = user.id
    }
  } catch (error) {
    console.error('[Server Middleware] Error checking user:', error)
    event.context.authError = true
  }
})
