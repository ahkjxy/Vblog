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
      posts(
        id,
        title,
        slug,
        excerpt,
        published_at,
        view_count,
        profiles(username, avatar_url)
      )
    `)
    .eq('category_id', category.id)

  const posts = postCategories?.map(pc => pc.posts).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/categories"
              className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 mb-6"
            >
              ← 返回分类列表
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-gray-600 mb-4">{category.description}</p>
            )}
            <p className="text-gray-600">
              共 {posts.length} 篇文章
            </p>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {posts.length > 0 ? (
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
                        {post.profiles?.avatar_url ? (
                          <img 
                            src={post.profiles.avatar_url} 
                            alt={post.profiles.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-semibold text-sm">
                              {post.profiles?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{post.profiles?.username}</span>
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
                <h3 className="text-lg font-semibold mb-2">暂无文章</h3>
                <p className="text-gray-600 mb-6">该分类下还没有文章</p>
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-lg transition-all font-medium"
                >
                  浏览所有文章
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
