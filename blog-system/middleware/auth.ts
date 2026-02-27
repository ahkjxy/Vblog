export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  // 检查用户是否登录
  if (!user.value) {
    return navigateTo('/auth/unified')
  }

  // 获取用户 profile
  const client = useSupabaseClient()
  const { data: profile } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.value.id)
    .single()

  if (!profile) {
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
    return navigateTo('/dashboard')
  }
})
