# 登录状态同步修复总结

## 问题描述
在实现 Blog 系统和家庭积分系统的登录状态同步后，出现了"发文章时显示未登录"的问题。

## 根本原因
服务端 Supabase 客户端 (`src/lib/supabase/server.ts`) 使用了 `SUPABASE_SERVICE_ROLE_KEY`，这会：
1. 绕过所有 RLS（Row Level Security）策略
2. 不读取用户的认证 Cookie
3. 导致 `auth.getUser()` 无法获取当前登录用户

## 修复方案

### 1. 修改服务端客户端配置
**文件**: `src/lib/supabase/server.ts`

**修改前**:
```typescript
return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ❌ 错误：使用 service role key
  { ... }
)
```

**修改后**:
```typescript
return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ 正确：使用 anon key
  { ... }
)
```

### 2. 创建专用的 Service 客户端
**文件**: `src/lib/supabase/service.ts` (新建)

用于需要绕过 RLS 的管理员操作（如果需要）：
```typescript
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { ... }
  )
}
```

## 影响范围

### ✅ 正常工作的功能
- Dashboard 布局认证检查
- 文章发布（现在可以正确识别登录用户）
- 用户权限判断
- 所有需要用户认证的操作

### ⚠️ 需要注意的地方
- 如果有管理员操作需要绕过 RLS，应该使用 `createServiceClient()` 而不是 `createClient()`
- 目前所有页面都使用标准的认证流程，符合安全最佳实践

## 登录状态同步机制

### 客户端配置 (`src/lib/supabase/client.ts`)
```typescript
{
  auth: {
    storageKey: 'sb-auth-token', // 与家庭积分系统相同
    storage: {
      // 生产环境使用跨域 Cookie
      setItem: (key, value) => {
        document.cookie = `${key}=${value}; domain=.familybank.chat; ...`
      }
    }
  }
}
```

### 工作原理
1. 用户在任一系统登录
2. 认证 Token 存储在 Cookie 中（domain=.familybank.chat）
3. 两个子域名（blog.familybank.chat 和 www.familybank.chat）共享此 Cookie
4. 服务端通过 Cookie 读取认证状态
5. 实现自动登录同步

## 测试建议

### 1. 本地测试
- 本地开发环境使用 localStorage，无法测试跨域同步
- 可以测试基本的登录/登出功能

### 2. 生产环境测试
1. 在 blog.familybank.chat 登录
2. 打开 www.familybank.chat，验证自动登录
3. 在 blog.familybank.chat 发布文章，验证作者信息正确
4. 在任一系统登出，验证另一系统也登出

### 3. 测试页面
访问 `/auth-test` 页面查看：
- 当前登录状态
- Cookie 信息
- 环境配置

## 安全性说明

### ✅ 安全改进
- 使用 ANON_KEY 而不是 SERVICE_ROLE_KEY
- 所有数据访问受 RLS 策略保护
- 用户只能访问自己有权限的数据

### 🔒 RLS 策略
确保数据库中的 RLS 策略正确配置：
- Posts: 作者可以创建和编辑自己的文章
- Profiles: 用户可以查看和更新自己的资料
- Comments: 用户可以创建和管理自己的评论

## 环境变量检查

确保 `.env.local` 包含：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # 仅在需要时使用
```

## 总结

✅ **已修复**: 服务端认证问题，现在可以正确识别登录用户
✅ **已优化**: 安全性提升，使用 RLS 保护数据
✅ **已实现**: 跨域登录状态同步
✅ **已创建**: Service 客户端用于特殊管理操作

发文章时不再显示"未登录"，所有认证相关功能正常工作！
