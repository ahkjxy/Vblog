import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/auth/', '/api/', '/debug-user/'],
      },
    ],
    sitemap: 'https://blog.familybank.chat/sitemap.xml',
  }
}
