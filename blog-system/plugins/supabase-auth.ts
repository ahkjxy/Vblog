export default defineNuxtPlugin((nuxtApp) => {
  // 预渲染时跳过
  if (process.env.prerender) {
    return
  }

  // 只在客户端运行
  if (!process.client) {
    return
  }

  const client = useSupabaseClient()
  const router = useRouter()

  // 监听 auth 状态变化
  client.auth.onAuthStateChange((event, session) => {
    console.log('[Auth Plugin] Auth state changed:', event, 'Session:', !!session)
    
    if (event === 'SIGNED_OUT') {
      // 用户主动登出，只在 dashboard 页面才跳转
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/profile')) {
        console.log('[Auth Plugin] User signed out from protected page, redirecting')
        router.push('/auth/unified')
      }
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('[Auth Plugin] Token refreshed successfully')
    } else if (event === 'SIGNED_IN') {
      console.log('[Auth Plugin] User signed in')
    }
  })
})
