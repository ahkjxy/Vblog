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

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, avatar_url')
    .eq('id', user.id)
    .single()

  const navItems = [
    { href: '/dashboard', icon: 'LayoutDashboard', label: '概览' },
    { href: '/dashboard/posts', icon: 'FileText', label: '文章' },
    { href: '/dashboard/media', icon: 'Image', label: '媒体库' },
    { href: '/dashboard/categories', icon: 'FolderOpen', label: '分类' },
    { href: '/dashboard/tags', icon: 'Tag', label: '标签' },
    { href: '/dashboard/comments', icon: 'MessageSquare', label: '评论' },
  ]

  if (profile?.role === 'admin') {
    navItems.push(
      { href: '/dashboard/users', icon: 'Users', label: '用户' },
      { href: '/dashboard/settings', icon: 'Settings', label: '设置' }
    )
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
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md border-2 border-white">
                    <span className="text-white font-bold">
                      {profile?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-gray-900">{profile?.username}</div>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-white rounded-full text-xs font-medium text-purple-700 border border-purple-200">
                    {profile?.role === 'admin' ? '管理员' : profile?.role === 'editor' ? '编辑' : '作者'}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <DashboardNav items={navItems} />
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-6 left-5 right-5">
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
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
