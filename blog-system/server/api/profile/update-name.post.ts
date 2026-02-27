import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '未授权'
    })
  }

  const body = await readBody(event)
  const { name } = body

  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      message: '请提供有效的名称'
    })
  }

  // 更新 profiles 表
  const { data, error } = await supabase
    .from('profiles')
    .update({ name: name.trim() })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `更新失败: ${error.message}`
    })
  }

  return {
    success: true,
    data
  }
})
