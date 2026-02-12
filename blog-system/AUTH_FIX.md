# 认证问题修复

## 问题描述
用户明明已经登录，但系统还是要求重新登录。

## 问题原因

1. **服务端和客户端状态不同步**
   - 在服务端渲染时，`useSupabaseUser()` 可能还没有加载完成
   - 中间件在检查 `user.value` 时返回 `null`，导致重定向到登录页

2. **Supabase 模块自动重定向**
   - `@nuxtjs/supabase` 模块的 `redirectOptions` 配置可能导致自动重定向
   - Cookie 配置不当可能导致认证状态丢失

## 解决方案

### 1. 创建统一的认证 Composable

创建 `composables/useAuth.ts`，提供统一的认证检查方法：

```typescript
export const useAuth = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // 检查用户是否已登录（同时支持服务端和客户端）
  const checkAuth = async () => {
    if (process.server) {
      const { data: { session } } = await client.auth.getSession()
      return !!session
    }
    return !!user.value
  }

  // 获取当前用户 ID
  const getUserId = async () => {
    if (user.value?.id) return user.value.id
    const { data: { session } } = await client.auth.getSession()
    return session?.user.id || null
  }

  // 其他方法...
}
```

### 2. 更新认证中间件

使用新的 `useAuth` composable：

```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth, getUserProfile } = useAuth()

  // 检查是否已登录
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return navigateTo('/auth/unified')
  }

  // 获取用户 profile
  const profile = await getUserProfile()
  if (!profile) {
    return navigateTo('/auth/unified')
  }

  // 权限检查...
})
```

### 3. 优化 Supabase 配置

在 `nuxt.config.ts` 中：

```typescript
supabase: {
  redirectOptions: {
    login: '/auth/unified',
    callback: '/auth/callback',
    exclude: [
      '/', 
      '/blog', '/blog/*', 
      '/categories', '/categories/*', 
      '/tags', '/tags/*', 
      '/about', '/contact', '/changelog', 
      '/docs', '/api', '/privacy', 
      '/support', '/terms', '/disclaimer'
    ],
    cookieRedirect: false, // 禁用自动 cookie 重定向
  },
  cookieOptions: {
    domain: process.env.NODE_ENV === 'production' ? '.familybank.chat' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 31536000,
  }
}
```

## 关键改进

1. **统一认证检查**
   - 服务端使用 `getSession()` 直接获取 session
   - 客户端使用 `useSupabaseUser()` 获取用户状态
   - 避免在服务端依赖可能未初始化的 `user.value`

2. **禁用自动重定向**
   - 设置 `cookieRedirect: false`
   - 让中间件完全控制重定向逻辑

3. **完善的 exclude 列表**
   - 添加所有公开页面到 exclude 列表
   - 确保公开页面不会触发认证检查

4. **Cookie 配置优化**
   - 移除 `name` 配置（使用默认值）
   - 移除 `httpOnly: false`（使用默认值）
   - 保持跨域支持（`.familybank.chat`）

## 测试步骤

1. 清除浏览器 Cookie 和缓存
2. 访问 `/auth/unified` 登录
3. 登录成功后访问 `/dashboard`
4. 刷新页面，确认不会被重定向到登录页
5. 访问公开页面（如 `/blog`），确认可以正常访问
6. 再次访问 `/dashboard`，确认仍然保持登录状态

## 注意事项

1. **开发环境**
   - Cookie domain 设置为 `undefined`（仅当前域名）
   - 不需要 HTTPS

2. **生产环境**
   - Cookie domain 设置为 `.familybank.chat`（支持子域名）
   - 需要 HTTPS（`secure: true`）

3. **Session 持久化**
   - `maxAge: 31536000`（1年）
   - 用户登录后长期保持登录状态

## 相关文件

- `composables/useAuth.ts` - 认证 composable
- `middleware/auth.ts` - 认证中间件
- `nuxt.config.ts` - Nuxt 配置
- `layouts/dashboard.vue` - Dashboard 布局
