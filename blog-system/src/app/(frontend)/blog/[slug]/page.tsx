import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select('title, seo_title, seo_description, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: '文章未找到'
    }
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || '',
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(username, avatar_url, bio),
      post_categories(categories(name, slug)),
      post_tags(tags(name, slug))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', post.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-orange-50 to-yellow-50 px-6 py-16 mb-8">
          <div className="max-w-3xl mx-auto">
            {/* Categories */}
            {post.post_categories && post.post_categories.length > 0 && (
              <div className="flex gap-2 mb-6">
                {post.post_categories.map((pc: any) => (
                  <a
                    key={pc.categories.slug}
                    href={`/categories/${pc.categories.slug}`}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium text-orange-600 hover:bg-orange-100 transition-colors"
                  >
                    {pc.categories.name}
                  </a>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
            
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                {post.profiles?.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.username}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                    {post.profiles?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{post.profiles?.username}</div>
                  {post.profiles?.bio && (
                    <div className="text-xs text-gray-600">{post.profiles.bio}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <time>{formatDate(post.published_at!)}</time>
                <span>•</span>
                <span>{post.view_count + 1} 阅读</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white px-6 py-12 mb-8">
          <div className="max-w-3xl mx-auto">
            <div 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
            />
          </div>
        </div>

        {/* Tags */}
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="bg-white px-6 py-8 mb-8">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {post.post_tags.map((pt: any) => (
                  <a
                    key={pt.tags.slug}
                    href={`/tags/${pt.tags.slug}`}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all"
                  >
                    #{pt.tags.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Author Bio */}
        {post.profiles?.bio && (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 px-6 py-8 mb-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-4">
                {post.profiles.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.username}
                    className="w-16 h-16 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {post.profiles.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg mb-1">关于作者</h3>
                  <p className="text-gray-700 mb-2">{post.profiles.bio}</p>
                  <p className="text-sm font-medium text-orange-600">{post.profiles.username}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="px-6 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <a 
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-lg transition-all font-medium"
            >
              ← 返回文章列表
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}

function renderContent(content: any): string {
  // Simple TipTap JSON to HTML converter
  if (!content || !content.content) return ''
  
  return content.content.map((node: any) => {
    if (node.type === 'paragraph') {
      const text = node.content?.map((c: any) => c.text || '').join('') || ''
      return `<p>${text}</p>`
    }
    if (node.type === 'heading') {
      const text = node.content?.map((c: any) => c.text || '').join('') || ''
      return `<h${node.attrs.level}>${text}</h${node.attrs.level}>`
    }
    return ''
  }).join('')
}
