export const useUserProfile = () => {
  // 在函数内部定义状态
  const userProfileState = useState<any>('user-profile', () => null)
  const isLoadingProfile = useState('user-profile-loading', () => false)
  const profileError = useState<string | null>('user-profile-error', () => null)
  
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // 加载用户 profile（支持 SSR）
  const loadProfile = async (force = false) => {
    // 预渲染时跳过
    if (process.env.prerender) {
      return null
    }

    // 服务端跳过（避免 SSR 时的问题）
    if (process.server) {
      return null
    }

    // 如果已经加载且不强制刷新，直接返回
    if (userProfileState.value && !force) {
      return userProfileState.value
    }

    // 如果没有用户，清空 profile
    if (!user.value) {
      userProfileState.value = null
      return null
    }

    // 如果正在加载，等待
    if (isLoadingProfile.value) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!isLoadingProfile.value) {
            clearInterval(interval)
            resolve(userProfileState.value)
          }
        }, 100)
      })
    }

    isLoadingProfile.value = true
    profileError.value = null

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('[useUserProfile] Error loading profile:', error)
        profileError.value = error.message
        return null
      }

      userProfileState.value = data
      return data
    } catch (error: any) {
      console.error('[useUserProfile] Exception:', error)
      profileError.value = error.message
      return null
    } finally {
      isLoadingProfile.value = false
    }
  }

  // 更新 profile
  const updateProfile = async (updates: any) => {
    if (!user.value) return null

    try {
      const { data, error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) {
        console.error('[useUserProfile] Error updating profile:', error)
        return null
      }

      // 更新本地状态
      userProfileState.value = data
      return data
    } catch (error) {
      console.error('[useUserProfile] Exception updating profile:', error)
      return null
    }
  }

  // 清空 profile
  const clearProfile = () => {
    userProfileState.value = null
    profileError.value = null
  }

  // 计算属性
  const profile = computed(() => userProfileState.value)
  
  const userName = computed(() => 
    userProfileState.value?.name || '用户'
  )

  const userAvatar = computed(() => userProfileState.value?.avatar_url)

  const isSuperAdmin = computed(() => {
    const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    return userProfileState.value?.role === 'admin' && 
           userProfileState.value?.family_id === SUPER_ADMIN_FAMILY_ID
  })

  const userRole = computed(() => {
    if (isSuperAdmin.value) return '超管'
    if (userProfileState.value?.role === 'admin') return '家长'
    if (userProfileState.value?.role === 'editor') return '编辑'
    return '作者'
  })

  return {
    profile,
    userName,
    userAvatar,
    isSuperAdmin,
    userRole,
    isLoadingProfile: computed(() => isLoadingProfile.value),
    profileError: computed(() => profileError.value),
    loadProfile,
    updateProfile,
    clearProfile,
  }
}
