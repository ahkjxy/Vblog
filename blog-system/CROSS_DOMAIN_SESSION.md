# 跨域 Session 共享配置

## 概述

配置了两个域名之间的 session 共享：
- `https://www.familybank.chat/` (家庭积分系统)
- `https://blog.familybank.chat/` (博客系统)

## 实现方式

通过设置 cookie 的 `domain` 属性为 `.familybank.chat`，使得所有子域名都可以访问同一个 session。

## 修改的文件

### 博客系统 (Next.js)

1. **blog-system/src/lib/supabase/client.ts**
   - 添加了自定义 cookie 处理
   - 设置 `domain=.familybank.chat`
   - 设置 `SameSite=Lax` 和 `Secure`

2. **blog-system/src/lib/supabase/server.ts**
   - 在服务端设置 cookie 时添加相同的 domain 配置

### 家庭积分系统 (Vite + React)

1. **family-points-bank/supabaseClient.ts**
   - 添加了自定义的 storage 配置
   - 使用 cookie 存储替代默认的 localStorage
   - 设置相同的 domain 配置

## Cookie 配置说明

```javascript
{
  domain: '.familybank.chat',  // 允许所有子域名访问
  path: '/',                    // 整个站点可用
  sameSite: 'Lax',             // 防止 CSRF 攻击
  secure: true,                 // 仅 HTTPS 传输
  maxAge: 31536000             // 1年过期时间
}
```

## 部署注意事项

1. **本地开发**
   - 本地开发时 (localhost) 不会使用 `.familybank.chat` domain
   - 需要在生产环境测试跨域 session

2. **环境变量**
   - 确保两个系统使用相同的 Supabase 项目
   - `NEXT_PUBLIC_SUPABASE_URL` 和 `VITE_SUPABASE_URL` 应该相同
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 和 `VITE_SUPABASE_ANON_KEY` 应该相同

3. **Vercel 配置**
   - 确保两个域名都正确配置在 Vercel 项目中
   - 检查 SSL 证书是否正确配置

## 测试步骤

1. 在 `https://www.familybank.chat/` 登录
2. 访问 `https://blog.familybank.chat/`
3. 应该自动保持登录状态
4. 反之亦然

## 故障排查

如果 session 没有共享：

1. **检查 Cookie**
   - 打开浏览器开发者工具 → Application → Cookies
   - 查看 cookie 的 domain 是否为 `.familybank.chat`

2. **检查 HTTPS**
   - 确保两个域名都使用 HTTPS
   - `Secure` flag 要求必须使用 HTTPS

3. **检查 Supabase 配置**
   - 在 Supabase Dashboard → Authentication → URL Configuration
   - 添加两个域名到 "Site URL" 和 "Redirect URLs"：
     - `https://www.familybank.chat`
     - `https://blog.familybank.chat`

4. **清除缓存**
   - 清除浏览器 cookie 和缓存
   - 重新登录测试

## Supabase Dashboard 配置

在 Supabase 项目设置中添加：

**Site URL:**
```
https://www.familybank.chat
```

**Redirect URLs:**
```
https://www.familybank.chat/**
https://blog.familybank.chat/**
```

**Additional Redirect URLs (可选):**
```
https://www.familybank.chat/auth/callback
https://blog.familybank.chat/auth/callback
```
