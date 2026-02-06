# Blog-Family 整合项目说明

## 📋 项目概述

将 blog-system 整合到 family-points-bank 项目中，实现：
- **共享数据库**: 使用 family-points-bank 的 Supabase 实例
- **共享用户**: 任何 family-points-bank 用户都可以登录 blog
- **统一认证**: blog 使用一个页面处理登录和注册（类似 family-points-bank 的 AuthGate）
- **移除 OAuth**: 完全移除 Google 登录功能

## 🎯 核心设计

### 用户模型

```
Family Points Bank 用户
├── 任何注册用户
│   └── ✅ 可以登录 Blog System
│       └── 使用相同的邮箱和密码
│       └── Blog 显示的数据与 Family 不同
└── 统一认证
    └── 一个页面处理登录和注册
    └── 先尝试登录，失败则自动注册
```

### 数据库结构

```sql
profiles 表（共享）
├── id (UUID) - 用户ID
├── email (TEXT) - 邮箱
├── username (TEXT) - 用户名
├── avatar_url (TEXT) - 头像
├── bio (TEXT) - 个人简介 [Blog 使用]
├── role (TEXT) - Blog 角色 [Blog 使用]
├── family_id (UUID) - 家庭ID [Family 使用]
├── balance (INTEGER) - 积分 [Family 使用]
└── ... 其他字段
```

### 认证流程

```
用户访问 Blog 登录页 (/auth)
    ↓
输入邮箱和密码，点击"一键登录"
    ↓
1. 先尝试登录 (signInWithPassword)
    ├── 成功 → 跳转 Dashboard
    └── 失败 (Invalid credentials)
        ↓
2. 尝试注册 (signUp)
    ├── 成功 → 自动登录 → 跳转 Dashboard
    └── 失败 (User already registered)
        → 说明密码错误 → 提示用户
```

## 📁 文档结构

```
.kiro/specs/blog-family-integration/
├── README.md                    # 本文件 - 项目说明
├── requirements.md              # 详细需求文档
├── migration.sql                # 数据库迁移脚本
└── implementation-tasks.md      # 实施任务清单
```

## 🚀 快速开始

### 1. 数据库迁移（第一步）

```bash
# 1. 备份 family-points-bank 数据库
# 在 Supabase Dashboard 执行备份

# 2. 执行迁移 SQL
# 在 Supabase SQL Editor 中打开并执行 migration.sql
```

### 2. 环境配置

```bash
# 更新 blog-system/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://mfgfbwhznqpdjumtsrus.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2pDY4atjEw5MVSWeakl4HA_exf_osvS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_FAMILY_BANK_URL=https://www.familybank.chat
NEXT_PUBLIC_SITE_URL=https://blog.familybank.chat
```

### 3. 代码更新

按照 `implementation-tasks.md` 中的任务清单逐步执行：

#### 阶段 3: 代码更新
- 更新登录页面（邮箱+密码）
- 移除所有 OAuth 代码
- 添加家庭管理员验证
- 更新 Header 和其他组件

#### 阶段 4: 权限控制
- 更新 Middleware
- 添加 is_family_admin 检查
- 实现访问控制

### 4. 测试

```bash
# 测试家庭管理员登录
1. 使用 family-points-bank 管理员邮箱登录
2. 验证登录成功并跳转到 dashboard

# 测试非管理员被拒绝
1. 使用非管理员邮箱尝试登录
2. 验证登录被拒绝并显示错误提示
```

## 🔑 关键实现

### 1. 统一认证页面

```typescript
// src/app/auth/page.tsx
const handlePasswordAuth = async (e) => {
  e.preventDefault()
  
  // 1. 先尝试登录
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email, password
  })
  
  if (!signInError && signInData?.session) {
    // 登录成功
    router.push('/dashboard')
    return
  }
  
  // 2. 如果是凭证错误，尝试注册
  const isCredentialError = signInError?.message === "Invalid login credentials"
  if (signInError && !isCredentialError) {
    // 其他错误直接提示
    showToast('error', signInError.message)
    return
  }
  
  // 3. 尝试注册
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email, password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { username: email.split('@')[0] }
    }
  })
  
  if (signUpError) {
    if (signUpError.message?.includes('User already registered')) {
      // 用户已存在，说明是密码错误
      showToast('error', '密码错误，如忘记密码请点击下方找回')
    } else {
      showToast('error', signUpError.message)
    }
  } else {
    // 注册成功
    if (signUpData?.session) {
      showToast('success', '注册并登录成功，欢迎加入元气银行博客!')
      router.push('/dashboard')
    } else {
      showToast('info', '注册成功！请前往邮箱验证链接以完成激活')
    }
  }
}
```

### 2. Middleware 保护

```typescript
// src/middleware.ts
export async function middleware(request) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect('/auth')
    }
    // 任何已认证用户都可以访问 dashboard
  }
  
  return response
}
```

### 3. 自动创建 Profile

```sql
-- 当新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## ⚠️ 重要注意事项

### 1. 用户权限
- ✅ 任何 family-points-bank 用户都可以登录 blog
- ✅ 新用户可以直接在 blog 注册（自动创建 family-points-bank 账号）
- ✅ 登录和注册在同一个页面完成

### 2. OAuth 移除
- ❌ 移除所有 Google OAuth 按钮
- ❌ 移除 OAuth 回调处理
- ❌ 移除 OAuth provider 配置
- ✅ 只保留邮箱+密码登录和魔法链接

### 3. 数据安全
- 在执行迁移前**必须备份**数据库
- 迁移 SQL 使用 `IF NOT EXISTS` 确保幂等性
- 使用 `ALTER TABLE ADD COLUMN IF NOT EXISTS` 安全添加字段

### 4. 测试要点
- 测试 family-points-bank 用户可以登录 blog
- 测试新用户可以在 blog 注册
- 测试登录失败自动尝试注册
- 测试所有 OAuth 功能已移除

## 📊 数据流图

```
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  auth.users (Supabase Auth)                        │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │ 1:1                                │
│  ┌──────────────────▼─────────────────────────────────┐ │
│  │  profiles (共享表)                                  │ │
│  │  - is_family_admin (关键字段)                      │ │
│  │  - role (blog 角色)                                │ │
│  │  - family_id (family 使用)                         │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│         ┌───────────┴───────────┐                       │
│         │                       │                       │
│  ┌──────▼──────┐         ┌─────▼──────┐               │
│  │ Blog Tables │         │ Family     │               │
│  │ - posts     │         │ Tables     │               │
│  │ - categories│         │ - families │               │
│  │ - tags      │         │ - members  │               │
│  │ - comments  │         │ - tasks    │               │
│  └─────────────┘         └────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## 🔗 相关链接

- **Family Points Bank**: https://www.familybank.chat
- **Blog System**: https://blog.familybank.chat (已部署)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/mfgfbwhznqpdjumtsrus

## 📞 支持

如有问题，请联系：
- 邮箱: ahkjxy@qq.com
- 网站: familybank.chat

## ✅ 检查清单

在开始实施前，请确认：

- [ ] 已阅读所有文档
- [ ] 已备份 family-points-bank 数据库
- [ ] 已准备好 Supabase 访问权限
- [ ] 已了解用户权限模型
- [ ] 已理解认证流程
- [ ] 准备好测试账号（管理员和非管理员）

在完成实施后，请验证：

- [ ] 数据库迁移成功
- [ ] 家庭管理员可以登录 blog
- [ ] 非管理员登录被拒绝
- [ ] 所有 OAuth 功能已移除
- [ ] Middleware 权限检查正常
- [ ] 所有测试通过
