# Session 错误修复指南

## 错误信息

```json
{
  "code": "session_not_found",
  "message": "Session from session_id claim in JWT does not exist"
}
```

## 原因分析

这个错误通常发生在以下情况：

1. **Cookie 不同步**
   - 家庭系统和博客系统使用不同的 cookie 存储方式
   - Cookie domain 设置不一致

2. **Session 过期**
   - JWT token 中的 session_id 在 Supabase 数据库中已过期或被删除

3. **跨域问题**
   - Cookie 没有正确设置为跨域（domain: `.familybank.chat`）
   - SameSite 或 Secure 标志不正确

## 解决方案

### 1. 统一 Cookie 配置

确保两个系统使用相同的 cookie 配置：

**博客系统 (blog-system/src/lib/supabase/client.ts):**
```typescript
// 生产环境使用跨域 cookie
domain=.familybank.chat
SameSite=Lax
Secure
```

**家庭系统 (family-points-bank/supabaseClient.ts):**
```typescript
// 生产环境使用跨域 cookie
domain=.familybank.chat
SameSite=Lax
Secure
```

### 2. 环境检测

代码已添加环境检测：
- **生产环境** (`*.familybank.chat`) → 使用跨域 cookie
- **本地开发** (`localhost`) → 使用默认存储

### 3. 清除旧 Session

如果错误持续，需要清除旧的 session：

```bash
# 1. 清除浏览器 Cookie
# 开发者工具 → Application → Cookies → 删除所有 sb- 开头的 cookie

# 2. 清除 localStorage (如果有)
localStorage.clear()

# 3. 重新登录
```

### 4. Supabase Dashboard 配置

确保 Supabase 项目配置正确：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → Authentication → URL Configuration
3. 添加以下 URL：

**Site URL:**
```
https://www.familybank.chat
```

**Redirect URLs:**
```
https://www.familybank.chat/**
https://blog.familybank.chat/**
```

**Additional Redirect URLs:**
```
https://www.familybank.chat/auth/callback
https://blog.familybank.chat/auth/callback
```

### 5. 检查 Cookie

在浏览器开发者工具中检查 cookie：

**正确的 Cookie 应该是：**
```
Name: sb-mfgfbwhznqpdjumtsrus-auth-token
Value: base64-encoded-json
Domain: .familybank.chat
Path: /
Secure: ✓
HttpOnly: ✗
SameSite: Lax
```

**如果 Domain 不是 `.familybank.chat`，说明跨域配置没有生效。**

## 测试步骤

### 本地开发测试

1. **清除所有 Cookie 和缓存**
2. **在家庭系统登录**
   ```
   http://localhost:3000
   ```
3. **在博客系统登录**
   ```
   http://localhost:3001
   ```
4. **本地开发时，两个系统需要分别登录**

### 生产环境测试

1. **清除所有 Cookie 和缓存**
2. **在家庭系统登录**
   ```
   https://www.familybank.chat/
   ```
3. **访问博客系统**
   ```
   https://blog.familybank.chat/
   ```
4. **应该自动登录（跨域 session 共享）**

## 常见问题

### Q: 为什么本地开发时出现 session_not_found？

**A:** 本地开发时，跨域 cookie 不工作。需要在每个系统单独登录。

### Q: 生产环境还是出现 session_not_found？

**A:** 检查：
1. Cookie 的 domain 是否为 `.familybank.chat`
2. 是否使用 HTTPS（Secure flag 要求）
3. Supabase Dashboard 的 Redirect URLs 是否配置正确
4. 清除浏览器缓存后重试

### Q: Cookie 的 domain 不是 .familybank.chat？

**A:** 检查：
1. `NODE_ENV` 是否为 `production`
2. `window.location.hostname` 是否包含 `familybank.chat`
3. 代码中的环境检测逻辑是否正确

### Q: 如何强制刷新 Session？

**A:** 
```typescript
// 在任一系统中执行
await supabase.auth.refreshSession()
```

## 调试技巧

### 1. 查看 Cookie 值

```javascript
// 在浏览器控制台执行
document.cookie.split('; ').filter(c => c.startsWith('sb-'))
```

### 2. 检查 Session

```javascript
// 在浏览器控制台执行
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session)
console.log('Error:', error)
```

### 3. 查看 User

```javascript
// 在浏览器控制台执行
const { data, error } = await supabase.auth.getUser()
console.log('User:', data.user)
console.log('Error:', error)
```

### 4. 检查环境

```javascript
// 在浏览器控制台执行
console.log('Hostname:', window.location.hostname)
console.log('Is Production:', window.location.hostname.includes('familybank.chat'))
```

## 预防措施

### 1. 定期刷新 Session

```typescript
// 每小时刷新一次 session
setInterval(async () => {
  await supabase.auth.refreshSession()
}, 60 * 60 * 1000)
```

### 2. 监听 Auth 状态变化

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  if (event === 'SIGNED_OUT') {
    // 清除本地状态
  }
  if (event === 'TOKEN_REFRESHED') {
    // Session 已刷新
  }
})
```

### 3. 错误处理

```typescript
try {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    if (error.message.includes('session_not_found')) {
      // 重定向到登录页
      window.location.href = '/auth/login'
    }
  }
} catch (err) {
  console.error('Auth error:', err)
}
```

## 成功标志

当一切正常时：

1. ✅ Cookie domain 为 `.familybank.chat`
2. ✅ 在家庭系统登录后，博客系统自动登录
3. ✅ 不出现 `session_not_found` 错误
4. ✅ 用户信息正确显示
5. ✅ 可以访问受保护的页面

## 相关文档

- [跨域 Session 配置](./CROSS_DOMAIN_SESSION.md)
- [Session 故障排查](./SESSION_TROUBLESHOOTING.md)
- [部署指南](./VERCEL_DEPLOYMENT.md)
