import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 验证当前用户是否是超级管理员
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.id)
      .single()

    const isSuperAdmin = profile?.role === 'admin' && 
      profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 使用 service role 获取所有用户的邮箱
    const { data: authData, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 })
    }

    // 创建 ID -> Email 映射
    const emailMap: Record<string, string> = {}
    authData.users.forEach(u => {
      if (u.email) {
        emailMap[u.id] = u.email
      }
    })

    return NextResponse.json({ emailMap })
  } catch (error: any) {
    console.error('Error in /api/users/emails:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}
