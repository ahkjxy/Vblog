export default defineNuxtPlugin(async (nuxtApp) => {
  // 这个插件在服务端运行，确保 session 被正确初始化
  if (process.server) {
    const client = useSupabaseClient()
    
    try {
      // 尝试获取 session，但不阻塞渲染
      await client.auth.getSession()
    } catch (error) {
      console.error('[Supabase Auth Plugin] Failed to get session:', error)
    }
  }
})
