// 在应用启动时初始化用户 profile
export default defineNuxtPlugin(async () => {
  const user = useSupabaseUser()
  
  // 只在有用户时才加载 profile
  if (user.value) {
    const { loadProfile } = useUserProfile()
    try {
      await loadProfile()
    } catch (error) {
      console.error('[init-user-profile] Error loading profile:', error)
    }
  }

  // 监听用户变化（仅客户端）
  if (process.client) {
    watch(user, async (newUser) => {
      const { loadProfile, clearProfile } = useUserProfile()
      if (newUser) {
        try {
          await loadProfile()
        } catch (error) {
          console.error('[init-user-profile] Error loading profile on user change:', error)
        }
      } else {
        clearProfile()
      }
    })
  }
})
