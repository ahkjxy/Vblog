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
    <div className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              {post.profiles?.avatar_url && (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.username}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{post.profiles?.username}</span>
            </div>
            <span>•</span>
            <time>{formatDate(post.published_at!)}</time>
            <span>•</span>
            <span>{post.view_count + 1} 次阅读</span>
          </div>

          {post.post_categories && post.post_categories.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.post_categories.map((pc: any) => (
                <a
                  key={pc.categories.slug}
                  href={`/categories/${pc.categories.slug}`}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {pc.categories.name}
                </a>
              ))}
            </div>
          )}
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {post.post_tags && post.post_tags.length > 0 && (
          <footer className="mt-12 pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {post.post_tags.map((pt: any) => (
                <a
                  key={pt.tags.slug}
                  href={`/tags/${pt.tags.slug}`}
                  className="px-3 py-1 bg-gray-50 border rounded-full text-sm hover:bg-gray-100 transition-colors"
                >
                  #{pt.tags.name}
                </a>
              ))}
            </div>
          </footer>
        )}
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
