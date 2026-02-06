import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { Calendar, Eye, User, ArrowRight } from 'lucide-react'
import { FamilyBankCTA } from '@/components/FamilyBankCTA'

export default async function BlogListPage() {
  const supabase = await createClient()
  
  // 尝试查询带 review_status 的文章，如果字段不存在则回退到只查询 published
  let posts = null;
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        excerpt, 
        published_at, 
        view_count, 
        author_id, 
        profiles!posts_author_id_fkey(
          name, 
          avatar_url
        )
      `)
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .order('published_at', { ascending: false })
    
    if (error && error.code === '42703') {
      // 字段不存在，回退到只查询 published
      const { data: fallbackData } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          slug, 
          excerpt, 
          published_at, 
          view_count, 
          author_id, 
          profiles!posts_author_id_fkey(
            name, 
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      posts = fallbackData
    } else {
      posts = data
    }
  } catch (err) {
    // 如果出错，尝试不带 review_status 的查询
    const { data: fallbackData } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        excerpt, 
        published_at, 
        view_count, 
        author_id, 
        profiles!posts_author_id_fkey(
          name, 
          avatar_url
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    posts = fallbackData
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero with Family Bank CTA */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                元气银行博客
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                所有文章
              </h1>
              <p className="text-xl text-gray-600">
                共 {posts?.length || 0} 篇文章，分享家庭管理的智慧与经验
              </p>
            </div>
            
            {/* Family Bank CTA */}
            <div className="mt-16">
              <FamilyBankCTA variant="compact" />
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post, index) => {
                const gradients = [
                  { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-50' },
                  { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-50' },
                  { from: 'from-purple-600', to: 'to-indigo-500', bg: 'bg-purple-50' },
                  { from: 'from-fuchsia-500', to: 'to-pink-500', bg: 'bg-fuchsia-50' },
                ]
                const gradient = gradients[index % gradients.length]
                
                return (
                  <article key={post.id} className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-purple-200">
                    {/* Color accent bar */}
                    <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${gradient.from} ${gradient.to} mb-6`}></div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-3xl font-bold mb-4 group-hover:text-purple-600 transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-8 line-clamp-2 text-lg leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          {post.profiles?.[0]?.avatar_url ? (
                            <img 
                              src={post.profiles[0].avatar_url} 
                              alt={post.profiles[0].name}
                              className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center shadow-sm`}>
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">{formatAuthorName(post.profiles?.[0])}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.published_at!)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                          <Eye className="w-4 h-4" />
                          <span>{post.view_count}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-2 text-purple-600 hover:text-pink-600 font-semibold text-sm group-hover:gap-3 transition-all"
                      >
                        阅读全文
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-purple-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">暂无文章</h3>
                <p className="text-gray-600 mb-10 text-lg">还没有发布任何文章</p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg hover:scale-105"
                >
                  登录后台创建文章
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {posts && posts.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-t border-purple-100">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-6xl mx-auto">
              <FamilyBankCTA />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
