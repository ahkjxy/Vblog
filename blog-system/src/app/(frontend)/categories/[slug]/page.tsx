import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { Calendar, Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

const POSTS_PER_PAGE = 20

type PostWithProfile = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  view_count: number
  status: string
  review_status: string
  profiles: {
    name: string
    avatar_url: string | null
  } | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return {
      title: '分类未找到'
    }
  }

  return {
    title: `${category.name} - 分类`,
    description: category.description || `浏览 ${category.name} 分类下的所有文章`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const currentPage = Number(searchParamsResolved.page) || 1
  const offset = (currentPage - 1) * POSTS_PER_PAGE
  
  const supabase = await createClient()
  
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  const { data: postCategories } = await supabase
    .from('post_categories')
    .select('post_id')
    .eq('category_id', category.id)

  const postIds = postCategories?.map(pc => pc.post_id) || []

  // 获取总数
  const { count: totalCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .in('id', postIds)
    .eq('status', 'published')
    .eq('review_status', 'approved')
  
  const totalPages = Math.ceil((totalCount || 0) / POSTS_PER_PAGE)

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      view_count,
      status,
      review_status,
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .in('id', postIds)
    .eq('status', 'published')
    .eq('review_status', 'approved')
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  const postList = (posts || []).map(post => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
  })) as PostWithProfile[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Forum Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FF4D94] hover:text-[#7C4DFF] mb-4 font-bold"
            >
              ← 返回首页
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">{category.name}</h1>
                {category.description && (
                  <p className="text-sm sm:text-base text-gray-600 font-medium">{category.description}</p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-black text-[#FF4D94]">{totalCount || 0}</div>
                <div className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider">主题</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forum Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {postList.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {postList.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl hover:shadow-xl transition-all border border-gray-100 hover:border-[#FF4D94]/30">
                  <Link href={`/blog/${post.slug}`} className="block p-4 sm:p-5 md:p-6">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {post.profiles?.avatar_url ? (
                          <img 
                            src={post.profiles.avatar_url} 
                            alt={post.profiles.name}
                            className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black text-sm sm:text-base">
                            {post.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-black text-gray-900 hover:text-[#FF4D94] transition-colors mb-2 line-clamp-2 leading-snug">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed font-medium">{post.excerpt}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          <span className="font-bold text-gray-700">{formatAuthorName(post.profiles)}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.published_at!)}
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count} 浏览
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex-shrink-0 text-center hidden md:block">
                        <div className="text-lg sm:text-xl font-black text-[#FF4D94]">{post.view_count}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">浏览</div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF4D94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2 text-gray-900">该板块还没有主题</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 font-medium">成为第一个发帖的人</p>
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:shadow-xl transition-all font-black text-sm sm:text-base"
                >
                  浏览所有主题
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {postList.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 sm:mt-12">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <Link
                  href={`/categories/${slug}?page=${currentPage - 1}`}
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
                      href={`/categories/${slug}?page=${pageNum}`}
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
                  href={`/categories/${slug}?page=${currentPage + 1}`}
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
        </div>
      </div>
    </div>
  )
}
