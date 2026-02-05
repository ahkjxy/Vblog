import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">文章管理</h1>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建文章
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">标题</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">状态</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">作者</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">发布时间</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">阅读量</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts?.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{post.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    post.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : post.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {post.profiles?.username}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {post.published_at ? formatDate(post.published_at) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {post.view_count}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!posts || posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            暂无文章
          </div>
        )}
      </div>
    </div>
  )
}
