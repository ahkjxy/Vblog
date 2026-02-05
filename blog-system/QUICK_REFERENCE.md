# 🚀 快速参考

## 一键启动

\`\`\`bash
cd blog-system
npm run dev
\`\`\`

访问: http://localhost:3000

## 重要链接

| 功能 | URL |
|------|-----|
| 首页 | http://localhost:3000 |
| 博客列表 | http://localhost:3000/blog |
| 登录 | http://localhost:3000/auth/login |
| 注册 | http://localhost:3000/auth/signup |
| 管理后台 | http://localhost:3000/dashboard |
| 新建文章 | http://localhost:3000/dashboard/posts/new |

## Supabase 链接

| 功能 | URL |
|------|-----|
| Dashboard | https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq |
| SQL Editor | https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/sql/new |
| Table Editor | https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/editor |
| Storage | https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/storage/buckets |
| Authentication | https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/auth/users |

## 环境变量

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://oeenrjhdamiadvucrjdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=需要从 Supabase 获取
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

## 常用命令

\`\`\`bash
# 开发
npm run dev

# 构建
npm run build

# 生产运行
npm start

# 类型检查
npm run type-check

# 代码检查
npm run lint
\`\`\`

## 首次设置步骤

1. ✅ 在 Supabase SQL Editor 运行 `supabase/schema.sql`
2. ✅ 在 Supabase Storage 创建 `media` bucket (public)
3. ✅ 获取 Service Role Key 更新 `.env.local`
4. ✅ 运行 `npm run dev`
5. ✅ 注册账户
6. ✅ 在 profiles 表设置 role 为 `admin`
7. ✅ 登录并访问 Dashboard

## 文件位置

| 文件 | 路径 |
|------|------|
| 数据库 Schema | `supabase/schema.sql` |
| 环境变量 | `.env.local` |
| 主配置 | `next.config.ts` |
| 样式配置 | `tailwind.config.ts` |
| 类型定义 | `src/types/database.types.ts` |

## 关键组件

| 组件 | 路径 |
|------|------|
| 富文本编辑器 | `src/components/editor/TipTapEditor.tsx` |
| Header | `src/components/layout/Header.tsx` |
| Footer | `src/components/layout/Footer.tsx` |
| Supabase 客户端 | `src/lib/supabase/` |
| 工具函数 | `src/lib/utils.ts` |

## 数据库表

- `profiles` - 用户资料
- `posts` - 文章
- `categories` - 分类
- `tags` - 标签
- `post_categories` - 文章分类关联
- `post_tags` - 文章标签关联
- `comments` - 评论
- `settings` - 系统设置

## 用户角色

- `admin` - 管理员（完全权限）
- `editor` - 编辑（内容管理）
- `author` - 作者（创建文章）

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| 无法登录 | 检查 SQL schema 是否已运行 |
| 无法访问 Dashboard | 检查用户 role 是否设置 |
| 图片上传失败 | 检查 media bucket 是否创建 |
| 环境变量错误 | 检查 .env.local 配置 |

## 技术支持

查看详细文档：
- `START.md` - 快速启动
- `SETUP.md` - 详细设置
- `DEPLOYMENT.md` - 部署指南
- `PROJECT_SUMMARY.md` - 项目总结

---

**需要帮助？** 查看上述文档或检查浏览器控制台错误信息。
