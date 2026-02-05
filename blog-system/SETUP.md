# 快速设置指南

## 步骤 1: Supabase 项目设置

1. 访问 [supabase.com](https://supabase.com) 并创建新项目
2. 等待项目初始化完成

## 步骤 2: 运行数据库 Schema

1. 在 Supabase 控制台，进入 **SQL Editor**
2. 创建新查询
3. 复制 `supabase/schema.sql` 的全部内容
4. 粘贴并运行

## 步骤 3: 配置 Storage

1. 在 Supabase 控制台，进入 **Storage**
2. 创建新 bucket，命名为 `media`
3. 设置为 **Public bucket**
4. 保存

## 步骤 4: 获取 API 密钥

1. 在 Supabase 控制台，进入 **Settings** > **API**
2. 复制以下信息：
   - Project URL
   - anon/public key
   - service_role key（仅用于服务端）

## 步骤 5: 配置环境变量

1. 在项目根目录创建 `.env.local` 文件：

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

## 步骤 6: 安装依赖并运行

\`\`\`bash
npm install
npm run dev
\`\`\`

## 步骤 7: 创建第一个用户

1. 访问 http://localhost:3000/auth/login
2. 点击"注册"创建账户
3. 在 Supabase 控制台的 **Authentication** > **Users** 中确认用户
4. 在 **Table Editor** > **profiles** 中，将用户的 `role` 改为 `admin`

## 步骤 8: 访问管理后台

1. 登录后访问 http://localhost:3000/dashboard
2. 开始创建文章！

## 可选：配置 OAuth 登录

### Google OAuth

1. 在 Supabase 控制台，进入 **Authentication** > **Providers**
2. 启用 Google provider
3. 在 [Google Cloud Console](https://console.cloud.google.com) 创建 OAuth 客户端
4. 配置回调 URL: `https://your-project.supabase.co/auth/v1/callback`
5. 将 Client ID 和 Secret 填入 Supabase

### GitHub OAuth

1. 在 Supabase 控制台，进入 **Authentication** > **Providers**
2. 启用 GitHub provider
3. 在 [GitHub Settings](https://github.com/settings/developers) 创建 OAuth App
4. 配置回调 URL: `https://your-project.supabase.co/auth/v1/callback`
5. 将 Client ID 和 Secret 填入 Supabase

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（与 .env.local 相同）
4. 部署
5. 更新 `NEXT_PUBLIC_SITE_URL` 为你的 Vercel 域名

## 故障排除

### 无法连接到 Supabase
- 检查 `.env.local` 中的 URL 和 keys 是否正确
- 确保项目已完全初始化

### RLS 策略错误
- 确保已运行完整的 `schema.sql`
- 检查用户的 `role` 是否正确设置

### 图片上传失败
- 确保 `media` bucket 已创建且设置为 public
- 检查 Storage policies

### 无法访问 Dashboard
- 确保用户已登录
- 检查用户的 `role` 字段（需要是 admin、editor 或 author）

## 下一步

- 自定义样式和主题
- 添加更多功能（搜索、评论等）
- 配置 SEO 和 Analytics
- 设置自定义域名
