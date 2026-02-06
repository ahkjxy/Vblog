import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ToastProvider } from '@/components/ui'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 获取用户自己的 profile（博客系统的 profiles 表）
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('username, email, avatar_url, role, bio')
    .eq('id', user.id)
    .maybeSingle()

  // 博客系统的超级管理员判断：直接通过 role = 'admin'
  const isSuperAdmin = userProfile?.role === 'admin'

  // 使用博客系统的字段
  const userName = userProfile?.username || user.email?.split('@')[0] || '用户'
  const userRole = userProfile?.role || 'author'
  const userAvatar = userProfile?.avatar_url
  const userEmail = userProfile?.email || user.email

  const navItems = [
    { href: '/dashboard', icon: 'LayoutDashboard', label: '概览' },
    { href: '/dashboard/posts', icon: 'FileText', label: '文章' },
    { href: '/dashboard/media', icon: 'Image', label: '媒体库' },
    { href: '/dashboard/categories', icon: 'FolderOpen', label: '分类' },
    { href: '/dashboard/tags', icon: 'Tag', label: '标签' },
    { href: '/dashboard/comments', icon: 'MessageSquare', label: '评论' },
  ]

  // 只有 admin 角色才能看到用户和设置菜单
  if (userRole === 'admin') {
    navItems.push(
      { href: '/dashboard/users', icon: 'Users', label: '用户' },
      { href: '/dashboard/settings', icon: 'Settings', label: '设置' }
    )
  }

  // Debug info - 可以在开发时查看
  const debugInfo = {
    user: {
      id: user.id,
      email: user.email,
    },
    familyMember: familyMember,
    adminProfile: adminProfile,
    userProfile: userProfile,
    computed: {
      isSuperAdmin,
      userName,
      userRole,
      familyAdminName,
    }
  }

  // 在控制台打印调试信息
  if (typeof window !== 'undefined') {
    console.log('=== Dashboard Debug Info ===')
    console.log('User ID:', user.id)
    console.log('User Email:', user.email)
    console.log('Family Member:', familyMember)
    console.log('Admin Profile:', adminProfile)
    console.log('User Profile:', userProfile)
    console.log('Is Super Admin:', isSuperAdmin)
    console.log('User Role:', userRole)
    console.log('===========================')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-purple-100 min-h-screen fixed left-0 top-0 shadow-xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-purple-100">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white p-2 shadow-lg">
                    <Logo className="w-full h-full" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">元气银行</span>
                  <span className="text-xs text-gray-500 font-medium">管理后台</span>
                </div>
              </Link>
            </div>

            {/* User Profile */}
            <div className="p-5">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm mb-6">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md border-2 border-white">
                    <span className="text-white font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-gray-900">{userName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      isSuperAdmin 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200' 
                        : 'bg-white text-purple-700 border-purple-200'
                    }`}>
                      {isSuperAdmin ? '超级管理员' : userRole === 'admin' ? '管理员' : userRole === 'editor' ? '编辑' : '作者'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <DashboardNav items={navItems} />
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-6 left-5 right-5 space-y-2">
              <a 
                href="https://www.familybank.chat/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all text-sm font-semibold hover:shadow-lg hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>进入家庭积分系统</span>
              </a>
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all text-sm font-semibold text-gray-700 hover:text-purple-700 border border-transparent hover:border-purple-200"
              >
                <LogOut className="w-5 h-5" />
                <span>返回首页</span>
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 ml-72 p-8">
            {/* Debug Info Bar - 始终显示 */}
            <div className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-purple-900">🐛 调试信息</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isSuperAdmin 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {isSuperAdmin ? '✅ 超级管理员' : '❌ 非超管'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-purple-700 mb-1">👤 用户</div>
                  <div className="text-xs space-y-1">
                    <div className="truncate"><span className="text-gray-600">ID:</span> {user.id}</div>
                    <div className="truncate"><span className="text-gray-600">Email:</span> {user.email}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-blue-700 mb-1">📋 档案（博客系统）</div>
                  <div className="text-xs space-y-1">
                    <div><span className="text-gray-600">Username:</span> {userProfile?.username || '无'}</div>
                    <div><span className="text-gray-600">Role:</span> <span className="font-bold">{userProfile?.role || '无'}</span></div>
                    <div><span className="text-gray-600">Email:</span> {userProfile?.email || '无'}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="font-semibold text-green-700 mb-1">⚙️ 计算结果</div>
                  <div className="text-xs space-y-1">
                    <div><span className="text-gray-600">Display Name:</span> {userName}</div>
                    <div><span className="text-gray-600">Display Role:</span> {userRole}</div>
                    <div>
                      <span className="text-gray-600">Is Super Admin:</span>{' '}
                      <span className={isSuperAdmin ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {isSuperAdmin ? '✅ 是' : '❌ 否'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-white rounded-lg p-3 border-2 border-red-300">
                <div className="font-semibold text-red-700 mb-2">🔍 超管判断（博客系统）</div>
                <div className="text-xs text-gray-600">
                  <div>
                    <span className="text-gray-600">role === 'admin':</span>{' '}
                    <span className={`font-bold ${userProfile?.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                      {userProfile?.role === 'admin' ? '✅ 是' : `❌ 否 (${userProfile?.role})`}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-500">
                    注意：博客系统使用自己的 profiles 表，字段为 username, email, role, bio, avatar_url
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
