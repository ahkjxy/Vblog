import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  FolderOpen, 
  Tag, 
  MessageSquare, 
  Users, 
  Settings,
  LogOut
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, avatar_url')
    .eq('id', user.id)
    .single()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: '概览' },
    { href: '/dashboard/posts', icon: FileText, label: '文章' },
    { href: '/dashboard/media', icon: Image, label: '媒体库' },
    { href: '/dashboard/categories', icon: FolderOpen, label: '分类' },
    { href: '/dashboard/tags', icon: Tag, label: '标签' },
    { href: '/dashboard/comments', icon: MessageSquare, label: '评论' },
  ]

  if (profile?.role === 'admin') {
    navItems.push(
      { href: '/dashboard/users', icon: Users, label: '用户' },
      { href: '/dashboard/settings', icon: Settings, label: '设置' }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen fixed left-0 top-0">
          <div className="p-6 border-b">
            <Link href="/dashboard" className="text-xl font-bold">
              博客管理
            </Link>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-6">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{profile?.username}</div>
                <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="absolute bottom-6 left-4 right-4">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
