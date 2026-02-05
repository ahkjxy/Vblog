# 博客系统

基于 Next.js 14 和 Supabase 构建的现代全栈博客系统。

## 技术栈

- **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **后端**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **编辑器**: TipTap
- **部署**: Vercel + Supabase

## 功能特性

- ✅ 用户认证（邮箱/密码、OAuth）
- ✅ 富文本编辑器
- ✅ 文章管理（草稿、发布、归档）
- ✅ 分类和标签
- ✅ 评论系统
- ✅ 媒体库
- ✅ SEO 优化
- ✅ 响应式设计
- ✅ 实时更新
- ✅ 角色权限（Admin、Editor、Author）

## 快速开始

### 1. 克隆项目

\`\`\`bash
git clone <repository-url>
cd blog-system
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置 Supabase

1. 在 [supabase.com](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中运行 `supabase/schema.sql` 文件
3. 在 Storage 中创建 `media` bucket（设置为 public）
4. 复制项目 URL 和 API keys

### 4. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填入你的 Supabase 凭证：

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

编辑 `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 5. 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

\`\`\`
blog-system/
├── src/
│   ├── app/
│   │   ├── (frontend)/      # 公共页面
│   │   ├── dashboard/       # 管理后台
│   │   └── auth/            # 认证页面
│   ├── components/
│   │   ├── editor/          # 富文本编辑器
│   │   └── layout/          # 布局组件
│   ├── lib/
│   │   ├── supabase/        # Supabase 客户端
│   │   └── utils.ts         # 工具函数
│   └── types/               # TypeScript 类型
├── supabase/
│   └── schema.sql           # 数据库架构
└── public/                  # 静态资源
\`\`\`

## 数据库架构

主要表：
- `profiles` - 用户资料
- `posts` - 文章
- `categories` - 分类
- `tags` - 标签
- `comments` - 评论
- `post_categories` - 文章-分类关联
- `post_tags` - 文章-标签关联
- `settings` - 系统设置

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### Supabase 配置

确保在 Supabase 项目中：
1. 已运行 SQL schema
2. 已创建 Storage bucket
3. 已配置 OAuth providers（如需要）

## 开发指南

### 创建新页面

在 `src/app` 目录下创建新的路由文件夹和 `page.tsx`。

### 添加新组件

在 `src/components` 目录下创建新组件。

### 数据库操作

使用 Supabase 客户端进行数据库操作：

\`\`\`typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('posts')
  .select('*')
\`\`\`

## 许可证

MIT
