export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()

  // 直接从 client 获取 session，不依赖 useSupabaseUser()
  const { data: { session }, error: sessionError } = await client.auth.getSession()

  if (sessionError) {
    console.error('[AUTH] Session error:', sessionError)
    return navigateTo('/auth/unified')
  }

  if (!session || !session.user) {
    console.log('[AUTH] No session or user, redirecting to login')
    return navigateTo('/auth/unified')
  }

  const userId = session.user.id

  // 获取用户 profile
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role, family_id, name')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('[AUTH] Profile error:', profileError)
    return navigateTo('/auth/unified')
  }

  if (!profile) {
    console.log('[AUTH] No profile found, redirecting to login')
    return navigateTo('/auth/unified')
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

  // 检查当前路径是否需要超级管理员权限
  const requiresAdmin = adminOnlyPages.some(page => to.path.startsWith(page))

  if (requiresAdmin && !isSuperAdmin) {
    console.log('[AUTH] Access denied: requires admin')
    return navigateTo('/dashboard')
  }
})
