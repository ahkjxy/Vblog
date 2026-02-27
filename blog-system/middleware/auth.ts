export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  // 等待一小段时间让 session 初始化（仅在客户端）
  if (process.client && !user.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // 再次检查用户
  if (!user.value) {
    console.log('[AUTH] No user found, redirecting to login')
    return navigateTo('/auth/unified')
  }

  try {
    // 获取用户 profile
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, family_id, name')
      .eq('id', user.value.id)
      .single()

    if (profileError || !profile) {
      console.error('[AUTH] Profile error:', profileError)
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

    const requiresAdmin = adminOnlyPages.some(page => to.path.startsWith(page))

    if (requiresAdmin && !isSuperAdmin) {
      console.log('[AUTH] Access denied: requires admin')
      return navigateTo('/dashboard')
    }
  } catch (error) {
    console.error('[AUTH] Unexpected error:', error)
    return navigateTo('/auth/unified')
  }
})
