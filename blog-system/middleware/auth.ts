export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  
  // 在服务端，等待 session 初始化
  if (process.server) {
    try {
      const { data: { session } } = await client.auth.getSession()
      if (!session) {
        console.log('[AUTH SSR] No session found')
        return navigateTo('/auth/unified?error=ssr_no_session')
      }
    } catch (error) {
      console.error('[AUTH SSR] Error getting session:', error)
      return navigateTo('/auth/unified?error=ssr_session_error')
    }
  }
  
  // 检查用户是否登录
  if (!user.value) {
    console.log('[AUTH] No user found')
    return navigateTo('/auth/unified?error=no_user')
  }

  // 获取用户 profile
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.value.id)
    .single()

  if (profileError) {
    console.error('[AUTH] Profile error:', profileError)
    return navigateTo('/auth/unified?error=profile_error')
  }

  if (!profile) {
    console.error('[AUTH] No profile found')
    return navigateTo('/auth/unified?error=no_profile')
  }

  // 检查是否是超级管理员
  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = profile.role === 'admin' && profile.family_id === SUPER_ADMIN_FAMILY_ID

  // 只有超级管理员可以访问的页面
  const adminOnlyPages = [
    '/dashboard/users',
    '/dashboard/settings',
    '/dashboard/categories',
    '/dashboard/tags',
    '/dashboard/comments'
  ]

  const requiresAdmin = adminOnlyPages.some(page => to.path.startsWith(page))

  if (requiresAdmin && !isSuperAdmin) {
    console.log('[AUTH] Access denied: requires admin')
    return navigateTo('/dashboard?error=not_admin')
  }
})
