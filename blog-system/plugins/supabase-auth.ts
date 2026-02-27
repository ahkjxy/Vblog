export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // 确保在服务端和客户端都初始化 session
  if (process.server) {
    try {
      await client.auth.getSession()
    } catch (error) {
      console.error('[Supabase Plugin] Error initializing session on server:', error)
    }
  }

  // 在客户端监听 auth 状态变化
  if (process.client) {
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // 清除用户数据
        user.value = null
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // 更新用户数据
        user.value = session?.user ?? null
      }
    })
  }
})
