import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { Calendar, Eye, User, ArrowRight, ChevronLeft, ChevronRight, MessageCircle, TrendingUp, Clock, FileText } from 'lucide-react'
import { FamilyBankCTA } from '@/components/FamilyBankCTA'
import { BannerAd, FeedAd } from '@/components/ads'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '社区讨论',
  description: '元气银行社区，家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动平台。',
  openGraph: {
    title: '社区讨论 | 元气银行',
    description: '家长们分享家庭教育经验的互动社区',
    type: 'website',
  },
}

// 定义文章类型
type PostWithProfile = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  view_count: number
  author_id: string
  profiles: {
    name: string
    avatar_url: string | null
  } | null
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

const POSTS_PER_PAGE = 20

export default async function BlogListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const offset = (currentPage - 1) * POSTS_PER_PAGE
  
  const supabase = await createClient()
  
  // 获取总数
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
  
  const totalPages = Math.ceil((totalCount || 0) / POSTS_PER_PAGE)
  
  // 尝试查询带 review_status 的文章，如果字段不存在则回退到只查询 published
  let posts: PostWithProfile[] | null = null;
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
      .range(offset, offset + POSTS_PER_PAGE - 1)
    
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
        .range(offset, offset + POSTS_PER_PAGE - 1)
      posts = fallbackData as unknown as PostWithProfile[]
    } else {
      posts = data as unknown as PostWithProfile[]
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
      .range(offset, offset + POSTS_PER_PAGE - 1)
    posts = fallbackData as unknown as PostWithProfile[]
  }

  // 为每篇文章获取评论数
  let postsWithComments = []
  if (posts) {
    postsWithComments = await Promise.all(
      posts.map(async (post: any) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .eq('status', 'approved')
        
        return {
          ...post,
          comment_count: count || 0
        }
      })
    )
  }

  // 获取热门文章（侧边栏）
  const { data: hotPosts } = await supabase
    .from('posts')
    .select('id, title, slug, view_count')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(5)

  // 获取最新文章（侧边栏）
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/30 rounded-full blur-[100px]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white mb-4 border border-white/30">
                  <MessageCircle className="w-4 h-4" />
                  <span>社区讨论</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                  所有讨论主题
                </h1>
                <p className="text-base sm:text-lg text-white/90 font-medium">家长们分享经验、交流心得的互动平台</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center">
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">{totalCount || 0}</div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">主题总数</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
          {/* 横幅广告 */}
          <BannerAd className="mb-8" />
          
              {postsWithComments && postsWithComments.length > 0 ? (
                <div className="space-y-4">
                  {postsWithComments.map((post: any, index: number) => {
                return (
                  <div key={post.id}>
                    <Link href={`/blog/${post.slug}`}>
                      <article className="group bg-white rounded-3xl hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF4D94]/30 p-5 sm:p-6 overflow-hidden">
                        <div className="flex gap-4 sm:gap-6">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {post.profiles?.avatar_url ? (
                              <img 
                                src={post.profiles.avatar_url} 
                                alt={post.profiles.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ring-2 ring-gray-100 group-hover:ring-[#FF4D94]/30 transition-all"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h2 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-[#FF4D94] transition-colors mb-2 sm:mb-3 line-clamp-2 leading-snug">
                              {post.title}
                            </h2>
                            
                            {/* Excerpt */}
                            {post.excerpt && (
                              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-medium">{post.excerpt}</p>
                            )}
                            
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-gray-900">{formatAuthorName(post.profiles)}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-bold">{formatDate(post.published_at!)}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <span className="font-bold">{post.view_count || 0}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                                <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                                  <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                <span className="font-bold">{post.comment_count || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Arrow Icon */}
                          <div className="flex-shrink-0 hidden md:flex items-center">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/10 group-hover:from-[#FF4D94] group-hover:to-[#7C4DFF] flex items-center justify-center transition-all">
                              <ArrowRight className="w-5 h-5 text-[#FF4D94] group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  
                    {/* 每隔 4 篇插入信息流广告 */}
                    {(index + 1) % 4 === 0 && index < postsWithComments.length - 1 && (
                      <FeedAd className="my-6" />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-[#FF4D94]" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-gray-900">还没有讨论主题</h3>
                <p className="text-sm text-gray-600 mb-6 font-bold">成为第一个发起讨论的人</p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-sm sm:text-base"
                >
                  登录后台发布主题
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {postsWithComments && postsWithComments.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 sm:mt-12">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#FF4D94]/30 transition-all text-sm font-bold text-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">上一页</span>
                </Link>
              ) : (
                <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">上一页</span>
                </div>
              )}
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}`}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#FF4D94]/30'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}
              </div>
              
              {/* Next Button */}
              {currentPage < totalPages ? (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#FF4D94]/30 transition-all text-sm font-bold text-gray-700"
                >
                  <span className="hidden sm:inline">下一页</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed">
                  <span className="hidden sm:inline">下一页</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          )}
          
          {/* Family Bank CTA */}
          {postsWithComments && postsWithComments.length > 0 && (
            <div className="mt-12">
              <FamilyBankCTA variant="compact" />
            </div>
          )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Hot Posts */}
              {hotPosts && hotPosts.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">热门主题</h3>
                  </div>
                  <div className="space-y-4">
                    {hotPosts.map((post: any, index: number) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                                  <Eye className="w-3 h-3 text-blue-600" />
                                </div>
                                <span>{post.view_count || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recent Posts */}
              {recentPosts && recentPosts.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">最新主题</h3>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post: any) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href="/blog"
                    className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100 text-sm text-[#FF4D94] hover:text-[#7C4DFF] font-black uppercase tracking-wider group"
                  >
                    查看更多
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {/* Banner Ad in Sidebar */}
              <BannerAd />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
