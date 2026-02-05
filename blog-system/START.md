# 🚀 快速启动指南

## 当前状态

✅ 项目代码已完成
✅ 环境变量已配置
⏳ 需要在 Supabase 中运行 SQL
⏳ 需要创建 Storage bucket

## 3 步启动

### 步骤 1: 初始化 Supabase 数据库

打开 [Supabase SQL Editor](https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/sql/new)

复制并运行 `supabase/schema.sql` 中的所有 SQL 代码。

### 步骤 2: 创建 Storage Bucket

1. 打开 [Supabase Storage](https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/storage/buckets)
2. 点击 "New bucket"
3. 名称: `media`
4. 选择 "Public bucket"
5. 创建

### 步骤 3: 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问: http://localhost:3000

## 首次使用

1. **注册账户**: 访问 http://localhost:3000/auth/signup
2. **设置管理员权限**:
   - 打开 [Supabase Table Editor](https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/editor)
   - 选择 `profiles` 表
   - 找到你的用户，将 `role` 改为 `admin`
3. **登录**: 访问 http://localhost:3000/auth/login
4. **进入后台**: http://localhost:3000/dashboard

## 主要功能

| 功能 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 查看所有已发布文章 |
| 文章详情 | `/blog/[slug]` | 阅读文章内容 |
| 登录 | `/auth/login` | 用户登录 |
| 注册 | `/auth/signup` | 新用户注册 |
| 管理后台 | `/dashboard` | 管理面板 |
| 文章管理 | `/dashboard/posts` | 查看和管理文章 |
| 新建文章 | `/dashboard/posts/new` | 创建新文章 |
| 分类管理 | `/dashboard/categories` | 管理分类 |
| 标签管理 | `/dashboard/tags` | 管理标签 |

## 技术栈

- **前端**: Next.js 14, TypeScript, Tailwind CSS
- **后端**: Supabase (PostgreSQL, Auth, Storage)
- **编辑器**: TipTap (富文本编辑)
- **图标**: Lucide React

## 项目结构

\`\`\`
blog-system/
├── src/
│   ├── app/
│   │   ├── (frontend)/      # 公共页面
│   │   ├── dashboard/       # 管理后台
│   │   └── auth/            # 认证页面
│   ├── components/          # React 组件
│   ├── lib/                 # 工具函数和配置
│   └── types/               # TypeScript 类型
├── supabase/
│   └── schema.sql           # 数据库架构
└── public/                  # 静态资源
\`\`\`

## 常见问题

**Q: 无法登录？**
A: 确保已在 Supabase 中运行了 SQL schema

**Q: 无法访问 Dashboard？**
A: 检查用户的 `role` 是否设置为 `admin`、`editor` 或 `author`

**Q: 图片上传失败？**
A: 确保已创建 `media` bucket 并设置为 public

**Q: Node 版本警告？**
A: Next.js 16 需要 Node.js >= 20.9.0，但开发模式下可以忽略

## 下一步

- [ ] 添加评论功能
- [ ] 实现全文搜索
- [ ] 配置 OAuth 登录
- [ ] 自定义主题
- [ ] 部署到 Vercel

## 需要帮助？

查看详细文档：
- `README.md` - 项目概述
- `SETUP.md` - 详细设置指南
- `DEPLOYMENT.md` - 部署说明

---

**准备好了吗？运行 `npm run dev` 开始吧！** 🎉
