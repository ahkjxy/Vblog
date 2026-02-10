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
    <div className="min-h-screen bg-gray-50">
      {/* Forum Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-pink-600 mb-4 font-medium"
            >
              ← 返回首页
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
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
          {postList.length > 0 ? (
            <div className="space-y-3">
              {postList.map((post) => (
                <article key={post.id} className="bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 hover:border-purple-300">
                  <Link href={`/blog/${post.slug}`} className="block p-5">
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
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {post.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors mb-2 line-clamp-1">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        )}
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
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">该板块还没有主题</h3>
                <p className="text-gray-600 mb-6">成为第一个发帖的人</p>
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  浏览所有主题
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {postList.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <Link
                  href={`/categories/${slug}?page=${currentPage - 1}`}
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
                      href={`/categories/${slug}?page=${pageNum}`}
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
                  href={`/categories/${slug}?page=${currentPage + 1}`}
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
        </div>
      </div>
    </div>
  )
}
