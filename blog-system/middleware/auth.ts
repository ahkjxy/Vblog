export default defineNuxtRouteMiddleware(async (to) => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // 在服务端，尝试从 session 获取用户信息
  if (import.meta.server) {
    const { data: { session } } = await client.auth.getSession()
    if (!session) {
      return navigateTo('/auth/unified')
    }
  } else {
    // 客户端检查
    if (!user.value) {
      return navigateTo('/auth/unified')
    }
  }

  // 获取用户 ID
  const userId = import.meta.server 
    ? (await client.auth.getSession()).data.session?.user.id
    : user.value?.id

  if (!userId) {
    return navigateTo('/auth/unified')
  }

  // 获取用户 profile
  const { data: profile } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', userId)
    .single()

  // 检查是否是超级管理员
  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === SUPER_ADMIN_FAMILY_ID

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
    return navigateTo('/dashboard')
  }
})
