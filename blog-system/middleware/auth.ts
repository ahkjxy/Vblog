export default defineNuxtRouteMiddleware(async (to, from) => {
  // 在服务端使用 serverSupabaseUser，在客户端使用 useSupabaseUser
  if (process.server) {
    // 服务端：使用 event 上下文
    const event = useRequestEvent()
    if (!event) {
      console.error('[AUTH SSR] No event context')
      return navigateTo('/auth/unified')
    }

    // 动态导入服务端 Supabase 工具
    const { serverSupabaseUser, serverSupabaseClient } = await import('#supabase/server')
    
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      console.log('[AUTH SSR] No user found')
      return navigateTo('/auth/unified')
    }

    const client = await serverSupabaseClient(event)
    
    // 获取用户 profile
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, family_id, name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[AUTH SSR] Profile error:', profileError)
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
      console.log('[AUTH SSR] Access denied: requires admin')
      return navigateTo('/dashboard')
    }
  } else {
    // 客户端：使用标准的 composables
    const user = useSupabaseUser()
    
    if (!user.value) {
      console.log('[AUTH Client] No user found')
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
      console.error('[AUTH Client] Profile error:', profileError)
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
      console.log('[AUTH Client] Access denied: requires admin')
      return navigateTo('/dashboard')
    }
  }
})
