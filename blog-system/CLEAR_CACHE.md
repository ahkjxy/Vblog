# 清除 Next.js 缓存

## 问题描述

遇到 webpack 模块错误：
```
__webpack_modules__[[moduleId]] is not a function
```

这通常是由于 Next.js 的构建缓存损坏或过期导致的。

## 解决方案

### 方法 1：删除 .next 文件夹（推荐）

```bash
# 进入项目目录
cd blog-system

# 删除 .next 文件夹
rm -rf .next

# 重新启动开发服务器
npm run dev
```

### 方法 2：完全清理（如果方法 1 不起作用）

```bash
# 进入项目目录
cd blog-system

# 删除所有缓存和依赖
rm -rf .next
rm -rf node_modules
rm -rf .turbo

# 清除 npm 缓存
npm cache clean --force

# 重新安装依赖
npm install

# 重新启动开发服务器
npm run dev
```

### 方法 3：使用 Next.js 清理命令

```bash
# 进入项目目录
cd blog-system

# 使用 Next.js 的清理命令
npx next clean

# 重新启动开发服务器
npm run dev
```

## 常见的 Webpack 错误

### 1. `__webpack_require__.n is not a function`
**原因**：服务端组件导入客户端组件时没有正确标记
**解决**：在布局或页面顶部添加 `'use client'`

### 2. `__webpack_modules__[[moduleId]] is not a function`
**原因**：构建缓存损坏或模块导入问题
**解决**：清除 .next 文件夹并重新构建

### 3. `Cannot read property 'call' of undefined`
**原因**：模块加载失败或循环依赖
**解决**：检查导入路径，清除缓存

## 预防措施

### 1. 正确使用 'use client'

**客户端组件**（需要 'use client'）：
- 使用 React hooks（useState, useEffect 等）
- 使用浏览器 API（window, document 等）
- 处理用户交互（onClick, onChange 等）
- 使用客户端库（如 TipTap）

**服务端组件**（不需要 'use client'）：
- 直接访问数据库
- 使用 async/await 获取数据
- 不需要交互的静态内容

### 2. 避免循环依赖

```typescript
// ❌ 错误：循环依赖
// A.tsx
import { B } from './B'
export function A() { return <B /> }

// B.tsx
import { A } from './A'
export function B() { return <A /> }

// ✅ 正确：提取共享逻辑
// shared.tsx
export const sharedLogic = () => {}

// A.tsx
import { sharedLogic } from './shared'
export function A() { /* use sharedLogic */ }

// B.tsx
import { sharedLogic } from './shared'
export function B() { /* use sharedLogic */ }
```

### 3. 正确的导入路径

```typescript
// ✅ 使用别名
import { Component } from '@/components/Component'

// ✅ 相对路径
import { Component } from '../components/Component'

// ❌ 避免混合使用
import { A } from '@/components/A'
import { B } from '../components/B'  // 不一致
```

## 开发环境最佳实践

### 1. 定期清理缓存

建议每周或在遇到奇怪错误时清理一次：
```bash
npm run dev -- --turbo  # 使用 Turbopack（更快）
```

### 2. 使用 TypeScript 严格模式

在 `tsconfig.json` 中启用：
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 3. 监控构建输出

注意开发服务器的警告和错误信息：
```bash
npm run dev
# 查看输出中的警告
```

## 生产环境构建

在部署前测试生产构建：

```bash
# 构建生产版本
npm run build

# 本地运行生产版本
npm run start
```

如果生产构建失败，通常意味着代码有问题，而不是缓存问题。

## 故障排除清单

遇到 webpack 错误时，按顺序尝试：

1. [ ] 刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R）
2. [ ] 重启开发服务器（Ctrl+C 然后 npm run dev）
3. [ ] 删除 .next 文件夹（rm -rf .next）
4. [ ] 运行 npx next clean
5. [ ] 删除 node_modules 并重新安装
6. [ ] 检查代码中的 'use client' 使用
7. [ ] 检查导入路径是否正确
8. [ ] 查看浏览器控制台的详细错误
9. [ ] 查看终端的构建输出
10. [ ] 尝试生产构建（npm run build）

## 相关文件

- `blog-system/.next/` - Next.js 构建缓存（可以删除）
- `blog-system/node_modules/` - npm 依赖（可以删除并重新安装）
- `blog-system/tsconfig.json` - TypeScript 配置
- `blog-system/next.config.ts` - Next.js 配置

## 获取帮助

如果以上方法都不起作用：

1. 检查 Next.js 版本是否最新
2. 查看 Next.js GitHub Issues
3. 检查依赖包的兼容性
4. 尝试降级或升级相关包

## 快速命令参考

```bash
# 清理并重启（最常用）
rm -rf .next && npm run dev

# 完全清理
rm -rf .next node_modules && npm install && npm run dev

# 使用 Next.js 清理命令
npx next clean && npm run dev

# 生产构建测试
npm run build && npm run start
```
