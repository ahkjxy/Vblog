# Webpack 错误修复

## 问题描述

前台页面出现运行时错误：
```
Runtime TypeError
__webpack_require__.n is not a function
```

错误发生在 `src/app/(frontend)/layout.tsx` 第 12 行，当尝试导入 Header 组件时。

## 根本原因

前台布局文件 (`src/app/(frontend)/layout.tsx`) 导入了客户端组件（Header 和 CustomerSupport），但布局本身没有标记为客户端组件。

在 Next.js 15 中，当服务端组件导入客户端组件时，webpack 可能无法正确处理模块导入，导致 `__webpack_require__.n` 函数未定义。

## 解决方案

在前台布局文件顶部添加 `'use client'` 指令：

**文件**: `blog-system/src/app/(frontend)/layout.tsx`

```typescript
'use client'  // 添加这一行

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CustomerSupport } from '@/components/CustomerSupport'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CustomerSupport />
    </div>
  )
}
```

## 为什么需要 'use client'

1. **Header 组件**：使用了 `useState`、`useEffect` 等 React hooks，是客户端组件
2. **CustomerSupport 组件**：使用了 `useState`、`useRef` 等 hooks，是客户端组件
3. **布局组件**：导入了这些客户端组件，因此也必须是客户端组件

## Next.js 组件规则

### 服务端组件（默认）
- 可以直接访问数据库
- 可以使用 async/await
- 不能使用 React hooks
- 不能使用浏览器 API
- 不能导入客户端组件（除非通过特殊方式）

### 客户端组件（'use client'）
- 可以使用 React hooks
- 可以使用浏览器 API
- 可以处理用户交互
- 可以导入其他客户端组件
- 不能直接访问服务端资源

## 相关文件

- `blog-system/src/app/(frontend)/layout.tsx` - 前台布局（已修复）
- `blog-system/src/components/layout/Header.tsx` - Header 组件（客户端）
- `blog-system/src/components/CustomerSupport.tsx` - 客户支持组件（客户端）
- `blog-system/src/components/layout/Footer.tsx` - Footer 组件（服务端）

## 验证修复

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问前台页面（如首页 `/`）

3. 验证页面正常加载，没有 webpack 错误

4. 验证 Header 和 CustomerSupport 组件正常工作

## 注意事项

1. **性能影响**：将布局标记为客户端组件意味着整个布局及其子组件都会在客户端渲染。这可能会略微影响首次加载性能。

2. **替代方案**：如果需要优化性能，可以考虑：
   - 将 Header 和 CustomerSupport 组件延迟加载（dynamic import）
   - 重构组件，将服务端逻辑和客户端逻辑分离
   - 使用 React Server Components 的边界模式

3. **最佳实践**：
   - 尽可能使用服务端组件
   - 只在需要交互或使用浏览器 API 时使用客户端组件
   - 在组件树中尽可能晚地引入 'use client' 边界

## 相关错误

如果遇到类似的 webpack 错误：
- `__webpack_require__ is not a function`
- `Cannot read property 'n' of undefined`
- `Module not found` 在运行时

通常都是因为服务端/客户端组件边界问题，解决方法：
1. 检查组件是否正确标记了 'use client'
2. 检查导入路径是否正确
3. 清除 .next 缓存并重新构建
