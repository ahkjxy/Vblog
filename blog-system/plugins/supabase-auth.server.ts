export default defineNuxtPlugin(async () => {
  const client = useSupabaseClient()
  
  // 在服务端确保 session 已加载
  if (import.meta.server) {
    try {
      await client.auth.getSession()
    } catch (error) {
      console.error('Failed to get session on server:', error)
    }
  }
})
