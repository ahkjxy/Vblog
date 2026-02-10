# Google AdSense 集成指南

本文档介绍如何在博客系统中集成 Google AdSense 广告。

## 📋 前置准备

1. **注册 Google AdSense 账号**
   - 访问 [Google AdSense](https://www.google.com/adsense/)
   - 使用 Google 账号登录并完成注册
   - 等待账号审核通过（通常需要几天时间）

2. **获取 AdSense 客户端 ID**
   - 登录 AdSense 后台
   - 在"账号"→"账号信息"中找到发布商 ID
   - 格式为：`ca-pub-xxxxxxxxxxxxxxxx`

## 🔧 配置步骤

### 1. 配置环境变量

在 `blog-system/.env.local` 文件中添加以下配置：

```bash
# Google AdSense 客户端 ID（必填）
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx

# 广告位 ID（可选，根据需要配置）
NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=1234567890  # 文章内广告
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=1234567891  # 侧边栏广告
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=1234567892   # 横幅广告
NEXT_PUBLIC_ADSENSE_FEED_SLOT=1234567893     # 信息流广告
```

### 2. 创建广告单元

在 AdSense 后台创建广告单元：

1. 进入"广告"→"按网站"
2. 点击"新建广告单元"
3. 选择广告类型：
   - **展示广告**：适合侧边栏、横幅
   - **文章内嵌广告**：适合文章内容中
   - **信息流广告**：适合文章列表
4. 复制广告单元的 `data-ad-slot` 值
5. 将该值配置到对应的环境变量中

## 📍 广告位置建议

### 1. 文章详情页 (`blog/[slug]/page.tsx`)

```tsx
import { InArticleAd, SidebarAd } from '@/components/ads'

export default function BlogPost() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 主内容区 */}
      <div className="lg:col-span-2">
        <article>
          {/* 文章标题和元信息 */}
          
          {/* 文章内容前半部分 */}
          <div>...</div>
          
          {/* 文章内广告 - 插入在内容中间 */}
          <InArticleAd />
          
          {/* 文章内容后半部分 */}
          <div>...</div>
        </article>
      </div>
      
      {/* 侧边栏 */}
      <aside className="lg:col-span-1">
        {/* 侧边栏广告 - 固定在侧边 */}
        <SidebarAd />
      </aside>
    </div>
  )
}
```

### 2. 文章列表页 (`blog/page.tsx`)

```tsx
import { FeedAd, BannerAd } from '@/components/ads'

export default function BlogList() {
  return (
    <div>
      {/* 页面顶部横幅广告 */}
      <BannerAd className="mb-8" />
      
      {/* 文章列表 */}
      {posts.map((post, index) => (
        <div key={post.id}>
          <ArticleCard post={post} />
          
          {/* 每隔 3 篇文章插入一个信息流广告 */}
          {(index + 1) % 3 === 0 && <FeedAd />}
        </div>
      ))}
    </div>
  )
}
```

### 3. 首页 (`(frontend)/page.tsx`)

```tsx
import { BannerAd } from '@/components/ads'

export default function HomePage() {
  return (
    <div>
      {/* Hero 区域 */}
      <section>...</section>
      
      {/* 横幅广告 */}
      <BannerAd className="my-12" />
      
      {/* 其他内容 */}
      <section>...</section>
    </div>
  )
}
```

## 🎨 可用的广告组件

### 1. `<InArticleAd />` - 文章内广告
适合插入在文章内容中间，自适应宽度。

```tsx
<InArticleAd className="my-8" />
```

### 2. `<SidebarAd />` - 侧边栏广告
适合放在侧边栏，会自动固定在顶部。

```tsx
<SidebarAd className="mb-6" />
```

### 3. `<BannerAd />` - 横幅广告
适合页面顶部或底部，全宽显示。

```tsx
<BannerAd className="my-8" />
```

### 4. `<FeedAd />` - 信息流广告
适合插入在文章列表中，与内容融合。

```tsx
<FeedAd className="my-6" />
```

### 5. `<GoogleAdsense />` - 自定义广告
如需更多控制，可直接使用基础组件。

```tsx
<GoogleAdsense
  adSlot="1234567890"
  adFormat="auto"
  fullWidthResponsive={true}
  className="my-4"
/>
```

## ⚙️ 高级配置

### 自定义广告样式

在 `globals.css` 中添加：

```css
/* 广告容器样式 */
.adsense-container {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .adsense-container {
    background: #1f2937;
  }
}
```

### 条件显示广告

只在生产环境显示广告：

```tsx
'use client'

import { InArticleAd } from '@/components/ads'

export function ConditionalAd() {
  // 只在生产环境显示
  if (process.env.NODE_ENV !== 'production') {
    return null
  }
  
  return <InArticleAd />
}
```

## 📊 最佳实践

### 1. 广告位置建议
- ✅ 文章内容中间（阅读到一半时）
- ✅ 侧边栏顶部（固定位置）
- ✅ 文章列表每 3-5 篇插入一次
- ✅ 页面底部（内容结束后）
- ❌ 避免在首屏放置过多广告
- ❌ 避免影响用户阅读体验

### 2. 广告数量控制
- 每个页面建议 3-5 个广告位
- 文章页：1-2 个文章内 + 1 个侧边栏
- 列表页：1 个横幅 + 若干信息流
- 首页：1-2 个横幅广告

### 3. 性能优化
- 使用 `strategy="afterInteractive"` 延迟加载
- 广告组件已自动优化，无需额外配置
- 使用 `loading="lazy"` 属性（已内置）

### 4. 用户体验
- 添加"广告"或"推广"标签
- 使用浅色背景区分广告区域
- 确保广告不遮挡主要内容
- 移动端适配自动响应

## 🔍 测试和调试

### 本地测试
1. 配置环境变量后重启开发服务器
2. 访问页面，打开浏览器控制台
3. 检查是否有 AdSense 相关错误
4. 广告可能需要几分钟才能显示

### 常见问题

**Q: 广告不显示？**
- 检查 AdSense 账号是否审核通过
- 确认环境变量配置正确
- 检查广告位 ID 是否正确
- 等待几分钟，广告需要时间加载

**Q: 显示空白区域？**
- AdSense 可能没有匹配的广告
- 检查网站内容是否符合 AdSense 政策
- 尝试使用自动广告

**Q: 如何查看收益？**
- 登录 AdSense 后台
- 进入"报告"查看详细数据
- 通常需要 24-48 小时才能看到数据

## 📝 注意事项

1. **AdSense 政策**
   - 不要点击自己的广告
   - 不要诱导用户点击广告
   - 确保内容符合 AdSense 政策

2. **隐私政策**
   - 需要在网站添加隐私政策
   - 说明使用了 Google AdSense
   - 告知用户 Cookie 使用情况

3. **GDPR 合规**
   - 如有欧洲用户，需要 Cookie 同意横幅
   - 可使用 Google 的同意管理平台

## 🚀 部署到生产环境

1. 在 Vercel 项目设置中添加环境变量
2. 重新部署项目
3. 等待 AdSense 审核网站（如果是新网站）
4. 监控广告展示和收益

## 📚 相关资源

- [Google AdSense 帮助中心](https://support.google.com/adsense)
- [AdSense 政策中心](https://support.google.com/adsense/answer/48182)
- [Next.js Script 优化](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
