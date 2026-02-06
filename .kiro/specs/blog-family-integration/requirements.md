# Blog System 与 Family Points Bank 整合需求文档

## 项目概述

将 blog-system 整合到 family-points-bank 项目中，共享同一个 Supabase 数据库实例，实现统一的用户认证和数据管理。任何 family-points-bank 用户都可以登录 blog-system，新用户也可以直接在 blog 注册。

## 核心目标

1. **共享数据库**: blog-system 使用 family-points-bank 的 Supabase 实例
2. **共享用户系统**: 两个系统使用同一套用户认证和 profiles 表
3. **统一认证页面**: blog 使用一个页面处理登录和注册（类似 family-points-bank 的 AuthGate）
4. **数据迁移**: 将 blog-system 的所有表结构迁移到 family-points-bank 数据库
5. **跨系统导航**: 实现两个系统之间的无缝跳转

## Family Points Bank 配置信息

### Supabase 配置
```
URL: https://mfgfbwhznqpdjumtsrus.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ2Zid2h6bnFwZGp1bXRzcnVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcxODUxNiwiZXhwIjoyMDgyMjk0NTE2fQ.3yY6yPL3sJEgJlERYKPiJcXkyixKlc3oz-rFAMbkD9A
Anon Key: sb_publishable_2pDY4atjEw5MVSWeakl4HA_exf_osvS
```

### Family Points Bank URL
```
Production: https://fpb-omega.vercel.app/
或: https://www.familybank.chat
```

## 需求详细说明

### 需求 1: 数据库整合

**用户故事**: 作为系统管理员，我需要将 blog-system 的所有表迁移到 family-points-bank 数据库，以便两个系统共享同一个数据源。

#### 验收标准

1.1 THE blog-system SHALL 使用 family-points-bank 的 Supabase URL 和密钥
1.2 THE 数据库迁移 SQL SHALL 包含以下表的创建：
   - posts（文章表）
   - categories（分类表）
   - tags（标签表）
   - post_categories（文章分类关联表）
   - post_tags（文章标签关联表）
   - comments（评论表）
   - settings（设置表）
1.3 THE 迁移 SQL SHALL 检查表是否已存在，避免重复创建
1.4 THE 迁移 SQL SHALL 包含所有必要的索引
1.5 THE 迁移 SQL SHALL 包含所有 RLS 策略
1.6 THE 迁移 SQL SHALL 不影响 family-points-bank 现有的表和数据

### 需求 2: Profiles 表整合

**用户故事**: 作为系统架构师，我需要整合两个系统的 profiles 表，确保用户数据在两个系统间共享。

#### 验收标准

2.1 THE profiles 表 SHALL 合并两个系统的字段需求
2.2 THE profiles 表 SHALL 包含以下字段：
   ```sql
   - id UUID (主键，引用 auth.users)
   - username TEXT (用户名)
   - email TEXT (邮箱)
   - bio TEXT (个人简介 - blog 使用)
   - avatar_url TEXT (头像)
   - role TEXT (角色: admin/editor/author - blog 使用)
   - family_id UUID (家庭ID - family-points-bank 使用)
   - balance INTEGER (积分余额 - family-points-bank 使用)
   - level INTEGER (等级 - family-points-bank 使用)
   - experience INTEGER (经验值 - family-points-bank 使用)
   - name TEXT (显示名称 - family-points-bank 使用)
   - created_at TIMESTAMPTZ
   - updated_at TIMESTAMPTZ
   ```
2.3 THE 迁移 SQL SHALL 使用 ALTER TABLE 添加缺失的字段
2.4 THE 迁移 SQL SHALL 保留 family-points-bank 现有的 profiles 数据
2.5 THE blog-system SHALL 允许任何已认证用户访问
2.6 WHEN 新用户在 blog 注册时 THEN 系统 SHALL 自动创建 profile 记录

### 需求 3: 统一认证页面

**用户故事**: 作为用户，我希望在一个页面完成登录或注册，系统自动判断我是登录还是注册。

#### 验收标准

3.1 THE blog-system SHALL 使用单一认证页面 `/auth`
3.2 THE 认证页面 SHALL 支持邮箱+密码登录和魔法链接两种模式
3.3 WHEN 用户输入邮箱密码并提交 THEN 系统 SHALL 先尝试登录
3.4 WHEN 登录失败（Invalid credentials）THEN 系统 SHALL 自动尝试注册
3.5 WHEN 注册失败（User already registered）THEN 系统 SHALL 提示密码错误
3.6 WHEN 登录或注册成功 THEN 系统 SHALL 跳转到 /dashboard
3.7 THE 认证页面 SHALL 提供"忘记密码"功能
3.8 THE 认证页面 SHALL 使用与 family-points-bank 相同的设计风格
3.9 THE blog-system SHALL 移除所有 Google OAuth 登录功能
3.10 THE 旧的 `/auth/login` 和 `/auth/signup` 页面 SHALL 重定向到 `/auth`

### 需求 4: 环境变量配置

**用户故事**: 作为开发者，我需要更新 blog-system 的环境变量，以便连接到 family-points-bank 的 Supabase。

#### 验收标准

4.1 THE blog-system/.env.local SHALL 包含以下配置：
   ```env
   # Supabase 配置（使用 family-points-bank 的）
   NEXT_PUBLIC_SUPABASE_URL=https://mfgfbwhznqpdjumtsrus.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_2pDY4atjEw5MVSWeakl4HA_exf_osvS
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZ2Zid2h6bnFwZGp1bXRzcnVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjcxODUxNiwiZXhwIjoyMDgyMjk0NTE2fQ.3yY6yPL3sJEgJlERYKPiJcXkyixKlc3oz-rFAMbkD9A
   
   # Family Points Bank URL
   NEXT_PUBLIC_FAMILY_BANK_URL=https://fpb-omega.vercel.app
   
   # Blog System URL
   NEXT_PUBLIC_SITE_URL=https://blog.familybank.chat
   ```
4.2 THE 环境变量 SHALL 在部署前验证
4.3 THE .env.local.example SHALL 更新为新的配置模板

### 需求 5: "试用"按钮跳转

**用户故事**: 作为访客，当我在 blog-system 点击"试用"按钮时，我希望跳转到 family-points-bank 体验产品。

#### 验收标准

5.1 THE FamilyBankCTA 组件的"免费试用"按钮 SHALL 跳转到 family-points-bank
5.2 WHEN 用户未登录 THEN 按钮 SHALL 跳转到：
   ```
   https://fpb-omega.vercel.app/
   ```
5.3 WHEN 用户已登录 THEN 按钮 SHALL 跳转到：
   ```
   https://fpb-omega.vercel.app/dashboard
   ```
5.4 THE 所有页面的"试用"相关按钮 SHALL 使用统一的跳转逻辑
5.5 THE 跳转 SHALL 在新标签页打开（可选）

### 需求 6: Header 导航更新

**用户故事**: 作为用户，我希望在 blog-system 的 Header 中看到 family-points-bank 的入口。

#### 验收标准

6.1 THE Header 组件 SHALL 添加"元气银行"导航链接
6.2 THE "元气银行"链接 SHALL 跳转到 family-points-bank 首页
6.3 WHEN 用户已登录 THEN Header SHALL 显示用户信息
6.4 THE 用户下拉菜单 SHALL 包含以下选项：
   - 进入 Blog 后台
   - 进入元气银行后台
   - 个人设置
   - 退出登录
6.5 THE Header SHALL 显示用户的头像和用户名
6.6 THE Header SHALL 在移动端自适应显示

### 需求 7: 数据迁移 SQL 脚本

**用户故事**: 作为数据库管理员，我需要一个完整的 SQL 脚本来迁移 blog-system 的表结构。

#### 验收标准

7.1 THE 迁移脚本 SHALL 命名为 `migration.sql`
7.2 THE 脚本 SHALL 包含以下部分：
   - 扩展 profiles 表（添加 blog 相关字段）
   - 创建 blog 相关表
   - 创建索引
   - 创建 RLS 策略
   - 创建触发器和函数
7.3 THE 脚本 SHALL 使用 `IF NOT EXISTS` 避免重复创建
7.4 THE 脚本 SHALL 使用 `ALTER TABLE ADD COLUMN IF NOT EXISTS` 安全添加字段
7.5 THE 脚本 SHALL 包含注释说明每个部分的作用
7.6 THE 脚本 SHALL 可以安全地多次执行（幂等性）
7.7 THE 脚本 SHALL 创建自动创建 profile 的触发器

### 需求 8: Storage 配置

**用户故事**: 作为内容管理员，我需要在 family-points-bank 的 Supabase Storage 中创建 blog 媒体存储桶。

#### 验收标准

8.1 THE Supabase Storage SHALL 创建名为 `blog-media` 的 bucket
8.2 THE blog-media bucket SHALL 配置为公开访问
8.3 THE blog-media bucket SHALL 限制文件大小为 5MB
8.4 THE blog-media bucket SHALL 只允许图片格式（JPEG, PNG, GIF, WebP）
8.5 THE blog-media bucket SHALL 配置 RLS 策略：
   - 所有人可以读取
   - 已认证用户可以上传
   - 用户只能删除自己上传的文件
8.6 THE 迁移脚本 SHALL 包含 Storage 策略的 SQL

### 需求 9: OAuth 功能移除

**用户故事**: 作为开发者，我需要移除所有 Google OAuth 相关的代码和配置。

#### 验收标准

9.1 THE blog-system SHALL 移除所有 Google OAuth 登录按钮
9.2 THE blog-system SHALL 移除 OAuth 回调处理代码
9.3 THE blog-system SHALL 移除 Supabase OAuth 配置
9.4 THE 认证页面 SHALL 只显示邮箱密码登录和魔法链接
9.5 THE 代码 SHALL 移除所有 OAuth provider 相关的导入和调用

### 需求 10: Middleware 简化

**用户故事**: 作为开发者，我需要简化 middleware，移除不必要的权限检查。

#### 验收标准

10.1 THE middleware SHALL 只检查用户是否已登录
10.2 THE middleware SHALL 不检查用户角色或权限
10.3 WHEN 用户未登录访问 /dashboard THEN 重定向到 /auth
10.4 WHEN 用户已登录 THEN 允许访问所有页面

## 技术实现细节

### 1. Profiles 表扩展 SQL

```sql
-- 扩展 profiles 表以支持 blog-system
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author'));

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 创建函数：自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'author'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 2. Blog 表迁移 SQL

```sql
-- 创建 posts 表
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB,
  excerpt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 categories 表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 tags 表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建关联表
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 创建 comments 表
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 settings 表
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 统一认证页面实现

```typescript
// blog-system/src/app/auth/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // 1. 尝试登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
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
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: email.split('@')[0],
          }
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

    } catch (err) {
      showToast('error', (err as Error)?.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }
  
  // ... 魔法链接和重置密码逻辑
}
```

### 4. Middleware 简化实现

```typescript
// blog-system/src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 刷新 session
  const { data: { user } } = await supabase.auth.getUser()

  // 保护 dashboard 路由 - 只检查是否登录
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
```

## 部署步骤

### 阶段 1: 数据库迁移（优先）

1. 备份 family-points-bank 的 Supabase 数据库
2. 在 Supabase SQL Editor 中执行 `migration.sql`
3. 验证所有表和策略创建成功
4. 创建 `blog-media` Storage bucket
5. 配置 Storage RLS 策略

### 阶段 2: 环境配置

1. 更新 blog-system/.env.local 使用 family-points-bank 的 Supabase 配置
2. 添加 NEXT_PUBLIC_FAMILY_BANK_URL 环境变量
3. 验证环境变量配置正确
4. 测试 Supabase 连接

### 阶段 3: 代码更新

1. 创建统一认证页面 `/auth`
2. 更新旧的登录/注册页面重定向到 `/auth`
3. 更新 FamilyBankCTA 组件
4. 更新 Header 组件添加导航链接
5. 简化 Middleware
6. 测试所有跳转链接

### 阶段 4: 测试

1. 测试用户登录流程
2. 测试新用户注册流程
3. 测试登录失败自动注册
4. 测试跨系统跳转
5. 测试文章创建和发布
6. 测试媒体上传
7. 测试评论功能

### 阶段 5: 部署

1. 部署 blog-system 到生产环境
2. 配置域名 blog.familybank.chat
3. 验证生产环境功能
4. 监控错误日志

## 风险和注意事项

### 1. 数据冲突
- **风险**: profiles 表字段冲突
- **缓解**: 使用 ALTER TABLE ADD COLUMN IF NOT EXISTS

### 2. RLS 策略冲突
- **风险**: 新旧策略可能冲突
- **缓解**: 使用唯一的策略名称，先删除再创建

### 3. Session 共享
- **风险**: 跨域 Session 可能失效
- **缓解**: 确保使用相同的 Supabase 实例

### 4. 性能影响
- **风险**: 共享数据库可能影响性能
- **缓解**: 添加适当的索引，监控查询性能

## 成功标准

1. ✅ blog-system 成功连接到 family-points-bank 的 Supabase
2. ✅ 任何用户可以在 blog 登录或注册
3. ✅ 登录失败自动尝试注册
4. ✅ 所有"试用"按钮正确跳转到 family-points-bank
5. ✅ blog-system 的所有功能正常工作
6. ✅ 数据库迁移不影响 family-points-bank 现有功能
7. ✅ 跨系统导航流畅无缝
8. ✅ 所有 OAuth 功能已移除
