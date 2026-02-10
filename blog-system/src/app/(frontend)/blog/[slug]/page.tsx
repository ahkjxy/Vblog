import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatAuthorName } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarkdownContent } from '@/components/MarkdownContent'
import { Comments } from '@/components/Comments'
import { InArticleAd, SidebarAd } from '@/components/ads'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  let post = null;
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('title, seo_title, seo_description, excerpt, status, review_status, published_at, author_id, profiles!posts_author_id_fkey(name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .maybeSingle()
    
    if (error && error.code === '42703') {
      const { data: fallbackData } = await supabase
        .from('posts')
        .select('title, seo_title, seo_description, excerpt, status, review_status, published_at, author_id, profiles!posts_author_id_fkey(name)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      post = fallbackData
    } else if (!error) {
      post = data
    }
  } catch (err) {
    const { data: fallbackData } = await supabase
      .from('posts')
      .select('title, seo_title, seo_description, excerpt, status, review_status, published_at, author_id, profiles!posts_author_id_fkey(name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    post = fallbackData
  }

  if (!post) {
    return {
      title: '文章未找到'
    }
  }

  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || ''
  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
  const authorName = profile?.name || '元气银行团队'
  const publishedTime = post.published_at ? new Date(post.published_at).toISOString() : undefined

  return {
    title,
    description,
    authors: [{ name: authorName }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      authors: [authorName],
      siteName: '元气银行博客',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://blog.familybank.chat/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  console.log('=== Blog Post Debug ===')
  console.log('Requested slug:', slug)
  
  // 步骤 1: 先查询文章是否存在（不加任何过滤条件）
  const { data: checkPost, error: checkError } = await supabase
    .from('posts')
    .select('id, title, slug, status, review_status, author_id, published_at')
    .eq('slug', slug)
    .maybeSingle()
  
  // 步骤 2: 查询已发布的文章（不检查 review_status）
  const { data: publishedCheck } = await supabase
    .from('posts')
    .select('id, title, status, review_status')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  
  // 步骤 3: 查询已发布且审核通过的文章
  const { data: approvedCheck } = await supabase
    .from('posts')
    .select('id, title, status, review_status')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('review_status', 'approved')
    .maybeSingle()
  
  let post = null;
  
  try {
    // 尝试完整查询（带 review_status）
    // 明确指定使用 author_id 外键关系
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey(name, avatar_url, bio),
        post_categories(categories(name, slug)),
        post_tags(tags(name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .maybeSingle()
    
    if (error && error.code === '42703') {
      // review_status 字段不存在
      const { data: fallbackData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(name, avatar_url, bio),
          post_categories(categories(name, slug)),
          post_tags(tags(name, slug))
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      
      post = fallbackData
    } else if (!error) {
      post = data
    }
  } catch (err) {
    // 出错时回退到不检查 review_status
    const { data: fallbackData } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey(name, avatar_url, bio),
        post_categories(categories(name, slug)),
        post_tags(tags(name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    
    post = fallbackData
  }

  if (!post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', post.id)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 主内容区 - 占 8 列 */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="py-12 sm:py-16 border-b border-gray-100">
          {/* Categories */}
          {post.post_categories && post.post_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.post_categories.map((pc: { categories: { slug: string; name: string } }) => (
                <a
                  key={pc.categories.slug}
                  href={`/categories/${pc.categories.slug}`}
                  className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors"
                >
                  {pc.categories.name}
                </a>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 leading-tight">{post.title}</h1>
          
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              {post.profiles?.avatar_url ? (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.name}
                  className="w-10 h-10 rounded-full border-2 border-gray-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold text-sm">
                  {post.profiles?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{formatAuthorName(post.profiles)}</div>
                <div className="text-xs text-gray-500">{formatDate(post.published_at!)}</div>
              </div>
            </div>
            <span className="text-gray-300">•</span>
            <span>{post.view_count + 1} 阅读</span>
          </div>
        </header>

        {/* Content */}
        <div className="py-12 sm:py-16">
          <div className="article-content">
            {renderPostContent(post.content)}
          </div>
          
          {/* 文章内广告 - 内容后 */}
          <InArticleAd className="my-12" />
        </div>

        {/* Tags */}
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="py-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {post.post_tags.map((pt: { tags: { slug: string; name: string } }) => (
                <a
                  key={pt.tags.slug}
                  href={`/tags/${pt.tags.slug}`}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  #{pt.tags.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {post.profiles?.bio && (
          <div className="py-8 border-t border-gray-100">
            <div className="flex gap-4 items-start bg-gray-50 rounded-xl p-6">
              {post.profiles.avatar_url ? (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.name}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm border-2 border-white">
                  {post.profiles.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">关于作者</div>
                <p className="font-semibold text-gray-900 mb-2">{formatAuthorName(post.profiles)}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{post.profiles.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="py-12 border-t border-gray-100">
          <Comments postId={post.id} />
        </div>

        {/* Back to Blog */}
        <div className="py-12 border-t border-gray-100 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            ← 返回文章列表
          </Link>
        </div>
      </article>

      {/* 侧边栏 - 占 4 列 */}
      <aside className="lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          {/* 侧边栏广告 */}
          <SidebarAd />
          
          {/* 其他侧边栏内容可以在这里添加 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="font-bold text-gray-900 mb-3">💡 提示</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              喜欢这篇文章？欢迎在下方留言分享你的想法！
            </p>
          </div>
        </div>
      </aside>
        </div>
      </div>
    </div>
  )
}

interface TextNode {
  text?: string
  marks?: Array<{ type: string }>
}

interface ContentNode {
  type: string
  content?: Array<ContentNode | TextNode>
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
        className="article-content"
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
        if ('marks' in c && c.marks) {
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
      const items = node.content?.map((item) => {
        const itemNode = item as ContentNode
        const text = itemNode.content?.map((p) => {
          const pNode = p as ContentNode
          return pNode.content?.map((c) => {
            const textNode = c as TextNode
            return textNode.text || ''
          }).join('') || ''
        }).join('') || ''
        return `<li>${text}</li>`
      }).join('') || ''
      return `<ul>${items}</ul>`
    }
    if (node.type === 'orderedList') {
      const items = node.content?.map((item) => {
        const itemNode = item as ContentNode
        const text = itemNode.content?.map((p) => {
          const pNode = p as ContentNode
          return pNode.content?.map((c) => {
            const textNode = c as TextNode
            return textNode.text || ''
          }).join('') || ''
        }).join('') || ''
        return `<li>${text}</li>`
      }).join('') || ''
      return `<ol>${items}</ol>`
    }
    if (node.type === 'codeBlock') {
      const text = node.content?.map((c) => c.text || '').join('') || ''
      return `<pre><code>${text}</code></pre>`
    }
    if (node.type === 'blockquote') {
      const text = node.content?.map((p) => {
        const pNode = p as ContentNode
        return pNode.content?.map((c) => {
          const textNode = c as TextNode
          return textNode.text || ''
        }).join('') || ''
      }).join('') || ''
      return `<blockquote>${text}</blockquote>`
    }
    if (node.type === 'image') {
      return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`
    }
    return ''
  }).join('')
}
