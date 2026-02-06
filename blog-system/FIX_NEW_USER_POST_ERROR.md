# 修复非管理员发文错误

## 问题描述

非管理员用户发文时出现三个错误：

1. **PGRST116 错误**: "Cannot coerce the result to a single JSON object" - 查询期望返回单个结果但返回了 0 行
2. **profiles_role_check 约束错误**: 新用户注册时，触发器尝试插入 `role='author'`，但数据库约束不允许该值
3. **posts_author_id_fkey 外键错误**: "Key is not present in table profiles" - 用户没有对应的 profile 记录

## 根本原因

1. **发文错误**: 在检查 slug 是否存在时使用了 `.single()`，当 slug 不存在时会抛出错误
2. **角色约束错误**: 博客系统和家庭积分银行共享同一个数据库，但 `profiles.role` 字段的 CHECK 约束只允许家庭积分银行的角色值（'admin', 'child'），不允许博客系统的角色值（'author', 'editor'）
3. **外键错误**: 用户在 auth.users 表中存在，但在 profiles 表中没有对应记录，导致无法创建文章（posts.author_id 外键约束失败）

## 解决方案

### 方案 A：一键修复（推荐）

**执行一个 SQL 文件即可完成所有修复**：

```sql
\i blog-system/supabase/FIX_ALL_USER_ISSUES.sql
```

这个脚本会自动：
1. 修复 role 字段的约束（允许 'admin', 'child', 'author', 'editor'）
2. 为所有没有 profile 的用户创建 profile
3. 更新自动注册触发器
4. 显示详细的执行结果和验证信息

### 方案 B：分步执行

如果需要分步执行，按以下顺序：

#### 1. 修复发文页面的 slug 检查

**文件**: `blog-system/src/app/dashboard/posts/new/page.tsx`

将 `.single()` 改为 `.maybeSingle()`，这样当 slug 不存在时不会抛出错误：

```typescript
const { data: existingPost } = await supabase
  .from('posts')
  .select('id')
  .eq('slug', finalSlug)
  .maybeSingle()  // 改用 maybeSingle，因为可能不存在
```

#### 2. 修复 profiles 表的 role 约束

**SQL 文件**: `blog-system/supabase/CHECK_AND_FIX_ROLE_CONSTRAINT.sql`

这个脚本会：
- 删除旧的 `profiles_role_check` 约束
- 创建新的约束，允许 4 种角色：'admin', 'child', 'author', 'editor'

#### 3. 为所有用户创建 profile

**SQL 文件**: `blog-system/supabase/CHECK_USER_AND_CREATE_PROFILE.sql`

这个脚本会：
- 检查哪些用户没有 profile
- 为所有没有 profile 的用户创建记录
- 显示创建结果

#### 4. 更新自动注册触发器

**SQL 文件**: `blog-system/supabase/FIX_HANDLE_NEW_USER.sql`

更新后的触发器会：
- 使用正确的字段名（name 而不是 username）
- 设置 role='author'（博客作者）
- 生成随机头像 URL
- 添加错误处理

## 执行步骤

### 推荐方式：一键修复

在 Supabase SQL Editor 中执行：

```sql
-- 一键修复所有问题
\i blog-system/supabase/FIX_ALL_USER_ISSUES.sql
```

这个脚本会自动完成所有修复并显示详细的执行结果。

### 备选方式：分步执行

如果需要分步执行，在 Supabase SQL Editor 中按顺序执行：

```sql
-- 第一步：修复 role 约束
\i blog-system/supabase/CHECK_AND_FIX_ROLE_CONSTRAINT.sql

-- 第二步：为所有用户创建 profile
\i blog-system/supabase/CHECK_USER_AND_CREATE_PROFILE.sql

-- 第三步：更新触发器
\i blog-system/supabase/FIX_HANDLE_NEW_USER.sql
```

前端代码已自动修复（`.single()` → `.maybeSingle()`）。

## 验证

1. 注册一个新用户，检查是否自动创建了 profile
2. 用新用户登录后台，尝试发布一篇文章
3. 检查文章是否成功创建，review_status 应该是 'pending'（非超级管理员）

## 角色说明

修复后，profiles 表支持 4 种角色：

- **admin**: 管理员（家庭积分银行和博客系统共用）
- **child**: 孩子（家庭积分银行专用）
- **author**: 作者（博客系统专用，默认角色）
- **editor**: 编辑（博客系统专用）

超级管理员判断：`role='admin' AND family_id='79ed05a1-e0e5-4d8c-9a79-d8756c488171'`

## 相关文件

### 推荐使用（一键修复）
- `blog-system/supabase/FIX_ALL_USER_ISSUES.sql` - 一键修复所有问题

### 分步执行文件
- `blog-system/src/app/dashboard/posts/new/page.tsx` - 发文页面（已修复）
- `blog-system/supabase/CHECK_AND_FIX_ROLE_CONSTRAINT.sql` - 修复角色约束
- `blog-system/supabase/CHECK_USER_AND_CREATE_PROFILE.sql` - 为用户创建 profile
- `blog-system/supabase/FIX_HANDLE_NEW_USER.sql` - 更新自动注册触发器

### 诊断工具
- `blog-system/supabase/CHECK_PROFILES_CONSTRAINTS.sql` - 检查约束（诊断用）
