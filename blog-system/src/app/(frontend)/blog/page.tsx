import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function BlogListPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">所有文章</h1>
        <p className="text-gray-600 mb-12">共 {posts?.length || 0} 篇文章</p>

        <div className="space-y-8">
          {posts?.map((post) => (
            <article key={post.id} className="border-b pb-8 last:border-0">
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-gray-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              {post.excerpt && (
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {post.profiles?.avatar_url && (
                    <img 
                      src={post.profiles.avatar_url} 
                      alt={post.profiles.username}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{post.profiles?.username}</span>
                </div>
                <span>•</span>
                <time>{formatDate(post.published_at!)}</time>
                <span>•</span>
                <span>{post.view_count} 次阅读</span>
              </div>
            </article>
          ))}
        </div>

        {!posts || posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">暂无文章</p>
            <Link 
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              登录后台创建第一篇文章 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
