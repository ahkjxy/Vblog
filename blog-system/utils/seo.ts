/**
 * SEO 工具函数
 */

export interface SeoConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

/**
 * 生成完整的 SEO meta 标签
 */
export function generateSeoMeta(config: SeoConfig) {
  const siteUrl = 'https://blog.familybank.chat'
  const siteName = '元气银行社区'
  const defaultDescription = '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动社区平台。'
  const defaultImage = `${siteUrl}/favicon.png`
  const twitterHandle = '@familybank'

  const {
    title,
    description = defaultDescription,
    keywords = [],
    image = defaultImage,
    url = siteUrl,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = []
  } = config

  const fullTitle = title ? `${title} - ${siteName}` : siteName
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`

  return {
    // 基础 meta
    title: fullTitle,
    description,
    keywords: keywords.join(', '),

    // Open Graph
    ogTitle: fullTitle,
    ogDescription: description,
    ogImage: fullImage,
    ogUrl: fullUrl,
    ogType: type,
    ogSiteName: siteName,
    ogLocale: 'zh_CN',

    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterSite: twitterHandle,
    twitterCreator: twitterHandle,
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: fullImage,

    // Article specific (if type is article)
    ...(type === 'article' && {
      articlePublishedTime: publishedTime,
      articleModifiedTime: modifiedTime,
      articleAuthor: author,
      articleSection: section,
      articleTag: tags,
    }),

    // 其他
    robots: 'index, follow',
    googlebot: 'index, follow',
    bingbot: 'index, follow',
    canonical: fullUrl,
  }
}

/**
 * 生成结构化数据 (JSON-LD)
 */
export function generateJsonLd(type: 'website' | 'article' | 'breadcrumb' | 'organization', data: any) {
  const siteUrl = 'https://blog.familybank.chat'
  const siteName = '元气银行社区'

  const schemas: Record<string, any> = {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动社区平台。',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/blog?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },

    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      image: data.image,
      datePublished: data.publishedTime,
      dateModified: data.modifiedTime || data.publishedTime,
      author: {
        '@type': 'Person',
        name: data.author,
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/favicon.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': data.url,
      },
    },

    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: (data.items || []).map((item: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },

    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/favicon.png`,
      sameAs: [
        'https://github.com/ahkjxy',
        'https://www.familybank.chat',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'ahkjxy@qq.com',
      },
    },
  }

  return schemas[type]
}

/**
 * 生成面包屑导航
 */
export function generateBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return items.map((item, index) => ({
    name: item.name,
    url: item.url.startsWith('http') ? item.url : `https://blog.familybank.chat${item.url}`,
    position: index + 1,
  }))
}

/**
 * 清理和优化描述文本
 */
export function cleanDescription(text: string, maxLength: number = 160): string {
  // 移除 HTML 标签
  let cleaned = text.replace(/<[^>]*>/g, '')
  
  // 移除多余空格
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // 截断到指定长度
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength - 3) + '...'
  }
  
  return cleaned
}

/**
 * 生成关键词
 */
export function generateKeywords(tags: string[], categories: string[], baseKeywords: string[] = []): string[] {
  const defaultKeywords = [
    '元气银行',
    '家庭教育',
    '积分管理',
    '习惯养成',
    '家长社区',
    '育儿经验',
  ]
  
  return [...new Set([...defaultKeywords, ...baseKeywords, ...categories, ...tags])]
}
