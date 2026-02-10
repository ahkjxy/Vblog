import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { Calendar, Eye, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Forum Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 社区讨论</h1>
                <p className="text-gray-600">家长们分享经验、交流心得的互动平台</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{totalCount || 0}</div>
                <div className="text-sm text-gray-500">主题</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forum Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 横幅广告 */}
          <BannerAd className="mb-8" />
          
          {posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post, index) => {
                return (
                  <div key={post.id}>
                    {/* Forum Thread Item */}
                    <Link href={`/blog/${post.slug}`}>
                      <article className="bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-purple-300 p-5">
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
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h2 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors mb-2 line-clamp-1">
                              {post.title}
                            </h2>
                            
                            {/* Excerpt */}
                            {post.excerpt && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                            )}
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{formatAuthorName(post.profiles)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.published_at!)}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.view_count} 浏览
                              </div>
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex-shrink-0 text-center hidden sm:block">
                            <div className="text-lg font-bold text-purple-600">{post.view_count}</div>
                            <div className="text-xs text-gray-500">浏览</div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  
                    {/* 每隔 4 篇插入信息流广告 */}
                    {(index + 1) % 4 === 0 && index < posts.length - 1 && (
                      <FeedAd className="my-6" />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">还没有讨论主题</h3>
                <p className="text-gray-600 mb-6">成为第一个发起讨论的人</p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  登录后台发布主题
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {posts && posts.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </Link>
              ) : (
                <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  上一页
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed">
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          )}
          
          {/* Family Bank CTA */}
          {posts && posts.length > 0 && (
            <div className="mt-12">
              <FamilyBankCTA variant="compact" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
