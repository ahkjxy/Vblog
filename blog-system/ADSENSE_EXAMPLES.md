# Google AdSense 使用示例

以下是在不同页面中集成 AdSense 广告的实际代码示例。

## 📄 文章详情页示例

在 `src/app/(frontend)/blog/[slug]/page.tsx` 中添加广告：

```tsx
import { InArticleAd, SidebarAd } from '@/components/ads'

export default async function BlogPostPage({ params }: PageProps) {
  // ... 现有代码 ...

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 主内容区 - 占 8 列 */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="py-12 sm:py-16 border-b border-gray-100">
              {/* ... 标题、分类、作者等信息 ... */}
            </header>

            {/* Content */}
            <div className="py-12 sm:py-16">
              <div className="article-content">
                {/* 文章内容前半部分 */}
                {renderPostContent(post.content)}
                
                {/* 文章内广告 - 插入在内容中间 */}
                <InArticleAd className="my-12" />
                
                {/* 如果文章很长，可以在后半部分再插入一个 */}
                {/* <InArticleAd className="my-12" /> */}
              </div>
            </div>

            {/* Tags, Author Bio, Comments ... */}
          </article>

          {/* 侧边栏 - 占 4 列 */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* 侧边栏广告 */}
              <SidebarAd />
              
              {/* 其他侧边栏内容 */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold mb-4">相关文章</h3>
                {/* ... */}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
```

## 📝 文章列表页示例

在 `src/app/(frontend)/blog/page.tsx` 中添加广告：

```tsx
import { FeedAd, BannerAd } from '@/components/ads'

export default async function BlogListPage() {
  // ... 获取文章列表 ...

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 py-12">
        {/* 页面顶部横幅广告 */}
        <BannerAd className="mb-12" />
        
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-12">最新文章</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div key={post.id}>
                {/* 文章卡片 */}
                <ArticleCard post={post} />
                
                {/* 每隔 6 篇文章插入一个信息流广告 */}
                {(index + 1) % 6 === 0 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <FeedAd className="my-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 页面底部横幅广告 */}
        <BannerAd className="mt-12" />
      </div>
    </div>
  )
}
```

## 🏠 首页示例

在 `src/app/(frontend)/page.tsx` 中添加广告：

```tsx
import { BannerAd } from '@/components/ads'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        {/* ... Hero 内容 ... */}
      </section>

      {/* 横幅广告 - 在 Hero 和内容之间 */}
      <BannerAd className="my-12" />

      {/* Features Section */}
      <section className="py-16">
        {/* ... 特性介绍 ... */}
      </section>

      {/* 横幅广告 - 在内容区域之间 */}
      <BannerAd className="my-12" />

      {/* Latest Posts */}
      <section className="py-16">
        {/* ... 最新文章 ... */}
      </section>
    </div>
  )
}
```

## 📱 响应式布局示例

确保广告在移动端也能正常显示：

```tsx
export default function ResponsiveAdLayout() {
  return (
    <div className="container mx-auto px-4">
      {/* 桌面端：侧边栏布局 */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8">
          {/* 主内容 */}
        </main>
        <aside className="lg:col-span-4">
          <SidebarAd />
        </aside>
      </div>

      {/* 移动端：堆叠布局 */}
      <div className="lg:hidden">
        <main>
          {/* 主内容 */}
          
          {/* 移动端在内容中间插入广告 */}
          <InArticleAd className="my-8" />
        </main>
      </div>
    </div>
  )
}
```

## 🎨 自定义广告样式

在 `src/app/globals.css` 中添加自定义样式：

```css
/* 广告容器基础样式 */
.adsense-container {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.adsense-container:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .adsense-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: #374151;
  }
  
  .adsense-container:hover {
    border-color: #4b5563;
  }
}

/* 广告标签样式 */
.ad-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .adsense-container {
    padding: 1rem;
    border-radius: 12px;
  }
}
```

## 🔧 条件渲染示例

只在特定条件下显示广告：

```tsx
'use client'

import { InArticleAd } from '@/components/ads'
import { useEffect, useState } from 'react'

export function ConditionalAd() {
  const [shouldShowAd, setShouldShowAd] = useState(false)

  useEffect(() => {
    // 只在生产环境显示
    const isProduction = process.env.NODE_ENV === 'production'
    
    // 检查用户是否是会员（示例）
    const isPremiumUser = false // 从你的用户系统获取
    
    // 只在生产环境且非会员用户时显示广告
    setShouldShowAd(isProduction && !isPremiumUser)
  }, [])

  if (!shouldShowAd) {
    return null
  }

  return <InArticleAd />
}
```

## 📊 A/B 测试示例

测试不同广告位置的效果：

```tsx
'use client'

import { InArticleAd } from '@/components/ads'
import { useEffect, useState } from 'react'

export function ABTestAd() {
  const [variant, setVariant] = useState<'A' | 'B'>('A')

  useEffect(() => {
    // 随机分配 A/B 测试组
    setVariant(Math.random() > 0.5 ? 'A' : 'B')
  }, [])

  if (variant === 'A') {
    // 变体 A：在文章中间显示
    return (
      <div className="my-12">
        <InArticleAd />
      </div>
    )
  } else {
    // 变体 B：在文章末尾显示
    return (
      <div className="mt-12 mb-6">
        <InArticleAd />
      </div>
    )
  }
}
```

## 🚀 性能优化示例

延迟加载广告以提升性能：

```tsx
'use client'

import { InArticleAd } from '@/components/ads'
import { useEffect, useState, useRef } from 'react'

export function LazyAd() {
  const [isVisible, setIsVisible] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // 提前 200px 开始加载
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={adRef} className="min-h-[250px]">
      {isVisible && <InArticleAd />}
    </div>
  )
}
```

## 📈 追踪广告展示

添加自定义事件追踪：

```tsx
'use client'

import { InArticleAd } from '@/components/ads'
import { useEffect, useRef } from 'react'

export function TrackedAd() {
  const adRef = useRef<HTMLDivElement>(null)
  const hasTracked = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked.current) {
          // 发送展示事件到你的分析系统
          console.log('Ad viewed')
          // 例如：analytics.track('ad_viewed', { position: 'article' })
          hasTracked.current = true
        }
      },
      { threshold: 0.5 } // 50% 可见时触发
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={adRef}>
      <InArticleAd />
    </div>
  )
}
```

## 💡 最佳实践总结

1. **广告位置**
   - 文章详情页：1-2 个文章内 + 1 个侧边栏
   - 列表页：顶部横幅 + 每 6 篇插入信息流
   - 首页：1-2 个横幅，不要过多

2. **用户体验**
   - 添加"广告"标签
   - 使用浅色背景区分
   - 确保不遮挡主要内容
   - 移动端自适应

3. **性能优化**
   - 使用 Intersection Observer 延迟加载
   - 避免首屏加载过多广告
   - 使用 Next.js Script 组件优化加载

4. **合规性**
   - 添加隐私政策
   - 说明使用 Cookie
   - GDPR 合规（如有欧洲用户）
