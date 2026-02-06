# 跨域 Session 共享 - 快速设置指南

## 🎯 目标

让 `www.familybank.chat` 和 `blog.familybank.chat` 共享用户登录状态。

## ✅ 已完成的代码修改

### 1. 博客系统 (blog-system)
- ✅ `src/lib/supabase/client.ts` - 浏览器端 cookie 配置
- ✅ `src/lib/supabase/server.ts` - 服务端 cookie 配置  
- ✅ `src/middleware.ts` - 中间件 cookie 配置

### 2. 家庭积分系统 (family-points-bank)
- ✅ `supabaseClient.ts` - 自定义 cookie storage

## 🚀 部署步骤

### 步骤 1: Supabase 配置

登录 [Supabase Dashboard](https://supabase.com/dashboard) → 选择项目 → Authentication → URL Configuration

添加以下 URL：

**Site URL:**
```
https://www.familybank.chat
```

**Redirect URLs (每行一个):**
```
https://www.familybank.chat/**
https://blog.familybank.chat/**
https://www.familybank.chat/auth/callback
https://blog.familybank.chat/auth/callback
```

### 步骤 2: 环境变量检查

确保两个项目使用相同的 Supabase 配置：

**blog-system/.env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://mfgfbwhznqpdjumtsrus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的密钥
```

**family-points-bank/.env:**
```env
VITE_SUPABASE_URL=https://mfgfbwhznqpdjumtsrus.supabase.co
VITE_SUPABASE_ANON_KEY=你的密钥
```

### 步骤 3: 部署到 Vercel

1. **部署博客系统**
   ```bash
   cd blog-system
   vercel --prod
   ```

2. **部署家庭积分系统**
   ```bash
   cd family-points-bank
   vercel --prod
   ```

3. **配置域名**
   - 在 Vercel 项目设置中添加自定义域名
   - blog-system → `blog.familybank.chat`
   - family-points-bank → `www.familybank.chat`

### 步骤 4: DNS 配置

在你的域名提供商（如 Cloudflare）添加 CNAME 记录：

```
www.familybank.chat  → CNAME → cname.vercel-dns.com
blog.familybank.chat → CNAME → cname.vercel-dns.com
```

## 🧪 测试

1. 访问 `https://www.familybank.chat/` 并登录
2. 打开新标签页访问 `https://blog.familybank.chat/dashboard`
3. 应该自动保持登录状态 ✨

## 🔍 调试

如果不工作，检查：

1. **浏览器开发者工具 → Application → Cookies**
   - 查找 `sb-` 开头的 cookie
   - Domain 应该是 `.familybank.chat`

2. **网络请求**
   - 检查 Set-Cookie header
   - 确认包含 `domain=.familybank.chat`

3. **HTTPS**
   - 必须使用 HTTPS（本地开发除外）
   - 检查 SSL 证书是否有效

## 📝 注意事项

- ⚠️ 本地开发 (localhost) 不会使用跨域 cookie
- ⚠️ 必须在生产环境 (HTTPS) 测试
- ⚠️ 清除浏览器 cookie 后需要重新登录
- ✅ Cookie 有效期为 1 年
- ✅ 使用 SameSite=Lax 防止 CSRF

## 🆘 常见问题

**Q: 为什么本地开发不工作？**
A: 本地开发使用 localhost，不是 `.familybank.chat` 域名。需要在生产环境测试。

**Q: Session 还是不共享？**
A: 检查 Supabase Dashboard 的 Redirect URLs 配置，确保包含两个域名。

**Q: 如何验证配置正确？**
A: 在浏览器开发者工具中检查 cookie 的 domain 属性。
