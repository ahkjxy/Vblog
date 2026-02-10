# Google AdSense 广告位置说明

## 已配置的广告位

### 1. 首页 (`src/app/(frontend)/page.tsx`)
- **位置 1**: 英雄区域下方 - 横幅广告 (BannerAd)
- **位置 2**: 最新文章列表下方 - 横幅广告 (BannerAd)

### 2. 文章列表页 (`src/app/(frontend)/blog/page.tsx`)
- **位置 1**: 页面顶部 - 横幅广告 (BannerAd)
- **位置 2**: 文章列表中 - 信息流广告 (FeedAd)，每 4 篇文章插入一个

### 3. 文章详情页 (`src/app/(frontend)/blog/[slug]/page.tsx`)
- **位置 1**: 文章内容后 - 文章内广告 (InArticleAd)
- **位置 2**: 右侧边栏 - 侧边栏广告 (SidebarAd)，sticky 定位

## 广告类型说明

| 广告类型 | 环境变量 | 用途 | 特点 |
|---------|---------|------|------|
| BannerAd | NEXT_PUBLIC_ADSENSE_BANNER_SLOT | 横幅广告 | 适合页面顶部/底部，全宽响应式 |
| FeedAd | NEXT_PUBLIC_ADSENSE_FEED_SLOT | 信息流广告 | 适合文章列表，融入内容流 |
| InArticleAd | NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT | 文章内广告 | 适合文章内容中，流式布局 |
| SidebarAd | NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT | 侧边栏广告 | 适合侧边栏，自适应高度 |

## 广告显示逻辑

1. **开发环境**: 显示占位符，提示需要配置环境变量
2. **生产环境**: 
   - 如果未配置环境变量，不显示任何内容
   - 如果已配置，显示真实广告

## 环境变量配置

所有广告相关的环境变量都在 `.env.local` 文件中：

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-8769672462868982
NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=3948281301
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=3192866749
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=4306647603
NEXT_PUBLIC_ADSENSE_FEED_SLOT=1680484268
```

## 用户体验优化

- 所有广告都有"广告"或"推广"标签，保持透明度
- 广告位置经过精心设计，不影响阅读体验
- 响应式设计，在移动端和桌面端都有良好表现
- 符合公益网站定位，广告收入用于维持运营

## 测试建议

1. 重启开发服务器：`npm run dev`
2. 访问各个页面检查广告位置
3. 在 Google AdSense 后台查看广告展示情况
4. 注意：新广告单元可能需要几小时才能开始展示

## 注意事项

- AdSense 需要网站通过审核才能显示真实广告
- 测试期间可能看到空白或占位符
- 不要频繁点击自己的广告，可能导致账号被封
- 确保网站内容符合 AdSense 政策
