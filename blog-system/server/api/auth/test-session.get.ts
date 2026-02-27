import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // 获取服务端用户
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      return {
        success: false,
        message: 'No user found on server',
        user: null,
        profile: null
      }
    }

    // 获取 profile
    const client = await serverSupabaseClient(event)
    const { data: profile, error } = await client
      .from('profiles')
      .select('id, name, role, family_id, avatar_url')
      .eq('id', user.id)
      .single()

    return {
      success: true,
      message: 'User found on server',
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || null,
      profileError: error?.message || null
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Error checking session',
      error: error.message
    }
  }
})
