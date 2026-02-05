import { createClient } from '@/lib/supabase/server'
import { FileText, Eye, MessageSquare } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalComments },
    { data: totalViews }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('view_count')
  ])

  const viewCount = totalViews?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, status, created_at, view_count')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: '总文章数', value: totalPosts || 0, icon: FileText, color: 'bg-blue-500' },
    { label: '已发布', value: publishedPosts || 0, icon: FileText, color: 'bg-green-500' },
    { label: '总阅读量', value: viewCount, icon: Eye, color: 'bg-purple-500' },
    { label: '评论数', value: totalComments || 0, icon: MessageSquare, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">概览</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">最近文章</h2>
        </div>
        <div className="divide-y">
          {recentPosts?.map((post) => (
            <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h3 className="font-medium mb-1">{post.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(post.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  post.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status === 'published' ? '已发布' : '草稿'}
                </span>
                <span className="text-sm text-gray-600">{post.view_count} 阅读</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
