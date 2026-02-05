# 🔑 获取正确的 Supabase API Keys

## 问题
当前的 API key 格式不正确，导致无法连接到 Supabase。

## 解决方案

### 步骤 1: 访问 Supabase API Settings

打开这个链接：
https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/settings/api

### 步骤 2: 复制正确的 Keys

在页面上你会看到两个重要的 keys：

#### 1. Project API keys 部分

**anon public key** (公开密钥)
- 这是一个很长的字符串，以 `eyJ` 开头
- 看起来像这样：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...`
- 复制完整的字符串

**service_role key** (服务角色密钥)
- 也是一个很长的字符串，以 `eyJ` 开头
- ⚠️ 这个 key 很重要，不要泄露！
- 复制完整的字符串

### 步骤 3: 更新 .env.local

打开 `blog-system/.env.local` 文件，替换为：

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://oeenrjhdamiadvucrjdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你复制的anon_key
SUPABASE_SERVICE_ROLE_KEY=你复制的service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 步骤 4: 重启开发服务器

在终端中：
1. 按 `Ctrl + C` 停止当前服务器
2. 运行 `npm run dev` 重新启动

## 识别正确的 Key 格式

✅ **正确的格式**（JWT token）:
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZW5yamhkYW1pYWR2dWNyamRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTU0NzcsImV4cCI6MjA1NDMzMTQ3N30.plql44ThjGwuUDxPeswQ_3gTeibWm
\`\`\`

❌ **错误的格式**:
\`\`\`
sb_publishable_4_plql44ThjGwuUDxPeswQ_3gTeibWm
\`\`\`

## 注意事项

- anon key 是公开的，可以在前端使用
- service_role key 是私密的，只能在服务端使用
- 两个 keys 都应该是很长的字符串（通常 200+ 字符）
- 都以 `eyJ` 开头

## 完成后

更新 keys 并重启服务器后，访问 http://localhost:3000 应该就能正常工作了。
