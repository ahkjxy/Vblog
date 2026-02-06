# 修复后台文章列表显示问题

## 问题描述
发布的文章在后台管理页面没有显示。

## 已修复的问题

### 1. 字段名称错误
**问题**: 文章列表页面查询使用了 `profiles(username)`，但 profiles 表没有 `username` 字段。

**修复**: 
```typescript
// 修复前
.select('*, profiles(username)')

// 修复后
.select('*, profiles(name)')
```

**文件**: `blog-system/src/app/dashboard/posts/page.tsx`

### 2. 条件判断逻辑错误
**问题**: 空状态显示的条件判断有语法错误。

**修复**:
```typescript
// 修复前
{!posts || posts.length === 0 && (

// 修复后
{(!posts || posts.length === 0) && (
```

## 排查步骤

如果文章仍然不显示，请按以下步骤排查：

### 1. 检查数据库中是否有文章
在 Supabase SQL Editor 中运行：
```sql
SELECT id, title, status, author_id, created_at 
FROM posts 
ORDER BY created_at DESC;
```

### 2. 检查 RLS 策略
运行调试脚本：
```bash
# 在 Supabase SQL Editor 中运行
blog-system/supabase/debug-posts.sql
```

### 3. 检查作者信息
确保文章的 `author_id` 对应的 profile 存在：
```sql
SELECT 
  p.id,
  p.title,
  p.author_id,
  pr.name as author_name
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id;
```

### 4. 检查用户权限
确保当前登录用户有权限查看文章：
```sql
-- 查看当前用户
SELECT auth.uid() as current_user_id;

-- 查看用户的 profile
SELECT * FROM profiles WHERE id = auth.uid();
```

## RLS 策略说明

posts 表应该有以下 RLS 策略：

### SELECT 策略
- **已发布文章**: 所有人可见
- **草稿**: 只有作者和管理员可见

```sql
-- 查看已发布的文章（公开）
CREATE POLICY "Anyone can view published posts"
ON posts FOR SELECT
USING (status = 'published');

-- 查看自己的文章
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
USING (auth.uid() = author_id);

-- 管理员可以查看所有文章
CREATE POLICY "Admins can view all posts"
ON posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## 常见问题

### Q: 文章列表为空
**A**: 
1. 检查是否真的有文章数据
2. 检查 RLS 策略是否正确
3. 检查用户是否已登录
4. 检查浏览器控制台是否有错误

### Q: 作者名称显示为空
**A**: 
1. 确保 profiles 表中有对应的记录
2. 确保使用的是 `name` 字段而不是 `username`
3. 检查 author_id 是否正确

### Q: 只能看到自己的文章
**A**: 
1. 检查用户角色是否为 admin
2. 检查 RLS 策略是否包含管理员查看所有文章的规则

## 相关文件
- `blog-system/src/app/dashboard/posts/page.tsx` - 文章列表页面
- `blog-system/supabase/debug-posts.sql` - 调试 SQL 脚本
- `blog-system/supabase/migration-add-rls-policies.sql` - RLS 策略迁移文件
