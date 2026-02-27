export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  
  // 等待用户状态初始化
  await new Promise(resolve => setTimeout(resolve, 0))
  
  // 检查用户是否登录
  if (!user.value) {
    const context = process.server ? 'SSR' : 'Client'
    console.log(`[AUTH ${context}] No user found`)
    return navigateTo(`/auth/unified?error=${process.server ? 'ssr_no_session' : 'no_user'}`)
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
