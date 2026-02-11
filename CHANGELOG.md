# CHANGELOG

## 2026-02-11

### 修复
- **修复 LogoutButton 中的 supabase 未定义错误**: 在 `LogoutButton.tsx` 中正确初始化 Supabase 客户端实例，添加错误处理
- **修复嵌套 Link 组件错误**: 修复了首页板块列表中嵌套 Link 组件导致的 "Event handlers cannot be passed to Client Component props" 错误
  - 重构了板块列表的链接结构，将嵌套的 Link 分离为独立的链接区域
  - 板块信息和统计信息各自作为独立的 Link 指向分类页面
  - 最新动态作为独立的 Link 指向文章页面
  - 移除了不必要的 onClick 事件处理器

### 改进
- **全面优化后台 UI 和页面布局**: 对 blog 后台进行了全面的 UI/UX 优化
  - **优化 Dashboard Layout**:
    - 统一使用品牌色（`#FF4D94` 和 `#7C4DFF`）替代之前的紫色/粉色渐变
    - 优化侧边栏设计：使用 `rounded-2xl`、更好的阴影效果、hover 动画
    - 优化顶部栏：更清晰的用户信息展示，统一的品牌色
    - 优化移动端导航：添加图标，更好的响应式设计
    - 优化背景渐变：使用更柔和的颜色（`from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]`）
  - **优化 Dashboard 首页**:
    - 统一标题样式：使用 `font-black` 和品牌色渐变
    - 优化统计卡片：使用 `rounded-3xl`、更好的 hover 效果、统一的品牌色图标
    - 优化列表设计：使用 `rounded-3xl`、更好的间距、响应式布局
    - 优化按钮样式：使用 `font-black`、`active:scale-95` 交互效果
    - 优化空状态：添加图标和更好的视觉反馈
  - **优化 Posts 页面**:
    - 统一标题和按钮样式
    - 优化搜索和筛选：使用 `rounded-2xl`、更好的 focus 状态
    - 优化表格设计：使用品牌色表头、更好的 hover 效果、响应式字体大小
    - 优化分页组件：使用品牌色、更好的按钮样式
  - **统一所有后台页面样式**:
    - 所有页面标题统一使用 `font-black` 和品牌色渐变
    - 所有卡片统一使用 `rounded-3xl`
    - 所有按钮统一使用品牌色和 `font-black`
    - 优化移动端显示：响应式字体大小、间距和布局

## 2024-12-19

### 重大更新
- **实现统一登录系统（SSO）**: blog 系统和 family 系统现在使用同一个登录入口
  - 创建了统一登录选择页面 `/auth/unified`，用户可以选择进入博客系统或家庭系统
  - 修改了 `/auth` 页面，支持 `redirect` 参数（`blog` 或 `family`）和 `returnUrl` 参数
  - 修改了 `/auth/callback` 路由，登录成功后根据 `redirect` 参数跳转到对应系统
  - 更新了 Header 组件的登录链接，跳转到统一登录页面
  - 支持魔法链接和密码重置的回调跳转
  - 一次登录，两个系统通用（通过跨域 Cookie 同步）

- **优化首页板块展示，丰富论坛形式**:
  - 重新设计板块展示，采用表格布局，更像传统论坛
  - 显示板块图标、主题数、最新动态等完整信息
  - 添加最新帖子的评论数、浏览量、发布时间等详细信息
  - 按活跃度排序（帖子数优先，其次按最新帖子时间）
  - 优化移动端显示，响应式布局
  - 添加表头，桌面端显示更专业的论坛布局

- **统一前后台页面宽度**:
  - 统一所有后台页面宽度为 `max-w-7xl`（之前部分页面使用 `max-w-4xl` 或 `max-w-2xl`）
  - 统一所有前台页面宽度为 `max-w-7xl`
  - 确保所有页面在不同设备上都有统一的视觉体验

### 改进
- **统一前台页面宽度和移动端优化**: 全面优化了 blog 前台所有页面的响应式设计
  - 统一所有页面的容器宽度为 `max-w-7xl`（之前部分页面使用 `max-w-6xl`）
  - 优化移动端 padding：使用 `px-4 sm:px-6 lg:px-8` 确保手机端有合适的边距
  - 优化移动端字体大小：标题使用响应式字体（`text-2xl sm:text-3xl md:text-4xl lg:text-5xl`）
  - 优化移动端间距：使用响应式间距（`py-6 sm:py-8 md:py-12`）
  - 统一品牌色彩：所有页面使用统一的品牌色（`#FF4D94` 和 `#7C4DFF`）
  - 优化卡片设计：使用 `rounded-3xl` 和更好的阴影效果
  - 优化按钮样式：使用 `font-black` 和渐变背景，添加 `active:scale-95` 交互效果
  - 优化分页组件：移动端隐藏文字，只显示图标，提升可用性
  - 优化空状态页面：使用统一的样式和响应式设计
  - 优化标签云：响应式字体大小和间距
  - 优化文章列表：移动端优化头像大小和间距
  - 优化文章详情页：响应式标题、摘要和元信息显示
  - 优化关于、联系、文档等页面：统一的响应式布局和样式

## 2024-12-19

### 重大更新
- **重构前台 UI 设计**: 参考 family-points-bank 项目，全面重构了 blog 前台的 UI 和布局
  - 采用统一的品牌色彩系统（#FF4D94 和 #7C4DFF）
  - 使用更专业的字体系统（font-black, font-bold）
  - 改进 Hero Section，使用渐变背景和动画效果
  - 优化卡片设计，使用更大的圆角（rounded-3xl）和阴影
  - 统一按钮样式，使用更现代的 hover 和 active 状态
  - 改进统计卡片设计，使用 backdrop-blur 效果
  - 优化精选文章展示，添加排名徽章和更好的视觉层次
  - 改进讨论板块列表，使用更大的图标和更好的间距

- **实现跨域登录状态同步**: 实现了 blog.familybank.chat 和 www.familybank.chat 之间的登录状态同步
  - 更新 `supabase/client.ts`，配置跨域 Cookie 存储（domain=.familybank.chat）
  - 更新 `supabase/server.ts`，服务端也支持跨域 Cookie
  - 更新 `middleware.ts`，确保中间件正确处理跨域 Cookie
  - Cookie 有效期设置为 1 年，使用 Secure 和 SameSite=Lax 确保安全性
  - 用户在任一系统登录后，自动同步到另一个系统

### 修复
- **修复 supabase 未定义错误**: 修复了多个组件中 `supabase is not defined` 的问题
  - `MediaLibraryModal.tsx`: 添加了 `const supabase = createClient()` 初始化
  - `users/page.tsx`: 添加了 supabase 客户端初始化
  - `QuickReviewActions.tsx`: 添加了 supabase 客户端初始化
  - `CustomerSupport.tsx`: 添加了 supabase 客户端初始化
  - `FeedbackManagement.tsx`: 添加了 supabase 客户端初始化
  - `Comments.tsx`: 在函数内部初始化 supabase 客户端
  - `UserContext.tsx`: 添加了 supabase 客户端初始化
  - `posts/[id]/review/page.tsx`: 添加了 supabase 客户端初始化
  - `posts/[id]/edit/page.tsx`: 添加了 supabase 客户端初始化
  - `posts/new/page.tsx`: 添加了 supabase 客户端初始化
  - `auth/page.tsx`: 移除了多余的 supabase 检查（已正确初始化）

- **修复 dashboard 数据获取问题**:
  - 修复了 `dashboard/page.tsx` 中 `viewCount` 可能为 undefined 的问题
  - 修复了 `/api/users/emails` 路由，使用 service client 获取用户邮箱数据

### 改进
- 统一了 supabase 客户端的初始化方式，确保所有客户端组件都正确初始化
- 移除了不必要的 `if (!supabase)` 检查，因为客户端已正确初始化
- 更新 Header 组件，使用统一的品牌色彩和更专业的样式
- 更新 Footer 组件，使用统一的品牌色彩和更专业的样式
- 改进响应式设计，确保在不同设备上都有良好的显示效果

