import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ToastProvider } from '@/components/ui'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { Home } from 'lucide-react'

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

  // 查询用户 profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // 博客系统的超级管理员判断
  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = userProfile?.role === 'admin' && userProfile?.family_id === SUPER_ADMIN_FAMILY_ID

  const userName = userProfile?.name || user.email?.split('@')[0] || '用户'
  const userRole = userProfile?.role || 'author'
  const userAvatar = userProfile?.avatar_url

  const getRoleLabel = () => {
    if (isSuperAdmin) return '超级管理员'
    if (userRole === 'admin') return '家长'
    if (userRole === 'editor') return '编辑'
    return '作者'
  }

  // 根据用户权限动态生成导航菜单
  const navItems = [
    { href: '/dashboard', icon: 'LayoutDashboard', label: '概览' },
    { href: '/dashboard/posts', icon: 'FileText', label: '文章' },
    { href: '/dashboard/media', icon: 'Image', label: '媒体库' },
    { href: '/dashboard/feedback', icon: 'MessageCircle', label: '反馈留言' },
  ]

  if (isSuperAdmin) {
    navItems.push(
      { href: '/dashboard/categories', icon: 'FolderOpen', label: '分类' },
      { href: '/dashboard/tags', icon: 'Tag', label: '标签' },
      { href: '/dashboard/comments', icon: 'MessageSquare', label: '评论' },
      { href: '/dashboard/users', icon: 'Users', label: '用户' },
      { href: '/dashboard/settings', icon: 'Settings', label: '设置' }
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
        <div className="flex">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:flex lg:flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-purple-100 min-h-screen fixed left-0 top-0 shadow-xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-purple-100 flex-shrink-0">
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

            {/* User Profile & Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
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
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <DashboardNav items={navItems} />
            </div>

            {/* Bottom Actions - Fixed at bottom */}
            <div className="p-5 border-t border-purple-100 space-y-2 flex-shrink-0">
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
                <Home className="w-5 h-5" />
                <span>返回首页</span>
              </Link>
              <LogoutButton />
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-purple-100 z-50 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white p-1.5 shadow-md">
                  <Logo className="w-full h-full" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">元气银行</span>
              </Link>
              <div className="flex items-center gap-2">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-8 h-8 rounded-full border-2 border-purple-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile Navigation */}
            <div className="px-4 pb-3 overflow-x-auto">
              <div className="flex gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 pt-32 lg:pt-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
