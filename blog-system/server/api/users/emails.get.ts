import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    
    // 获取当前用户
    const { data: { user }, error: userError } = await client.auth.getUser()
    
    if (userError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // 验证是否是超级管理员
    const { data: profile } = await client
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.id)
      .single()

    const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === SUPER_ADMIN_FAMILY_ID

    if (!isSuperAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden'
      })
    }

    // 使用 service role 获取所有用户的邮箱
    const serviceClient = await serverSupabaseServiceRole(event)
    const { data: authData, error } = await serviceClient.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch users',
        data: { details: error.message }
      })
    }

    // 创建 ID -> Email 映射
    const emailMap: Record<string, string> = {}
    authData.users.forEach(u => {
      if (u.email) {
        emailMap[u.id] = u.email
      }
    })

    return { emailMap }
  } catch (error: any) {
    console.error('Error in /api/users/emails:', error)
    
    // 如果已经是 H3 错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: { details: error.message }
    })
  }
})
