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
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: '元气银行社区',
      short_name: '元气银行',
      description: '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动社区平台',
      theme_color: '#FF4D94',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,jpg,jpeg,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/mfgfbwhznqpdjumtsrus\.supabase\.co\/rest\/v1\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5 minutes
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-static-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: false,
      type: 'module'
    }
  },

  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    redirect: false,
    cookieName: 'sb-mfgfbwhznqpdjumtsrus-auth-token',
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: true,
      path: '/',
      // 生产环境使用 .familybank.chat 跨子域名共享，开发环境不设置 domain
      domain: process.env.NODE_ENV === 'production' ? '.familybank.chat' : undefined,
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      }
    }
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
      crawlLinks: false, // 禁用自动爬取链接
      routes: [
        '/',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/disclaimer',
        '/docs',
        '/changelog',
        '/api',
        '/support',
        '/investment'
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
    '/investment': { prerender: true },
    
    // 动态页面 - 不预渲染，使用 SWR 缓存
    '/blog': { prerender: false, swr: 60 },
    '/blog/**': { prerender: false, swr: 300 },
    '/categories': { prerender: false, swr: 60 },
    '/categories/**': { prerender: false, swr: 300 },
    '/tags': { prerender: false, swr: 60 },
    '/tags/**': { prerender: false, swr: 300 },
    
    // API 路由 - 缓存
    '/api/**': { cors: true, headers: { 'cache-control': 'public, max-age=60' } },
    
    // Dashboard - 完全禁用缓存，强制 SSR
    '/dashboard': { ssr: true, cache: false },
    '/dashboard/**': { ssr: true, cache: false },
    
    // Auth 页面 - 不缓存
    '/auth/**': { ssr: true, cache: false }
  }
})
