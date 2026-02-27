export default defineNuxtRouteMiddleware(async (to) => {
  // 在服务端使用 serverSupabaseUser
  if (process.server) {
    const event = useRequestEvent()
    if (!event) {
      console.log('[AUTH SSR] No request event')
      return navigateTo('/auth/unified?error=ssr_no_event')
    }

    try {
      // 动态导入服务端工具
      const { serverSupabaseUser, serverSupabaseClient } = await import('#supabase/server')
      
      const user = await serverSupabaseUser(event)
      if (!user) {
        console.log('[AUTH SSR] No user from serverSupabaseUser')
        return navigateTo('/auth/unified?error=ssr_no_session')
      }

      // 获取用户 profile
      const client = await serverSupabaseClient(event)
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[AUTH SSR] Profile error:', profileError)
        return navigateTo('/auth/unified?error=profile_error')
      }

      if (!profile) {
        console.error('[AUTH SSR] No profile found')
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
        console.log('[AUTH SSR] Access denied: requires admin')
        return navigateTo('/dashboard?error=not_admin')
      }
    } catch (error) {
      console.error('[AUTH SSR] Error:', error)
      return navigateTo('/auth/unified?error=ssr_error')
    }
  } else {
    // 客户端使用标准 composables
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    
    // 检查用户是否登录
    if (!user.value) {
      console.log('[AUTH Client] No user found')
      return navigateTo('/auth/unified?error=no_user')
    }

    // 获取用户 profile
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.value.id)
      .single()

    if (profileError) {
      console.error('[AUTH Client] Profile error:', profileError)
      return navigateTo('/auth/unified?error=profile_error')
    }

    if (!profile) {
      console.error('[AUTH Client] No profile found')
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
      console.log('[AUTH Client] Access denied: requires admin')
      return navigateTo('/dashboard?error=not_admin')
    }
  }
})
