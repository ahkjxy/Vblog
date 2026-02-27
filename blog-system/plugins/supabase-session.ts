export default defineNuxtPlugin(async () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  // 在客户端，确保 session 已加载
  if (process.client) {
    // 等待 session 初始化
    await client.auth.getSession()
  }
})
