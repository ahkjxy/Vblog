import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, Eye, User, ArrowRight } from 'lucide-react'

export default async function BlogListPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at, view_count, author_id, profiles!posts_author_id_fkey(username, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-orange-600 mb-4">
              元气银行博客
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">所有文章</h1>
            <p className="text-xl text-gray-600">
              共 {posts?.length || 0} 篇文章，分享家庭管理的智慧与经验
            </p>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all border border-gray-100">
                  <Link href={`/blog/${post.slug}`} className="group">
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-6 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {post.profiles?.[0]?.avatar_url ? (
                          <img 
                            src={post.profiles[0].avatar_url} 
                            alt={post.profiles[0].username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-orange-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{post.profiles?.[0]?.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.published_at!)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.view_count} 阅读</span>
                      </div>
                    </div>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
                    >
                      阅读全文
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">暂无文章</h3>
                <p className="text-gray-600 mb-6">还没有发布任何文章</p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-lg transition-all font-medium"
                >
                  登录后台创建文章
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {posts && posts.length > 0 && (
        <div className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-3xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">分享你的故事</h2>
              <p className="text-orange-50 mb-8 max-w-2xl mx-auto">
                加入元气银行社区，分享你的家庭管理经验
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-all font-medium"
              >
                免费注册
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
