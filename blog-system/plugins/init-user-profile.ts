// 在应用启动时初始化用户 profile
export default defineNuxtPlugin(async (nuxtApp) => {
  // 预渲染时跳过
  if (process.env.prerender) {
    return
  }

  // 只在客户端运行
  if (process.server) {
    return
  }

  const user = useSupabaseUser()
  
  // 只在有用户时才加载 profile
  if (user.value) {
    const { loadProfile } = useUserProfile()
    try {
      await loadProfile()
    } catch (error) {
      console.error('[init-user-profile] Error loading profile:', error)
      // 不要抛出错误，避免影响页面加载
    }
  }

  // 监听用户变化
  watch(user, async (newUser) => {
    const { loadProfile, clearProfile } = useUserProfile()
    if (newUser) {
      try {
        await loadProfile()
      } catch (error) {
        console.error('[init-user-profile] Error loading profile on user change:', error)
        // 不要抛出错误
      }
    } else {
      clearProfile()
    }
  })
})
