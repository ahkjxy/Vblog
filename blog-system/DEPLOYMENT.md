# 部署说明

## Supabase 配置已完成

你的 Supabase 项目信息：
- **URL**: https://oeenrjhdamiadvucrjdq.supabase.co
- **Anon Key**: 已配置在 `.env.local`

## 立即开始

### 1. 在 Supabase 中运行 SQL Schema

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq)
2. 点击左侧菜单的 **SQL Editor**
3. 点击 **New query**
4. 复制 `supabase/schema.sql` 的全部内容并粘贴
5. 点击 **Run** 执行

### 2. 创建 Storage Bucket

1. 在 Supabase Dashboard，点击 **Storage**
2. 点击 **Create a new bucket**
3. 名称输入: `media`
4. 选择 **Public bucket**
5. 点击 **Create bucket**

### 3. 获取 Service Role Key

1. 在 Supabase Dashboard，点击 **Settings** > **API**
2. 找到 **service_role** key（在 Project API keys 部分）
3. 复制该 key
4. 打开 `.env.local` 文件
5. 替换 `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here` 中的值

### 4. 运行项目

\`\`\`bash
cd blog-system
npm run dev
\`\`\`

访问: http://localhost:3000

### 5. 创建管理员账户

1. 访问 http://localhost:3000/auth/login
2. 点击"注册"创建新账户
3. 在 Supabase Dashboard > **Authentication** > **Users** 中找到你的用户
4. 在 Supabase Dashboard > **Table Editor** > **profiles** 表中
5. 找到你的用户记录，将 `role` 字段改为 `admin`
6. 保存后重新登录

### 6. 访问管理后台

登录后访问: http://localhost:3000/dashboard

## 功能清单

✅ 用户认证（邮箱/密码）
✅ 文章管理（创建、编辑、发布）
✅ 富文本编辑器
✅ 图片上传
✅ 分类管理
✅ 标签管理
✅ 响应式设计
✅ SEO 优化

## 下一步

- 配置 OAuth 登录（Google、GitHub）
- 添加评论功能
- 实现搜索功能
- 自定义主题样式
- 部署到 Vercel

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (设置为你的 Vercel 域名)
4. 部署

## 故障排除

### 无法登录
- 确保已在 Supabase 中运行了 SQL schema
- 检查 `.env.local` 配置是否正确

### 无法上传图片
- 确保已创建 `media` bucket
- 确保 bucket 设置为 public

### 无法访问 Dashboard
- 确保用户的 `role` 已设置为 `admin`、`editor` 或 `author`
- 重新登录以刷新权限

## 技术支持

如有问题，请检查：
1. Supabase 项目状态
2. 环境变量配置
3. 浏览器控制台错误信息
