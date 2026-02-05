import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ArrowRight, Calendar, Eye } from 'lucide-react'
import { FamilyBankCTA } from '@/components/FamilyBankCTA'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at, view_count, author_id, profiles!posts_author_id_fkey(username, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12)

  const { data: featuredPost } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, published_at, view_count, author_id, profiles!posts_author_id_fkey(username, avatar_url)')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Family Bank CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-b">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <FamilyBankCTA />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full text-sm font-medium text-orange-900 mb-6">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
              精选文章
            </div>
            <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
              <Link href={`/blog/${featuredPost.slug}`} className="group">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 group-hover:text-[#FF4D94] transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
              </Link>
              {featuredPost.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">{featuredPost.excerpt}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  {featuredPost.profiles?.[0]?.avatar_url ? (
                    <img 
                      src={featuredPost.profiles[0].avatar_url} 
                      alt={featuredPost.profiles[0].username}
                      className="w-12 h-12 rounded-full ring-2 ring-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-semibold shadow-sm">
                      {featuredPost.profiles?.[0]?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{featuredPost.profiles?.[0]?.username}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(featuredPost.published_at!)}</span>
                      <span>•</span>
                      <span>{featuredPost.view_count} 阅读</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">最新文章</h2>
              <p className="text-gray-600">探索最新的家庭管理智慧</p>
            </div>
            <Link href="/blog" className="text-sm font-medium text-[#FF4D94] hover:text-[#7C4DFF] flex items-center gap-2 transition-colors">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => {
                const colors = [
                  'from-[#FF4D94] to-[#FF7AB8]',
                  'from-[#FFA726] to-[#FFB74D]',
                  'from-[#7C4DFF] to-[#9575CD]',
                  'from-[#42A5F5] to-[#64B5F6]',
                ]
                const colorClass = colors[index % colors.length]
                
                return (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="bg-white rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-3 group-hover:text-[#FF4D94] transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">{post.excerpt}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            {post.profiles?.[0]?.avatar_url ? (
                              <img 
                                src={post.profiles[0].avatar_url} 
                                alt={post.profiles[0].username}
                                className="w-8 h-8 rounded-full ring-2 ring-gray-100"
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
                                {post.profiles?.[0]?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-gray-900 text-sm">{post.profiles?.[0]?.username}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{post.view_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#FF4D94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">暂无文章</h3>
                <p className="text-gray-600 mb-8">还没有发布任何文章，开始创作第一篇吧</p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-xl transition-all font-medium"
                >
                  登录后台创建文章
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 shadow-xl text-center border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">开始你的创作之旅</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              分享你的想法和经验，让更多人看到你的故事
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-xl hover:scale-105 transition-all font-medium text-lg"
              >
                免费注册
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 rounded-full hover:border-[#FF4D94] hover:text-[#FF4D94] transition-all font-medium text-lg"
              >
                浏览更多文章
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
