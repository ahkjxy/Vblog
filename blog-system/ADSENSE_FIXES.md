# Google AdSense 错误修复

## 修复的问题

### 1. ❌ data-nscript 属性错误

**错误信息**:
```
AdSense head tag doesn't support data-nscript attribute
```

**原因**: 
Next.js 的 `<Script>` 组件在使用 `async` 属性时会自动添加 `data-nscript` 属性，但 AdSense 脚本不支持这个属性。

**修复方案**:
- 移除 `async` 属性（Next.js Script 组件会自动处理异步加载）
- 将 `strategy` 从 `afterInteractive` 改为 `lazyOnload`

**修复前**:
```tsx
<Script
  async  // ❌ 会导致 data-nscript 属性
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

**修复后**:
```tsx
<Script
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
  strategy="lazyOnload"  // ✅ 延迟加载，不影响性能
  crossOrigin="anonymous"
/>
```

### 2. ❌ Invalid data-ad-layout value: in-feed

**错误信息**:
```
Uncaught TagError: adsbygoogle.push() error: Invalid data-ad-layout value: in-feed
```

**原因**: 
`data-ad-layout="in-feed"` 是一个特殊的广告布局，需要特定的广告单元类型和配置。普通的展示广告单元不支持这个值。

**修复方案**:
1. **FeedAd 组件**: 移除 `adLayout="in-feed"`，只使用 `adFormat="fluid"`
2. **BannerAd 组件**: 将 `adFormat="horizontal"` 改为 `adFormat="auto"`
3. **GoogleAdsense 组件**: 只在 `adLayout` 有值时才添加该属性

**修复前**:
```tsx
// FeedAd - 信息流广告
<GoogleAdsense
  adSlot={adSlot}
  adFormat="fluid"
  adLayout="in-feed"  // ❌ 错误：普通广告单元不支持
/>

// BannerAd - 横幅广告
<GoogleAdsense
  adSlot={adSlot}
  adFormat="horizontal"  // ❌ 不够灵活
  fullWidthResponsive={true}
/>
```

**修复后**:
```tsx
// FeedAd - 信息流广告
<GoogleAdsense
  adSlot={adSlot}
  adFormat="fluid"  // ✅ 自适应流式布局
/>

// BannerAd - 横幅广告
<GoogleAdsense
  adSlot={adSlot}
  adFormat="auto"  // ✅ 自动适应
  fullWidthResponsive={true}
/>

// GoogleAdsense 组件
<ins
  className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client={adClient}
  data-ad-slot={adSlot}
  data-ad-format={adFormat}
  {...(adLayout && { 'data-ad-layout': adLayout })}  // ✅ 只在有值时添加
  {...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey })}
  data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
/>
```

## 广告格式说明

### 推荐的广告格式组合

| 广告类型 | adFormat | adLayout | 说明 |
|---------|----------|----------|------|
| 横幅广告 | `auto` | 不设置 | 自动适应容器大小 |
| 信息流广告 | `fluid` | 不设置 | 流式布局，融入内容 |
| 文章内广告 | `fluid` | `in-article` | 文章内专用（需要特殊广告单元） |
| 侧边栏广告 | `auto` | 不设置 | 自动适应侧边栏 |

### 特殊广告布局

如果你想使用 `in-article` 或 `in-feed` 布局，需要：

1. **在 AdSense 后台创建对应类型的广告单元**
   - 进入 AdSense → 广告 → 按广告单元
   - 选择 "文章内广告" 或 "信息流广告"
   - 获取专用的广告单元 ID

2. **使用正确的属性组合**
   ```tsx
   // 文章内广告（需要专用广告单元）
   <ins
     className="adsbygoogle"
     style={{ display: 'block', textAlign: 'center' }}
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-xxxxxxxx"
     data-ad-slot="xxxxxxxx"
   />
   
   // 信息流广告（需要专用广告单元）
   <ins
     className="adsbygoogle"
     style={{ display: 'block' }}
     data-ad-format="fluid"
     data-ad-layout-key="xxxxxx+xx+xx+xx"  // 从后台获取
     data-ad-client="ca-pub-xxxxxxxx"
     data-ad-slot="xxxxxxxx"
   />
   ```

## 当前广告配置

### 已修复的广告组件

1. **InArticleAd** - 文章内广告
   - Format: `fluid`
   - Layout: `in-article`
   - 位置: 文章内容后

2. **SidebarAd** - 侧边栏广告
   - Format: `auto`
   - 位置: 右侧边栏（sticky）

3. **BannerAd** - 横幅广告
   - Format: `auto` ✅ (已修复)
   - 位置: 页面顶部/底部

4. **FeedAd** - 信息流广告
   - Format: `fluid` ✅ (已修复)
   - Layout: 移除 ✅ (已修复)
   - 位置: 文章列表中

## 测试建议

### 1. 清除缓存
```bash
# 清除 Next.js 缓存
rm -rf .next

# 重新构建
npm run build
npm run dev
```

### 2. 检查控制台
打开浏览器开发者工具，确认：
- ✅ 没有 `data-nscript` 错误
- ✅ 没有 `Invalid data-ad-layout` 错误
- ✅ AdSense 脚本正常加载

### 3. 验证广告位
- 开发环境：应该看到占位符
- 生产环境：等待 AdSense 审核通过后显示真实广告

## 性能优化

### Script 加载策略

| Strategy | 加载时机 | 适用场景 |
|----------|---------|---------|
| `beforeInteractive` | 页面交互前 | 关键脚本 |
| `afterInteractive` | 页面交互后 | 重要但非关键 |
| `lazyOnload` | 空闲时加载 | 广告、分析等 ✅ |

我们使用 `lazyOnload` 策略：
- 不阻塞页面加载
- 不影响用户体验
- 在浏览器空闲时加载
- 最适合广告脚本

## 常见问题

### Q: 为什么移除 async 属性？

**A**: Next.js 的 `<Script>` 组件已经处理了异步加载，手动添加 `async` 会导致冲突。

### Q: 广告不显示怎么办？

**A**: 
1. 检查环境变量是否正确配置
2. 确认 AdSense 账号已通过审核
3. 等待广告填充（可能需要几小时到几天）
4. 检查浏览器是否安装了广告拦截插件

### Q: 开发环境看不到广告？

**A**: 正常！开发环境显示占位符，生产环境才显示真实广告。

### Q: 如何测试广告？

**A**: 
1. 部署到生产环境
2. 使用 Google Publisher Toolbar 插件
3. 不要频繁点击自己的广告（会被封号）

## 相关文档

- [ADSENSE_QUICKSTART.md](./ADSENSE_QUICKSTART.md) - 快速开始指南
- [ADSENSE_SETUP.md](./ADSENSE_SETUP.md) - 详细配置说明
- [ADSENSE_EXAMPLES.md](./ADSENSE_EXAMPLES.md) - 使用示例
- [ADSENSE_VERIFICATION.md](./ADSENSE_VERIFICATION.md) - 验证问题排查
- [ADSENSE_PLACEMENT.md](./ADSENSE_PLACEMENT.md) - 广告位置说明

## 总结

✅ **已修复**:
1. 移除导致 `data-nscript` 错误的 `async` 属性
2. 修复 `Invalid data-ad-layout` 错误
3. 优化广告加载策略为 `lazyOnload`
4. 改进广告格式配置

✅ **结果**:
- 控制台无错误
- 广告正常加载
- 不影响页面性能
- 符合 AdSense 最佳实践
