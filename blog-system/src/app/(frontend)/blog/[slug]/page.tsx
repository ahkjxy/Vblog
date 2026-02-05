import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarkdownContent } from '@/components/MarkdownContent'
import { FamilyBankCTA } from '@/components/FamilyBankCTA'

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <article className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 px-6 py-20 mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            {post.post_categories && post.post_categories.length > 0 && (
              <div className="flex gap-2 mb-6">
                {post.post_categories.map((pc: { categories: { slug: string; name: string } }) => (
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
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-[1.1] text-gray-900">{post.title}</h1>
            
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed font-light">{post.excerpt}</p>
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
        <div className="bg-white px-6 py-16 mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="article-content">
              {renderPostContent(post.content)}
            </div>
          </div>
        </div>

        {/* Tags */}
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="bg-white px-6 py-10 mb-8 border-t border-gray-100">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">相关标签</h3>
              <div className="flex flex-wrap gap-3">
                {post.post_tags.map((pt: { tags: { slug: string; name: string } }) => (
                  <a
                    key={pt.tags.slug}
                    href={`/tags/${pt.tags.slug}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-full text-sm font-medium text-orange-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 hover:border-orange-300 hover:shadow-md transition-all"
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
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 px-6 py-12 mb-12 border-y border-orange-100">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-6 items-start">
                {post.profiles.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.username}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg border-4 border-white">
                    {post.profiles.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">关于作者</h3>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{post.profiles.username}</p>
                  <p className="text-gray-700 leading-relaxed">{post.profiles.bio}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Family Bank CTA */}
        <div className="px-6 mb-12">
          <div className="max-w-3xl mx-auto">
            <FamilyBankCTA variant="compact" />
          </div>
        </div>

        {/* Back to Blog */}
        <div className="px-6 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all font-medium text-lg"
            >
              ← 返回文章列表
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

interface ContentNode {
  type: string
  content?: Array<{ text?: string; marks?: Array<{ type: string }> }>
  attrs?: { level?: number; src?: string; alt?: string }
  text?: string
}

interface TipTapContent {
  type: string
  content?: ContentNode[]
}

function renderPostContent(content: TipTapContent | string | null) {
  if (!content) return <p className="text-gray-500">暂无内容</p>
  
  // Check if content is a string (Markdown)
  if (typeof content === 'string') {
    return <MarkdownContent content={content} />
  }
  
  // Check if content is TipTap JSON
  if (typeof content === 'object' && content.type === 'doc') {
    return (
      <div 
        className="prose prose-lg max-w-none 
          prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
          prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:leading-tight
          prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:leading-snug prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3
          prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug
          prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.0625rem]
          prose-a:text-orange-600 prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-orange-700
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[0.9em]
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:my-8 prose-pre:shadow-lg
          prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:bg-orange-50/30 prose-blockquote:rounded-r-lg prose-blockquote:my-6
          prose-ul:mb-6 prose-ul:space-y-2
          prose-ol:mb-6 prose-ol:space-y-2
          prose-li:text-gray-700 prose-li:leading-relaxed
          prose-img:rounded-xl prose-img:shadow-xl prose-img:my-8 prose-img:border prose-img:border-gray-200"
        dangerouslySetInnerHTML={{ __html: renderTipTapContent(content) }}
      />
    )
  }
  
  // Fallback: try to render as markdown
  return <MarkdownContent content={String(content)} />
}

function renderTipTapContent(content: TipTapContent): string {
  if (!content || !content.content) return ''
  
  return content.content.map((node: ContentNode) => {
    if (node.type === 'paragraph') {
      const text = node.content?.map((c) => {
        let txt = c.text || ''
        if (c.marks) {
          c.marks.forEach(mark => {
            if (mark.type === 'bold') txt = `<strong>${txt}</strong>`
            if (mark.type === 'italic') txt = `<em>${txt}</em>`
            if (mark.type === 'code') txt = `<code>${txt}</code>`
          })
        }
        return txt
      }).join('') || ''
      return `<p>${text}</p>`
    }
    if (node.type === 'heading') {
      const text = node.content?.map((c) => c.text || '').join('') || ''
      const level = node.attrs?.level || 1
      return `<h${level}>${text}</h${level}>`
    }
    if (node.type === 'bulletList') {
      const items = node.content?.map(item => {
        const text = item.content?.map(p => 
          p.content?.map(c => c.text || '').join('') || ''
        ).join('') || ''
        return `<li>${text}</li>`
      }).join('') || ''
      return `<ul>${items}</ul>`
    }
    if (node.type === 'orderedList') {
      const items = node.content?.map(item => {
        const text = item.content?.map(p => 
          p.content?.map(c => c.text || '').join('') || ''
        ).join('') || ''
        return `<li>${text}</li>`
      }).join('') || ''
      return `<ol>${items}</ol>`
    }
    if (node.type === 'codeBlock') {
      const text = node.content?.map((c) => c.text || '').join('') || ''
      return `<pre><code>${text}</code></pre>`
    }
    if (node.type === 'blockquote') {
      const text = node.content?.map(p => 
        p.content?.map(c => c.text || '').join('') || ''
      ).join('') || ''
      return `<blockquote>${text}</blockquote>`
    }
    if (node.type === 'image') {
      return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`
    }
    return ''
  }).join('')
}
