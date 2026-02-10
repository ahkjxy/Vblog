# Google AdSense 快速开始指南

## 🚀 为什么广告没有显示？

如果你看不到广告，这是**正常的**，因为：

1. ✅ **还没有配置 AdSense ID** - 需要先申请 Google AdSense 账号
2. ✅ **广告组件已正确集成** - 代码已经准备好，只需配置即可
3. ✅ **测试环境不显示** - 本地开发时广告不会显示

## 📋 快速配置步骤

### 步骤 1: 申请 Google AdSense 账号

1. 访问 [Google AdSense](https://www.google.com/adsense/)
2. 使用 Google 账号登录
3. 填写网站信息：`https://blog.familybank.chat`
4. 等待审核（通常需要 1-7 天）

### 步骤 2: 获取 AdSense 客户端 ID

审核通过后：
1. 登录 AdSense 后台
2. 进入"账号" → "账号信息"
3. 复制"发布商 ID"（格式：`ca-pub-xxxxxxxxxxxxxxxx`）

### 步骤 3: 配置环境变量

在 `blog-system/.env.local` 文件中添加：

```bash
# Google AdSense 配置
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
```

**重要：** 添加后需要重启开发服务器！

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 步骤 4: 创建广告单元（可选）

如果想使用特定的广告位：

1. 在 AdSense 后台进入"广告" → "按网站"
2. 点击"新建广告单元"
3. 选择广告类型并创建
4. 复制 `data-ad-slot` 值
5. 添加到 `.env.local`：

```bash
NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=1234567890
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=1234567891
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=1234567892
NEXT_PUBLIC_ADSENSE_FEED_SLOT=1234567893
```

## 🎯 当前已集成的广告位

广告组件已经在以下位置准备好：

### ✅ 已集成但未激活
- 文章详情页（需要手动添加）
- 文章列表页（需要手动添加）
- 首页（需要手动添加）

### 📝 如何添加广告

#### 示例 1: 在文章详情页添加广告

编辑 `src/app/(frontend)/blog/[slug]/page.tsx`：

```tsx
import { InArticleAd } from '@/components/ads'

// 在文章内容中间添加
<div className="article-content">
  {/* 文章内容 */}
  <InArticleAd className="my-8" />
  {/* 更多内容 */}
</div>
```

#### 示例 2: 在首页添加横幅广告

编辑 `src/app/(frontend)/page.tsx`：

```tsx
import { BannerAd } from '@/components/ads'

// 在合适的位置添加
<BannerAd className="my-12" />
```

## 🔍 测试广告是否正常工作

### 方法 1: 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 如果配置正确，应该看到 AdSense 脚本加载

### 方法 2: 检查网页源代码

1. 右键点击页面 → "查看网页源代码"
2. 搜索 `adsbygoogle`
3. 应该能看到 AdSense 脚本标签

### 方法 3: 使用 AdSense 测试模式

在 `.env.local` 中添加测试 ID：

```bash
# 使用 Google 的测试 ID
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
```

**注意：** 这只是测试，不会显示真实广告。

## ⚠️ 常见问题

### Q: 配置了 ID 但还是看不到广告？

**A:** 可能的原因：
1. 没有重启开发服务器
2. AdSense 账号还在审核中
3. 网站还没有被 AdSense 批准
4. 广告需要几分钟才能加载
5. 使用了广告拦截插件

### Q: 本地开发时能看到广告吗？

**A:** 可以，但需要：
1. 配置了正确的 AdSense ID
2. AdSense 账号已审核通过
3. 关闭广告拦截插件

### Q: 如何知道广告是否正常工作？

**A:** 
1. 部署到生产环境（Vercel）
2. 在 AdSense 后台查看"报告"
3. 等待 24-48 小时查看数据

### Q: 广告显示空白区域？

**A:** 这是正常的，可能因为：
1. AdSense 没有匹配的广告
2. 网站内容不符合广告政策
3. 访问量太低

## 🚀 部署到生产环境

### 在 Vercel 中配置环境变量

1. 登录 [Vercel](https://vercel.com)
2. 选择你的项目
3. 进入 "Settings" → "Environment Variables"
4. 添加环境变量：
   - Key: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
   - Value: `ca-pub-xxxxxxxxxxxxxxxx`
5. 点击 "Save"
6. 重新部署项目

### 验证部署

1. 访问生产环境网站
2. 打开浏览器控制台
3. 检查是否有 AdSense 相关的网络请求

## 📚 相关文档

- [完整配置指南](./ADSENSE_SETUP.md)
- [使用示例](./ADSENSE_EXAMPLES.md)
- [Google AdSense 帮助中心](https://support.google.com/adsense)

## 💡 提示

1. **不要点击自己的广告** - 这违反 AdSense 政策
2. **耐心等待** - 广告可能需要几分钟到几小时才能显示
3. **保持内容质量** - 优质内容能获得更好的广告匹配
4. **遵守政策** - 确保网站内容符合 AdSense 政策

## 🎉 下一步

1. ✅ 申请 AdSense 账号
2. ✅ 配置环境变量
3. ✅ 在页面中添加广告组件
4. ✅ 部署到生产环境
5. ✅ 监控广告表现

---

**需要帮助？** 查看 [ADSENSE_SETUP.md](./ADSENSE_SETUP.md) 获取详细说明。
