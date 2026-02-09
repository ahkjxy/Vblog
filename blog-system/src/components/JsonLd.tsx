export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '元气银行博客',
    description: '元气银行官方博客，分享家庭教育、积分管理、习惯养成等内容',
    url: 'https://blog.familybank.chat',
    publisher: {
      '@type': 'Organization',
      name: '元气银行',
      logo: {
        '@type': 'ImageObject',
        url: 'https://blog.familybank.chat/app-icon.svg',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://blog.familybank.chat/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function ArticleJsonLd({
  title,
  description,
  publishedTime,
  modifiedTime,
  authorName,
  url,
  imageUrl,
}: {
  title: string
  description: string
  publishedTime?: string
  modifiedTime?: string
  authorName: string
  url: string
  imageUrl?: string
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: '元气银行',
      logo: {
        '@type': 'ImageObject',
        url: 'https://blog.familybank.chat/app-icon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '元气银行',
    url: 'https://www.familybank.chat',
    logo: 'https://blog.familybank.chat/app-icon.svg',
    description: '家庭积分管理系统，通过游戏化的方式激励家庭成员养成良好习惯',
    sameAs: [
      'https://blog.familybank.chat',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: '客户服务',
      availableLanguage: ['zh-CN'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
