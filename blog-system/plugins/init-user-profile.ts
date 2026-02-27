// 在应用启动时初始化用户 profile
export default defineNuxtPlugin(async () => {
  const user = useSupabaseUser()
  const { loadProfile } = useUserProfile()

  // 如果有用户，预加载 profile
  if (user.value) {
    await loadProfile()
  }

  // 监听用户变化
  if (process.client) {
    watch(user, async (newUser) => {
      if (newUser) {
        await loadProfile()
      } else {
        const { clearProfile } = useUserProfile()
        clearProfile()
      }
    })
  }
})
