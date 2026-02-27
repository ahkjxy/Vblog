import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  
  // 只检查 dashboard 路由
  if (!url.startsWith('/dashboard')) {
    return
  }

  // 跳过 API 路由
  if (url.startsWith('/api')) {
    return
  }

  try {
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      console.log('[Server Auth] No user found for dashboard route:', url)
      // 不在这里重定向，让客户端中间件处理
      return
    }
    
    console.log('[Server Auth] User authenticated:', user.id)
  } catch (error) {
    console.error('[Server Auth] Error checking user:', error)
  }
})
