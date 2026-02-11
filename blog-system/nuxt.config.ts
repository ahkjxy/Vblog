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
      exclude: ['/', '/blog/*', '/categories/*', '/tags/*', '/about', '/contact', '/changelog', '/docs', '/api', '/privacy', '/support', '/terms', '/disclaimer'],
    },
    cookieOptions: {
      name: 'sb-mfgfbwhznqpdjumtsrus-auth-token',
      domain: process.env.NODE_ENV === 'production' ? '.familybank.chat' : undefined,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 31536000,
      httpOnly: false,
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
      title: '元气银行博客 - 家庭教育与积分管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '元气银行官方博客，分享家庭教育、积分管理、习惯养成等内容。' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})
