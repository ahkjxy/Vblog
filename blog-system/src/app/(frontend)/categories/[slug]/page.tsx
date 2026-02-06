import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Calendar, Eye, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
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
    .select(`
      posts!inner(
        id,
        title,
        slug,
        excerpt,
        published_at,
        view_count,
        status,
        review_status,
        profiles!posts_author_id_fkey(name, avatar_url)
      )
    `)
    .eq('category_id', category.id)
    .eq('posts.status', 'published')
    .eq('posts.review_status', 'approved')

  const posts = postCategories?.map(pc => pc.posts).filter(Boolean).flat() || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <Link 
              href="/categories"
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-pink-600 mb-6 font-semibold"
            >
              ← 返回分类列表
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-gray-600 mb-6">{category.description}</p>
            )}
            <p className="text-gray-600 text-lg">
              共 {posts.length} 篇文章
            </p>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post, index) => {
                const gradients = [
                  { from: 'from-purple-500', to: 'to-pink-500' },
                  { from: 'from-pink-500', to: 'to-rose-500' },
                  { from: 'from-purple-600', to: 'to-indigo-500' },
                  { from: 'from-fuchsia-500', to: 'to-pink-500' },
                ]
                const gradient = gradients[index % gradients.length]
                
                return (
                  <article key={post.id} className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-purple-200">
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
                              <span className="text-white font-semibold">
                                {post.profiles?.[0]?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">{post.profiles?.[0]?.name}</span>
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
                <p className="text-gray-600 mb-10 text-lg">该分类下还没有文章</p>
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg hover:scale-105"
                >
                  浏览所有文章
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
