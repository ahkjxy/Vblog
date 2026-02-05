# Vercel 部署指南

## 环境变量配置

在 Vercel 项目设置中，需要添加以下环境变量：

### 必需的环境变量

1. **NEXT_PUBLIC_SUPABASE_URL**
   - 值: `https://oeenrjhdamiadvucrjdq.supabase.co`
   - 说明: Supabase 项目 URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - 值: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZW5yamhkYW1pYWR2dWNyamRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTQ4MDcsImV4cCI6MjA4NTgzMDgwN30.OPiUDQj21g1pJjOLTUWwm2r5Tf-9AfoHVOb_p1Rr7wg`
   - 说明: Supabase 匿名密钥（公开密钥）

3. **SUPABASE_SERVICE_ROLE_KEY**
   - 值: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZW5yamhkYW1pYWR2dWNyamRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1NDgwNywiZXhwIjoyMDg1ODMwODA3fQ.C_6jTKRKSQSHp2EXVAC4O0hmc3aSSk19qZ9rO-O5Qac`
   - 说明: Supabase 服务角色密钥（私密密钥，仅服务端使用）

## 部署步骤

### 1. 连接 GitHub 仓库
- 登录 Vercel
- 点击 "Add New Project"
- 选择你的 GitHub 仓库
- 选择 `blog-system` 目录作为根目录

### 2. 配置项目设置
- Framework Preset: Next.js
- Root Directory: `blog-system`
- Build Command: `npm run build`
- Output Directory: `.next`

### 3. 添加环境变量
在 Vercel 项目设置中：
1. 进入 Settings → Environment Variables
2. 添加上述三个环境变量
3. 确保选择 Production, Preview, Development 环境

### 4. 部署
- 点击 "Deploy" 按钮
- 等待构建完成

## 常见问题

### 1. Supabase 连接错误
**错误**: `Your project's URL and API key are required`

**解决方案**: 
- 检查环境变量是否正确配置
- 确保变量名称完全匹配（区分大小写）
- 重新部署项目

### 2. ESLint 错误
**错误**: `Cannot find module 'eslint-config-next/core-web-vitals'`

**解决方案**: 
- 已在 `eslint.config.mjs` 中修复
- 使用 FlatCompat 兼容层

### 3. 构建超时
**解决方案**:
- 检查 `package.json` 中的依赖版本
- 确保 Node.js 版本兼容（推荐 18.x 或 20.x）

## 数据库设置

确保在 Supabase 中已经运行了数据库迁移：

```sql
-- 运行 supabase/schema.sql 中的所有 SQL 语句
```

## 验证部署

部署成功后，访问以下页面验证：

- ✅ 首页: `/`
- ✅ 博客列表: `/blog`
- ✅ 登录页面: `/auth/login`
- ✅ 注册页面: `/auth/signup`
- ✅ 控制台: `/dashboard`

## 联系支持

如有问题，请联系: ahkjxy@qq.com
