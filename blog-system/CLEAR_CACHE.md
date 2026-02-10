# 清除缓存指南

## 问题
仍然看到 "AdSense head tag doesn't support data-nscript attribute" 错误

## 原因
这是缓存问题，需要清除多个层级的缓存：
1. Next.js 构建缓存
2. 浏览器缓存
3. 开发服务器缓存

## 解决步骤

### 1. 清除 Next.js 缓存 ✅ (已完成)

```bash
cd blog-system
rm -rf .next
```

### 2. 重启开发服务器

**停止当前服务器**:
- 按 `Ctrl + C` (Mac: `Cmd + C`)

**重新启动**:
```bash
npm run dev
```

### 3. 清除浏览器缓存

#### Chrome/Edge:
1. 打开开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

或者:
1. `Cmd/Ctrl + Shift + Delete`
2. 选择 "缓存的图片和文件"
3. 点击 "清除数据"

#### Firefox:
1. `Cmd/Ctrl + Shift + Delete`
2. 选择 "缓存"
3. 点击 "立即清除"

#### Safari:
1. `Cmd + Option + E` (清空缓存)
2. 刷新页面

### 4. 使用无痕/隐私模式测试

最简单的方法：
1. 打开无痕/隐私浏览窗口
2. 访问 http://localhost:3000
3. 检查是否还有错误

### 5. 检查页面源代码

访问页面后：
1. 右键 → 查看网页源代码
2. 搜索 `adsbygoogle`
3. 应该看到：

```html
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8769672462868982" crossorigin="anonymous"></script>
```

**不应该有**:
- `data-nscript` 属性
- Next.js 的 Script 组件标记

## 代码更改说明

### 之前 (有问题):
```tsx
import Script from 'next/script'

return (
  <Script
    src="..."
    strategy="lazyOnload"
    crossOrigin="anonymous"
  />
)
```

### 现在 (已修复):
```tsx
return (
  <>
    <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
    <script
      async
      src="..."
      crossOrigin="anonymous"
    />
  </>
)
```

**关键变化**:
- 不再使用 Next.js 的 `<Script>` 组件
- 使用原生 HTML `<script>` 标签
- 添加 `preconnect` 优化加载速度
- 避免 Next.js 添加额外属性

## 验证修复

### 1. 检查控制台
打开浏览器控制台，应该：
- ✅ 没有 "data-nscript" 错误
- ✅ 没有 "Invalid data-ad-layout" 错误
- ✅ AdSense 脚本正常加载

### 2. 检查网络请求
在开发者工具的 Network 标签：
1. 刷新页面
2. 搜索 "adsbygoogle"
3. 应该看到脚本成功加载 (状态码 200)

### 3. 检查广告占位符
在开发环境，应该看到：
- 灰色虚线边框的占位符
- "📢 广告位置" 文字
- "配置 NEXT_PUBLIC_ADSENSE_CLIENT_ID 后显示" 提示

## 如果还是有问题

### 方案 A: 完全重建
```bash
cd blog-system
rm -rf .next
rm -rf node_modules/.cache
npm run build
npm run dev
```

### 方案 B: 检查环境变量
```bash
# 确认环境变量已加载
cat .env.local | grep ADSENSE
```

应该看到：
```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-8769672462868982
```

### 方案 C: 检查文件是否保存
```bash
# 查看 AdsenseScript.tsx 内容
cat src/components/ads/AdsenseScript.tsx
```

应该看到原生 `<script>` 标签，而不是 `<Script>` 组件。

## 常见问题

### Q: 为什么不用 Next.js Script 组件？

**A**: Next.js Script 组件会添加 `data-nscript` 等属性用于追踪和优化，但 AdSense 脚本不支持这些自定义属性，导致警告。使用原生 script 标签可以避免这个问题。

### Q: 性能会受影响吗？

**A**: 不会。我们添加了 `preconnect` 来优化连接，`async` 属性确保不阻塞页面加载。

### Q: 生产环境也需要这样吗？

**A**: 是的，这个修复对开发和生产环境都有效。

## 总结

✅ **已完成**:
1. 清除 .next 缓存
2. 改用原生 script 标签
3. 添加 preconnect 优化

🔄 **需要你做**:
1. 重启开发服务器
2. 清除浏览器缓存（或使用无痕模式）
3. 刷新页面验证

📝 **预期结果**:
- 控制台无错误
- 广告占位符正常显示
- AdSense 脚本正常加载
