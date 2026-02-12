// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 4000
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss'
  ],

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/auth/unified',
      callback: '/auth/callback',
      exclude: ['/', '/blog', '/blog/*', '/categories', '/categories/*', '/tags', '/tags/*', '/about', '/contact', '/changelog', '/docs', '/api', '/privacy', '/support', '/terms', '/disclaimer'],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.familybank.chat',
      familyBankUrl: process.env.NEXT_PUBLIC_FAMILY_BANK_URL || 'https://www.familybank.chat',
      adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
      adsenseBannerSlot: process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT,
      adsenseSidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT,
      adsenseArticleSlot: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT,
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },
      title: '元气银行社区',
      titleTemplate: '%s - 元气银行社区',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'description', content: '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动社区平台。' },
        { name: 'keywords', content: '元气银行,家庭教育,积分管理,习惯养成,家长社区,育儿经验,家庭积分系统' },
        { name: 'author', content: '元气银行团队' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'bingbot', content: 'index, follow' },
        
        // Open Graph
        { property: 'og:site_name', content: '元气银行社区' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'zh_CN' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@familybank' },
        
        // 移动端优化
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#FF4D94' },
        
        // 安全
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    }
  },

  // 性能优化配置
  nitro: {
    compressPublicAssets: true, // 压缩静态资源
    minify: true, // 压缩输出
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/blog',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/disclaimer',
        '/docs',
        '/changelog',
        '/api',
        '/support'
      ]
    }
  },

  // 构建优化
  build: {
    transpile: ['lucide-vue-next']
  },

  // 实验性功能
  experimental: {
    payloadExtraction: false, // 禁用 payload 提取以提升性能
    renderJsonPayloads: true, // 使用 JSON payload
    viewTransition: true // 启用视图过渡
  },

  // 路由优化
  routeRules: {
    // 静态页面 - 预渲染
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/disclaimer': { prerender: true },
    '/docs': { prerender: true },
    '/api': { prerender: true },
    '/support': { prerender: true },
    '/changelog': { prerender: true },
    
    // 动态页面 - SWR 缓存
    '/blog': { swr: 60 }, // 60秒缓存
    '/blog/**': { swr: 300 }, // 5分钟缓存
    '/categories': { swr: 60 },
    '/categories/**': { swr: 300 },
    '/tags': { swr: 60 },
    '/tags/**': { swr: 300 },
    
    // API 路由 - 缓存
    '/api/**': { cors: true, headers: { 'cache-control': 'public, max-age=60' } },
    
    // Dashboard - 不缓存，但保持 SSR
    '/dashboard/**': { ssr: true, cache: false }
  }
})
