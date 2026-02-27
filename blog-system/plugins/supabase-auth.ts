export default defineNuxtPlugin((nuxtApp) => {
  // 预渲染时跳过
  if (process.env.prerender) {
    return
  }

  const client = useSupabaseClient()

  // 在客户端监听 auth 状态变化
  if (process.client) {
    client.auth.onAuthStateChange((event, session) => {
      console.log('[Auth Plugin] Auth state changed:', event)
      
      if (event === 'SIGNED_OUT') {
        // 用户登出，刷新页面
        window.location.href = '/auth/unified'
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[Auth Plugin] Token refreshed')
      }
    })
  }
})
