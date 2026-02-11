# 博客系统 Next.js 到 Nuxt 3 完整迁移指南

## 项目概述
将 `blog-system-nextjs-backup` 完整迁移到 Nuxt 3，保持所有功能、样式和权限系统一致。

## 当前进度
- ✅ 首页基础版本（简化）
- ❌ 首页完整版本（论坛形式，内容丰富）
- ❌ 所有其他页面

## 迁移策略

### 阶段 1: 前台页面（论坛形式）

#### 1.1 首页完整版 `/pages/index.vue`
**参考**: `blog-system-nextjs-backup/src/app/(frontend)/page.tsx`

**需要包含的内容**:
- Hero Section with Stats
- 精选文章（3篇，带排名徽章 - 修复重叠问题）
- 讨论板块（论坛形式，显示最新帖子和统计）
- 最新回复
- 热门标签
- 侧边栏：
  - 热门主题
  - 最新主题
  - 下载卡片
  - 活跃贡献者
  - 快速链接

**关键修复**:
```vue
<!-- 排名徽章 - 避免与头像重叠 -->
<div class="absolute top-4 left-4 z-10">  <!-- 确保 z-index 高于其他元素 -->
  <div class="w-10 h-10 rounded-xl ...">
    {{ index + 1 }}
  </div>
</div>
```

#### 1.2 博客列表页 `/pages/blog/index.vue`
**参考**: `blog-system-nextjs-backup/src/app/(frontend)/blog/page.tsx`

**功能要求**:
- 文章列表（分页）
- 搜索功能
- 分类筛选
- 标签筛选
- 排序选项（最新、最热、最多评论）
- 侧边栏（同首页）

#### 1.3 博客详情页 `/pages/blog/[slug].vue`
**参考**: `blog-system-nextjs-backup/src/app/(frontend)/blog/[slug]/page.tsx`

**功能要求**:
- 文章内容（Markdown 渲染）
- 作者信息
- 发布时间、浏览数、评论数
- 分类和标签
- 评论系统（显示、回复、提交）
- 相关文章推荐
- 目录导航（TOC）

#### 1.4 分类页面
- `/pages/categories/index.vue` - 分类列表
- `/pages/categories/[slug].vue` - 分类详情（该分类下的文章）

#### 1.5 标签页面
- `/pages/tags/index.vue` - 标签云
- `/pages/tags/[slug].vue` - 标签详情（该标签下的文章）

#### 1.6 其他页面
- `/pages/about.vue` - 关于我们
- `/pages/docs.vue` - 使用文档
- `/pages/changelog.vue` - 更新日志
- `/pages/contact.vue` - 联系我们
- `/pages/privacy.vue` - 隐私政策

### 阶段 2: 后台管理系统

#### 2.1 Dashboard 布局 `/layouts/dashboard.vue`
**参考**: `blog-system-nextjs-backup/src/app/dashboard/layout.tsx`

**功能要求**:
- 侧边栏导航
- 顶部栏（用户信息、退出登录）
- 权限检查中间件
- 响应式设计

**权限系统**:
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const client = useSupabaseClient()
  const { data: { user } } = await client.auth.getUser()
  
  if (!user) {
    return navigateTo('/auth/login')
  }
  
  const { data: profile } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.id)
    .single()
  
  // 检查是否是超级管理员
  const isSuperAdmin = profile?.role === 'admin' && 
    profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  
  // 某些页面只有超级管理员可以访问
  const adminOnlyPages = ['/dashboard/users', '/dashboard/settings']
  if (adminOnlyPages.some(page => to.path.startsWith(page)) && !isSuperAdmin) {
    return navigateTo('/dashboard')
  }
})
```

#### 2.2 Dashboard 页面列表

| 页面 | 路径 | 参考文件 | 权限 |
|------|------|----------|------|
| 概览 | `/pages/dashboard/index.vue` | `src/app/dashboard/page.tsx` | 所有登录用户 |
| 文章列表 | `/pages/dashboard/posts/index.vue` | `src/app/dashboard/posts/page.tsx` | 所有登录用户 |
| 新建文章 | `/pages/dashboard/posts/new.vue` | `src/app/dashboard/posts/new/page.tsx` | 所有登录用户 |
| 编辑文章 | `/pages/dashboard/posts/[id]/edit.vue` | `src/app/dashboard/posts/[id]/edit/page.tsx` | 作者或管理员 |
| 审核文章 | `/pages/dashboard/posts/[id]/review.vue` | `src/app/dashboard/posts/[id]/review/page.tsx` | 仅超级管理员 |
| 分类管理 | `/pages/dashboard/categories.vue` | `src/app/dashboard/categories/page.tsx` | 仅超级管理员 |
| 标签管理 | `/pages/dashboard/tags.vue` | `src/app/dashboard/tags/page.tsx` | 仅超级管理员 |
| 媒体库 | `/pages/dashboard/media.vue` | `src/app/dashboard/media/page.tsx` | 所有登录用户 |
| 评论管理 | `/pages/dashboard/comments.vue` | `src/app/dashboard/comments/page.tsx` | 作者或管理员 |
| 用户管理 | `/pages/dashboard/users.vue` | `src/app/dashboard/users/page.tsx` | 仅超级管理员 |
| 系统设置 | `/pages/dashboard/settings.vue` | `src/app/dashboard/settings/page.tsx` | 仅超级管理员 |

### 阶段 3: 认证系统

#### 3.1 认证页面
- `/pages/auth/unified.vue` - 注册登录一体化
- 

#### 3.2 中间件
- `middleware/auth.ts` - 认证检查
- `middleware/guest.ts` - 游客检查（已登录用户不能访问登录页）

### 阶段 4: 组件迁移

#### 4.1 布局组件
- `/components/layout/Header.vue`
- `/components/layout/Footer.vue`
- `/components/layout/Sidebar.vue`

#### 4.2 UI 组件
- `/components/ui/Modal.vue`
- `/components/ui/Toast.vue`
- `/components/ui/LoadingSpinner.vue`
- `/components/ui/EmptyState.vue`
- `/components/ui/ConfirmDialog.vue`

#### 4.3 功能组件
- `/components/Comments.vue` - 评论组件
- `/components/MarkdownContent.vue` - Markdown 渲染
- `/components/editor/MarkdownEditor.vue` - Markdown 编辑器
- `/components/editor/MediaLibraryModal.vue` - 媒体库选择器
- `/components/dashboard/DashboardNav.vue` - Dashboard 导航
- `/components/dashboard/LogoutButton.vue` - 退出登录按钮

## 技术要点

### 1. Supabase 客户端
```typescript
// Nuxt 3
const client = useSupabaseClient()

// 获取用户
const { data: { user } } = await client.auth.getUser()

// 查询数据
const { data, error } = await client
  .from('posts')
  .select('*')
  .eq('status', 'published')
```

### 2. 数据获取
```typescript
// 服务端数据获取（SSR）
const { data } = await useAsyncData('key', async () => {
  const client = useSupabaseClient()
  const { data } = await client.from('posts').select('*')
  return data
})

// 客户端数据获取
const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  const client = useSupabaseClient()
  const { data } = await client.from('posts').select('*')
  posts.value = data
  loading.value = false
})
```

### 3. 路由和导航
```vue
<!-- 链接 -->
<NuxtLink to="/blog">博客</NuxtLink>

<!-- 编程式导航 -->
<script setup>
const router = useRouter()
const navigateToBlog = () => {
  router.push('/blog')
}
</script>

<!-- 路由参数 -->
<script setup>
const route = useRoute()
const slug = route.params.slug
</script>
```

### 4. 样式保持
- 所有 Tailwind CSS 类保持不变
- `className` 改为 `class`
- 动态类使用 `:class` 或数组/对象语法

## 迁移检查清单

### 前台页面
- [ ] 首页完整版（论坛形式）
- [ ] 博客列表页
- [ ] 博客详情页
- [ ] 分类列表和详情
- [ ] 标签列表和详情
- [ ] 其他静态页面

### 后台页面
- [ ] Dashboard 布局
- [ ] 概览页
- [ ] 文章管理（列表、新建、编辑、审核）
- [ ] 分类管理
- [ ] 标签管理
- [ ] 媒体库
- [ ] 评论管理
- [ ] 用户管理
- [ ] 系统设置

### 功能
- [ ] 认证系统
- [ ] 权限控制
- [ ] 评论系统
- [ ] 搜索功能
- [ ] 分页功能
- [ ] 文件上传
- [ ] Markdown 编辑和渲染
- [ ] SEO 优化

### 测试
- [ ] 所有页面可访问
- [ ] 权限控制正确
- [ ] 数据正确显示
- [ ] 表单提交正常
- [ ] 响应式设计正常
- [ ] 性能优化

## 下一步行动

1. **立即修复首页**
   - 修复排名徽章重叠问题
   - 添加完整的论坛内容
   
2. **创建博客列表页**
   - 参考 Next.js 版本
   - 实现所有功能
   
3. **逐步迁移 Dashboard**
   - 先做布局和权限
   - 再逐个页面迁移

4. **测试和优化**
   - 功能测试
   - 性能优化
   - SEO 优化
