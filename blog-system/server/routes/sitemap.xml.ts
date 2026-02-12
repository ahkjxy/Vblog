export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://blog.familybank.chat'
  
  // 获取 Supabase 客户端
  const client = useSupabaseClient()
  
  // 获取所有已发布的文章
  const { data: posts } = await client
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  
  // 获取所有分类
  const { data: categories } = await client
    .from('categories')
    .select('slug, updated_at')
    .order('name')
  
  // 获取所有标签
  const { data: tags } = await client
    .from('tags')
    .select('slug, updated_at')
    .order('name')
  
  // 静态页面
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/blog', changefreq: 'daily', priority: 0.9 },
    { url: '/categories', changefreq: 'weekly', priority: 0.8 },
    { url: '/tags', changefreq: 'weekly', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.5 },
    { url: '/contact', changefreq: 'monthly', priority: 0.5 },
    { url: '/changelog', changefreq: 'weekly', priority: 0.6 },
    { url: '/docs', changefreq: 'monthly', priority: 0.7 },
    { url: '/api', changefreq: 'monthly', priority: 0.6 },
    { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
    { url: '/terms', changefreq: 'yearly', priority: 0.3 },
    { url: '/disclaimer', changefreq: 'yearly', priority: 0.3 },
  ]
  
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
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.published_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('') || ''}
  
  ${categories?.map(category => `
  <url>
    <loc>${siteUrl}/categories/${category.slug}</loc>
    <lastmod>${new Date(category.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
  
  ${tags?.map(tag => `
  <url>
    <loc>${siteUrl}/tags/${tag.slug}</loc>
    <lastmod>${new Date(tag.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('') || ''}
  
</urlset>`
  
  // 设置响应头
  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  
  return sitemap
})
