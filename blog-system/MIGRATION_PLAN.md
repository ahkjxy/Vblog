# Next.js 到 Nuxt 3 迁移计划

## 当前状态
- ✅ 首页 (`/pages/index.vue`) - 基本完成，需要修复模板错误
- ❌ 博客列表页 (`/pages/blog/index.vue`) - 未开始
- ❌ 博客详情页 (`/pages/blog/[slug].vue`) - 未开始
- ❌ 分类页面 (`/pages/categories/*`) - 未开始
- ❌ 标签页面 (`/pages/tags/*`) - 未开始
- ❌ Dashboard 后台系统 (`/pages/dashboard/*`) - 未开始

## 需要修复的问题

### 1. 首页模板错误
- **问题**: "Element is missing end tag"
- **原因**: 可能是 `v-if` 和 `v-else` 结构不匹配
- **解决**: 检查所有 div 标签的闭合

### 2. 数字和头像重叠
- **位置**: 精选文章的排名徽章
- **原因**: CSS 定位问题
- **解决**: 调整 absolute 定位和 z-index

### 3. 数据加载问题
- **问题**: homeData 可能为 null 导致页面高度为 0
- **解决**: 添加 loading 状态和空数据处理

## 迁移优先级

### Phase 1: 修复首页 (当前)
1. ✅ 修复模板错误
2. ✅ 修复数字和头像重叠
3. ✅ 添加 loading 状态
4. ✅ 测试数据加载

### Phase 2: 前台页面迁移
1. `/blog` - 博客列表页（论坛形式，内容丰富）
2. `/blog/[slug]` - 博客详情页
3. `/categories` - 分类列表
4. `/categories/[slug]` - 分类详情
5. `/tags` - 标签列表
6. `/tags/[slug]` - 标签详情

### Phase 3: Dashboard 后台迁移
1. `/dashboard` - 概览页
2. `/dashboard/posts` - 文章管理
3. `/dashboard/posts/new` - 新建文章
4. `/dashboard/posts/[id]/edit` - 编辑文章
5. `/dashboard/categories` - 分类管理
6. `/dashboard/tags` - 标签管理
7. `/dashboard/media` - 媒体库
8. `/dashboard/comments` - 评论管理
9. `/dashboard/users` - 用户管理（超级管理员）
10. `/dashboard/settings` - 系统设置

### Phase 4: 权限系统
- 实现和 Next.js 版本一致的权限控制
- 超级管理员判断: `role === 'admin' && family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'`
- 中间件保护路由

## 技术栈对应关系

| Next.js | Nuxt 3 |
|---------|--------|
| `import { createClient } from '@/lib/supabase/server'` | `const client = useSupabaseClient()` |
| `export default async function Page()` | `<script setup>` with `useAsyncData` |
| `'use client'` | 默认客户端组件 |
| `Link` from `next/link` | `<NuxtLink>` |
| `useRouter` from `next/navigation` | `useRouter()` from `#app` |
| `className` | `class` |
| Tailwind CSS classes | 保持不变 |

## 注意事项
1. Nuxt 3 使用 `<script setup>` 语法
2. 服务端数据获取使用 `useAsyncData` 或 `useFetch`
3. 客户端状态使用 `ref` 和 `reactive`
4. 路由参数使用 `useRoute().params`
5. Supabase 客户端使用 `useSupabaseClient()`
