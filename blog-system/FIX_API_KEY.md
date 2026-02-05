# 🔧 修复 API Key 错误

## 当前问题
显示 "Invalid API key" 错误，说明 `.env.local` 中的 API keys 格式不正确。

## 快速修复步骤

### 1️⃣ 打开 Supabase Dashboard
访问: https://supabase.com/dashboard/project/oeenrjhdamiadvucrjdq/settings/api

### 2️⃣ 找到并复制两个 Keys

在 "Project API keys" 部分，你会看到：

**anon / public**
- 点击 "Copy" 按钮复制完整的 key
- 这个 key 很长，以 `eyJ` 开头

**service_role**  
- 点击 "Reveal" 显示 key
- 点击 "Copy" 复制完整的 key
- 这个 key 也很长，以 `eyJ` 开头

### 3️⃣ 更新 .env.local

打开 `blog-system/.env.local`，替换为：

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://oeenrjhdamiadvucrjdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=粘贴你复制的anon_key
SUPABASE_SERVICE_ROLE_KEY=粘贴你复制的service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4️⃣ 重启服务器

在终端按 `Ctrl+C` 停止，然后运行：
\`\`\`bash
npm run dev
\`\`\`

## 完成！
刷新浏览器，错误应该消失了。
