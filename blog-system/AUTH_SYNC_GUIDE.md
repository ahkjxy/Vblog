# 跨域登录状态同步指南

## 概述

Blog 系统（blog.familybank.chat）和家庭积分系统（www.familybank.chat）共享同一个 Supabase 数据库，并通过跨子域 Cookie 实现登录状态同步。

## 已实现的配置

### 1. Blog 系统（Next.js）

**客户端配置** (`blog-system/src/lib/supabase/client.ts`):
- 使用统一的 `storageKey: 'sb-auth-token'`
- 生产环境下设置 `domain=.familybank.chat` 的 Cookie
- Cookie 有效期：1年（max-age=31536000）
- 使用 `SameSite=Lax; Secure` 确保安全性

**服务端配置** (`blog-system/src/lib/supabase/server.ts`):
- 使用 Next.js cookies API 读取和设置 Cookie
- 自动处理跨域 Cookie

### 2. 家庭积分系统（Vite + React）

**配置** (`family-points-bank/supabaseClient.ts`):
- 使用统一的 `storageKey: 'sb-auth-token'`
- 生产环境下设置 `domain=.familybank.chat` 的 Cookie
- Cookie 有效期：1年（max-age=31536000）
- 使用 `SameSite=Lax; Secure` 确保安全性

## 工作原理

1. **用户在任一系统登录**
   - Supabase 认证成功后，将 token 存储在 Cookie 中
   - Cookie 设置为 `domain=.familybank.chat`，可被所有子域访问

2. **跨域访问**
   - 用户访问另一个系统时，浏览器自动发送共享的 Cookie
   - Supabase 客户端读取 Cookie 中的 token
   - 自动恢复登录状态

3. **登出同步**
   - 在任一系统登出时，Cookie 被删除
   - 由于使用相同的 domain，两个系统的登录状态都会失效

## 验证步骤

### 本地开发测试

本地开发时，两个系统使用不同的端口（localhost:3000 和 localhost:5173），Cookie 无法跨域共享。这是正常的，只需在生产环境测试。

### 生产环境测试

1. **部署到生产环境**
   - Blog 系统：blog.familybank.chat
   - 家庭积分系统：www.familybank.chat

2. **测试登录同步**
   ```
   步骤 1: 在 blog.familybank.chat 登录
   步骤 2: 打开 www.familybank.chat
   步骤 3: 验证是否自动登录
   ```

3. **测试登出同步**
   ```
   步骤 1: 在 www.familybank.chat 登出
   步骤 2: 刷新 blog.familybank.chat
   步骤 3: 验证是否已登出
   ```

4. **检查 Cookie**
   - 打开浏览器开发者工具 → Application → Cookies
   - 查找 `sb-auth-token` Cookie
   - 验证 Domain 是否为 `.familybank.chat`

## 常见问题

### Q: 为什么本地开发时登录状态不同步？

A: 本地开发使用 localhost，不同端口被视为不同域，Cookie 无法共享。这是正常的，只在生产环境才能实现跨域同步。

### Q: 生产环境登录状态仍不同步怎么办？

A: 检查以下几点：
1. 确认两个系统都已部署到 familybank.chat 的子域
2. 确认 HTTPS 已启用（Secure Cookie 需要）
3. 检查浏览器 Cookie 设置，确保允许第三方 Cookie
4. 清除浏览器 Cookie 后重新测试

### Q: 如何强制刷新登录状态？

A: 在任一系统调用：
```typescript
const supabase = createClient()
await supabase.auth.refreshSession()
```

## 安全注意事项

1. **Cookie 安全性**
   - 使用 `Secure` 标志，仅通过 HTTPS 传输
   - 使用 `SameSite=Lax` 防止 CSRF 攻击
   - Cookie 有效期设置为 1 年，平衡安全性和用户体验

2. **Token 刷新**
   - Supabase 会自动刷新过期的 token
   - 如果 refresh token 也过期，用户需要重新登录

3. **跨域限制**
   - 只有 `.familybank.chat` 下的子域可以访问 Cookie
   - 其他域名无法访问认证信息

## 维护建议

1. **定期测试**
   - 每次部署后测试登录同步功能
   - 在不同浏览器中测试

2. **监控日志**
   - 监控 Supabase 认证错误
   - 关注用户登录/登出行为

3. **更新依赖**
   - 保持 @supabase/ssr 和 @supabase/supabase-js 版本同步
   - 关注 Supabase 官方更新

## 相关文件

- `blog-system/src/lib/supabase/client.ts` - Blog 客户端配置
- `blog-system/src/lib/supabase/server.ts` - Blog 服务端配置
- `family-points-bank/supabaseClient.ts` - 家庭积分系统配置
- `blog-system/.env.local` - Blog 环境变量
- `family-points-bank/.env` - 家庭积分系统环境变量
