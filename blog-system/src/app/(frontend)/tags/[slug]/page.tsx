import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { Calendar, Eye, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

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
  
  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!tag) {
    return {
      title: '标签未找到'
    }
  }

  return {
    title: `#${tag.name} - 标签`,
    description: `浏览标签 #${tag.name} 下的所有文章`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tag) {
    notFound()
  }

  const { data: postTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tag.id)

  const postIds = postTags?.map(pt => pt.post_id) || []

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

  const postList = (posts || []).map(post => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
  })) as PostWithProfile[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/tags"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FF4D94] hover:text-[#7C4DFF] mb-6 font-bold"
            >
              ← 返回标签列表
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
              #{tag.name}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">
              共 {postList.length} 篇文章
            </p>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {postList.length > 0 ? (
            <div className="space-y-6">
              {postList.map((post, index) => {
                const gradients = [
                  { from: 'from-purple-500', to: 'to-pink-500' },
                  { from: 'from-pink-500', to: 'to-rose-500' },
                  { from: 'from-purple-600', to: 'to-indigo-500' },
                  { from: 'from-fuchsia-500', to: 'to-pink-500' },
                ]
                const gradient = gradients[index % gradients.length]
                
                return (
                  <article key={post.id} className="group bg-white rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF4D94]/30">
                    <div className={`h-1 w-16 sm:w-20 rounded-full bg-gradient-to-r ${gradient.from} ${gradient.to} mb-4 sm:mb-6`}></div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 group-hover:text-[#FF4D94] transition-colors leading-tight tracking-tight">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 line-clamp-2 leading-relaxed font-medium">{post.excerpt}</p>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          {post.profiles?.avatar_url ? (
                            <img 
                              src={post.profiles.avatar_url} 
                              alt={post.profiles.name}
                              className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center shadow-sm`}>
                              <span className="text-white font-black text-sm">
                                {post.profiles?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-black text-gray-900">{formatAuthorName(post.profiles)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium">{formatDate(post.published_at!)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#FF4D94]/5 px-3 py-1.5 rounded-xl border border-[#FF4D94]/10">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF4D94]" />
                          <span className="font-black text-[#FF4D94]">{post.view_count}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-xs sm:text-sm group-hover:gap-3 transition-all"
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
            <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-[#FF4D94]/20">
              <div className="max-w-md mx-auto px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4D94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">暂无文章</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 font-medium">该标签下还没有文章</p>
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:shadow-xl transition-all font-black text-sm sm:text-base hover:scale-105 active:scale-95"
                >
                  浏览所有文章
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
