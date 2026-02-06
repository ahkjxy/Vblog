import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarkdownContent } from '@/components/MarkdownContent'
import { Comments } from '@/components/Comments'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  console.log('=== Metadata Generation Debug ===')
  console.log('Slug:', slug)
  
  let post = null;
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('title, seo_title, seo_description, excerpt, status, review_status')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .maybeSingle()
    
    console.log('Metadata query result:', { found: !!data, error, data })
    
    if (error && error.code === '42703') {
      const { data: fallbackData } = await supabase
        .from('posts')
        .select('title, seo_title, seo_description, excerpt, status, review_status')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      console.log('Metadata fallback result:', { found: !!fallbackData, data: fallbackData })
      post = fallbackData
    } else if (!error) {
      post = data
    }
  } catch (err) {
    console.error('Metadata query error:', err)
    const { data: fallbackData } = await supabase
      .from('posts')
      .select('title, seo_title, seo_description, excerpt, status, review_status')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    console.log('Metadata exception fallback:', { found: !!fallbackData, data: fallbackData })
    post = fallbackData
  }

  console.log('=== End Metadata Debug ===')

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
  
  console.log('=== Blog Post Debug ===')
  console.log('Requested slug:', slug)
  
  // 步骤 1: 先查询文章是否存在（不加任何过滤条件）
  const { data: checkPost, error: checkError } = await supabase
    .from('posts')
    .select('id, title, slug, status, review_status, author_id, published_at')
    .eq('slug', slug)
    .maybeSingle()
  
  console.log('Step 1 - Post exists check:', {
    found: !!checkPost,
    post: checkPost,
    error: checkError
  })
  
  // 步骤 2: 查询已发布的文章（不检查 review_status）
  const { data: publishedCheck, error: publishedError } = await supabase
    .from('posts')
    .select('id, title, status, review_status')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  
  console.log('Step 2 - Published check:', {
    found: !!publishedCheck,
    post: publishedCheck,
    error: publishedError
  })
  
  // 步骤 3: 查询已发布且审核通过的文章
  const { data: approvedCheck, error: approvedError } = await supabase
    .from('posts')
    .select('id, title, status, review_status')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('review_status', 'approved')
    .maybeSingle()
  
  console.log('Step 3 - Approved check:', {
    found: !!approvedCheck,
    post: approvedCheck,
    error: approvedError
  })
  
  let post = null;
  let queryError = null;
  
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
    
    queryError = error
    console.log('Step 4 - Full query with review_status:', {
      found: !!data,
      error: error,
      errorCode: error?.code,
      errorMessage: error?.message
    })
    
    if (error && error.code === '42703') {
      // review_status 字段不存在
      console.log('Step 5 - Fallback: review_status field does not exist')
      const { data: fallbackData, error: fallbackError } = await supabase
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
      
      console.log('Step 5 - Fallback result:', {
        found: !!fallbackData,
        error: fallbackError
      })
      post = fallbackData
    } else if (!error) {
      post = data
    }
  } catch (err) {
    console.error('Step 6 - Exception caught:', err)
    // 出错时回退到不检查 review_status
    const { data: fallbackData, error: fallbackError } = await supabase
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
    
    console.log('Step 6 - Exception fallback result:', {
      found: !!fallbackData,
      error: fallbackError
    })
    post = fallbackData
  }

  console.log('Final result:', {
    postFound: !!post,
    postId: post?.id,
    postTitle: post?.title
  })
  console.log('=== End Debug ===')

  if (!post) {
    console.error('❌ Post not found - returning 404')
    console.error('Debug summary:', {
      slug,
      existsInDB: !!checkPost,
      isPublished: !!publishedCheck,
      isApproved: !!approvedCheck,
      checkPostData: checkPost,
      queryError: queryError
    })
    notFound()
  }

  // Increment view count
  await supabase
    .from('posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', post.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <article className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 px-6 sm:px-8 py-16 sm:py-24 mb-0">
          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            {post.post_categories && post.post_categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.post_categories.map((pc: { categories: { slug: string; name: string } }) => (
                  <a
                    key={pc.categories.slug}
                    href={`/categories/${pc.categories.slug}`}
                    className="px-4 py-1.5 bg-white rounded-full text-sm font-medium text-purple-600 hover:bg-purple-100 transition-all shadow-sm hover:shadow"
                  >
                    {pc.categories.name}
                  </a>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.15] text-gray-900 tracking-tight">{post.title}</h1>
            
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 leading-[1.6] font-light">{post.excerpt}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-3">
                {post.profiles?.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold shadow-md">
                    {post.profiles?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{post.profiles?.name}</div>
                  {post.profiles?.bio && (
                    <div className="text-xs text-gray-600 line-clamp-1">{post.profiles.bio}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <time>{formatDate(post.published_at!)}</time>
                <span>•</span>
                <span>{post.view_count + 1} 阅读</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white px-6 sm:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="article-content">
              {renderPostContent(post.content)}
            </div>
          </div>
        </div>

        {/* Tags */}
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="bg-gray-50 px-6 sm:px-8 py-10 sm:py-12 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">相关标签</h3>
              <div className="flex flex-wrap gap-3">
                {post.post_tags.map((pt: { tags: { slug: string; name: string } }) => (
                  <a
                    key={pt.tags.slug}
                    href={`/tags/${pt.tags.slug}`}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 hover:text-purple-700 hover:shadow-md transition-all"
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
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 px-6 sm:px-8 py-12 sm:py-16 border-t border-purple-100">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {post.profiles.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg border-4 border-white">
                    {post.profiles.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">关于作者</h3>
                  <p className="text-xl font-semibold text-gray-900 mb-3">{post.profiles.name}</p>
                  <p className="text-gray-700 leading-[1.7] text-base">{post.profiles.bio}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="px-6 sm:px-8 py-12 sm:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Comments postId={post.id} />
          </div>
        </div>

        {/* Back to Blog */}
        <div className="px-6 sm:px-8 py-12 sm:py-16 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all font-medium text-base sm:text-lg shadow-lg"
            >
              ← 返回文章列表
            </Link>
          </div>
        </div>
      </article>
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
