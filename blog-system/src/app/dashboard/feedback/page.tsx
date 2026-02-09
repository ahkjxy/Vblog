import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedbackManagement } from '@/components/dashboard/FeedbackManagement'

export const metadata = {
  title: '客服管理',
  description: '查看和回复用户反馈消息',
}

export default async function FeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 检查是否是超级管理员
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role, family_id, name')
    .eq('id', user.id)
    .maybeSingle()

  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = userProfile?.role === 'admin' && userProfile?.family_id === SUPER_ADMIN_FAMILY_ID

  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">客服管理</h1>
        <p className="text-gray-600 mt-2">查看和回复用户反馈消息</p>
      </div>

      <FeedbackManagement 
        userId={user.id}
        userName={userProfile?.name || '管理员'}
      />
    </div>
  )
}
