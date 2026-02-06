import { createClient } from '@/lib/supabase/server'

export default async function DebugUserPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8">未登录</div>
  }

  // 获取 family_member
  const { data: familyMember, error: fmError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // 获取家长 profile
  let adminProfile = null
  let adminError = null
  if (familyMember?.family_id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', familyMember.family_id)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()
    
    adminProfile = data
    adminError = error
  }

  // 获取用户 profile
  const { data: userProfile, error: upError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // 获取家庭中所有 profiles
  let allProfiles = []
  if (familyMember?.family_id) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', familyMember.family_id)
    
    allProfiles = data || []
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">用户数据调试</h1>
      
      <div className="space-y-6">
        {/* Auth User */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2">Auth User</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
          </pre>
        </div>

        {/* Family Member */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2">Family Member</h2>
          {fmError && <p className="text-red-600 text-sm mb-2">错误: {fmError.message}</p>}
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(familyMember, null, 2)}
          </pre>
        </div>

        {/* Admin Profile */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2">Admin Profile (家长)</h2>
          {adminError && <p className="text-red-600 text-sm mb-2">错误: {adminError.message}</p>}
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(adminProfile, null, 2)}
          </pre>
        </div>

        {/* User Profile */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2">User Profile</h2>
          {upError && <p className="text-red-600 text-sm mb-2">错误: {upError.message}</p>}
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>

        {/* All Family Profiles */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2">家庭中所有 Profiles</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(allProfiles, null, 2)}
          </pre>
        </div>

        {/* 计算结果 */}
        <div className="bg-blue-50 p-4 rounded-lg shadow border-2 border-blue-200">
          <h2 className="font-bold text-lg mb-2">最终显示结果</h2>
          <div className="space-y-2">
            <p><strong>显示名称:</strong> {adminProfile?.name || userProfile?.name || user.email?.split('@')[0] || '用户'}</p>
            <p><strong>头像URL:</strong> {adminProfile?.avatar_url || userProfile?.avatar_url || '无'}</p>
            <p><strong>头像颜色:</strong> {adminProfile?.avatar_color || userProfile?.avatar_color || '无'}</p>
            <p><strong>角色:</strong> {userProfile?.role || 'author'}</p>
            <p><strong>元气值:</strong> {userProfile?.balance || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
