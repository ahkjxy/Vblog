export default defineNuxtRouteMiddleware(async (to, from) => {
  // 在服务端和客户端使用统一的方式
  const user = useSupabaseUser()
  
  // 如果没有用户，重定向到登录页
  if (!user.value) {
    console.log('[AUTH] No user found, redirecting to login')
    return navigateTo('/auth/unified')
  }

  const client = useSupabaseClient()
  
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
})
