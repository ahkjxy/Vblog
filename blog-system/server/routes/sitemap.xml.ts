import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://blog.familybank.chat'
  
  try {
    // 获取服务端 Supabase 客户端
    const client = await serverSupabaseClient(event)
    
    // 获取所有已发布的文章（包含标题和封面图）
    const { data: posts, error: postsError } = await client
      .from('posts')
      .select('slug, title, excerpt, updated_at, published_at')
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .order('published_at', { ascending: false })
    
    if (postsError) {
      console.error('[Sitemap] Posts query error:', postsError)
    } else {
      console.log('[Sitemap] Found posts:', posts?.length || 0)
    }
    
    // 获取所有分类
    const { data: categories, error: categoriesError } = await client
      .from('categories')
      .select('slug, name, description, created_at')
      .order('name')
    
    if (categoriesError) {
      console.error('[Sitemap] Categories query error:', categoriesError)
    } else {
      console.log('[Sitemap] Found categories:', categories?.length || 0)
    }
    
    // 获取所有标签
    const { data: tags, error: tagsError } = await client
      .from('tags')
      .select('slug, name, created_at')
      .order('name')
    
    if (tagsError) {
      console.error('[Sitemap] Tags query error:', tagsError)
    } else {
      console.log('[Sitemap] Found tags:', tags?.length || 0)
    }
  
  // 静态页面
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0, title: '元气银行社区 - 家庭教育与积分管理交流平台' },
    { url: '/blog', changefreq: 'daily', priority: 0.9, title: '社区讨论 - 家长经验分享' },
    { url: '/categories', changefreq: 'weekly', priority: 0.8, title: '文章分类' },
    { url: '/tags', changefreq: 'weekly', priority: 0.8, title: '标签云' },
    { url: '/about', changefreq: 'monthly', priority: 0.5, title: '关于我们' },
    { url: '/contact', changefreq: 'monthly', priority: 0.5, title: '联系我们' },
    { url: '/changelog', changefreq: 'weekly', priority: 0.6, title: '更新日志' },
    { url: '/docs', changefreq: 'monthly', priority: 0.7, title: '产品文档' },
    { url: '/api', changefreq: 'monthly', priority: 0.6, title: 'API 文档' },
    { url: '/privacy', changefreq: 'yearly', priority: 0.3, title: '隐私政策' },
    { url: '/terms', changefreq: 'yearly', priority: 0.3, title: '服务条款' },
    { url: '/disclaimer', changefreq: 'yearly', priority: 0.3, title: '免责声明' },
    { url: '/support', changefreq: 'monthly', priority: 0.5, title: '帮助与支持' },
    { url: '/investment', changefreq: 'monthly', priority: 0.5, title: '投资融资' },
  ]
  
  // 辅助函数：转义 XML 特殊字符
  const escapeXml = (str: string) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
  
  // 生成 XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  ${staticPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  
  ${posts?.map(post => `
  <!-- ${escapeXml(post.title)} -->
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.published_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('') || ''}
  
  ${categories?.map(category => `
  <!-- 分类: ${escapeXml(category.name)} -->
  <url>
    <loc>${siteUrl}/categories/${category.slug}</loc>
    <lastmod>${new Date(category.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
  
  ${tags?.map(tag => `
  <!-- 标签: ${escapeXml(tag.name)} -->
  <url>
    <loc>${siteUrl}/tags/${tag.slug}</loc>
    <lastmod>${new Date(tag.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('') || ''}
  
</urlset>`
  
    // 设置响应头
    event.node.res.setHeader('Content-Type', 'application/xml')
    event.node.res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    
    return sitemap
  } catch (error) {
    console.error('Sitemap generation error:', error)
    
    // 返回基础 sitemap（只包含静态页面）
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`
    
    event.node.res.setHeader('Content-Type', 'application/xml')
    return basicSitemap
  }
})
