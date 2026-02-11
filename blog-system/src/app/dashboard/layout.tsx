import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ToastProvider } from '@/components/ui'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { 
  Home,
  LayoutDashboard,
  FileText,
  Image,
  FolderOpen,
  Tag,
  MessageSquare,
  MessageCircle,
  Users,
  Settings,
} from 'lucide-react'

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

  // 图标映射
  const iconMap = {
    LayoutDashboard,
    FileText,
    Image,
    FolderOpen,
    Tag,
    MessageSquare,
    MessageCircle,
    Users,
    Settings,
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
      <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
        {/* Top Bar - Desktop */}
        <div className="hidden lg:block fixed top-0 right-0 left-72 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-40 shadow-sm">
          <div className="flex items-center justify-between px-6 lg:px-8 py-4">
            <div className="text-sm font-bold text-gray-600">
              欢迎回来，<span className="text-[#FF4D94] font-black">{userName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-9 h-9 rounded-xl border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-sm border-2 border-white">
                    <span className="text-white text-sm font-black">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="text-sm font-black text-gray-900">{userName}</div>
                  <div className={`text-xs font-bold ${
                    isSuperAdmin ? 'text-[#FF4D94]' : 'text-gray-500'
                  }`}>
                    {getRoleLabel()}
                  </div>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:flex lg:flex-col w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 min-h-screen fixed left-0 top-0 shadow-xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white p-2.5 shadow-lg group-hover:scale-105 transition-transform">
                    <Logo className="w-full h-full" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">元气银行</span>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">管理后台</span>
                </div>
              </Link>
            </div>

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              <DashboardNav items={navItems} />
            </div>

            {/* Bottom Actions - Fixed at bottom */}
            <div className="p-5 border-t border-gray-100 space-y-2 flex-shrink-0">
              <a 
                href="https://www.familybank.chat/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white transition-all text-sm font-black hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>家庭积分系统</span>
              </a>
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all text-sm font-bold text-gray-700 hover:text-[#FF4D94] border border-gray-100 hover:border-[#FF4D94]/30"
              >
                <Home className="w-5 h-5" />
                <span>返回首页</span>
              </Link>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white p-2 shadow-lg">
                  <Logo className="w-full h-full" />
                </div>
                <span className="text-base font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">元气银行</span>
              </Link>
              <div className="flex items-center gap-2">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-9 h-9 rounded-xl border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white text-xs font-black shadow-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile Navigation */}
            <div className="px-4 pb-3 overflow-x-auto">
              <div className="flex gap-2">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gradient-to-r hover:from-[#FF4D94]/10 hover:to-[#7C4DFF]/10 hover:text-[#FF4D94] transition-all whitespace-nowrap border border-transparent hover:border-[#FF4D94]/20"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 lg:ml-72 lg:mt-[73px] p-4 sm:p-6 lg:p-8 pt-32 lg:pt-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
