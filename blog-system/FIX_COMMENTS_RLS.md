# 修复评论 RLS 策略

## 问题
评论提交时出现错误：`new row violates row-level security policy for table "comments"`

这是因为 `comments` 表启用了 Row Level Security (RLS)，但没有配置允许插入评论的策略。

## 解决方案

### 在 Supabase Dashboard 中执行

1. **登录 Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 在左侧菜单找到 "SQL Editor"
   - 点击 "New query"

3. **执行以下 SQL**

```sql
-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view approved comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Anonymous users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON comments;
DROP POLICY IF EXISTS "Admins can update any comment" ON comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON comments;
DROP POLICY IF EXISTS "Users can delete own pending comments" ON comments;

-- Policy 1: Anyone can view approved comments (public read)
CREATE POLICY "Anyone can view approved comments"
ON comments
FOR SELECT
USING (status = 'approved');

-- Policy 2: Authenticated users can insert comments with their user_id
CREATE POLICY "Authenticated users can insert comments"
ON comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Anonymous users can insert comments (without user_id)
CREATE POLICY "Anonymous users can insert comments"
ON comments
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL 
  AND author_name IS NOT NULL 
  AND author_email IS NOT NULL
);

-- Policy 4: Users can update their own pending comments
CREATE POLICY "Users can update own comments"
ON comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Admins and editors can view all comments
CREATE POLICY "Admins can view all comments"
ON comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Policy 6: Admins and editors can update any comment
CREATE POLICY "Admins can update any comment"
ON comments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Policy 7: Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
ON comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 8: Users can delete their own pending comments
CREATE POLICY "Users can delete own pending comments"
ON comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');
```

4. **点击 Run 按钮**

## RLS 策略说明

### 读取权限 (SELECT)
1. **公开访问**: 所有人可以查看已批准的评论
2. **管理员访问**: 管理员和编辑可以查看所有评论（包括待审核的）

### 插入权限 (INSERT)
1. **已登录用户**: 可以插入评论，`user_id` 必须是自己的 ID
2. **匿名用户**: 可以插入评论，但必须提供 `author_name` 和 `author_email`，且 `user_id` 必须为 NULL

### 更新权限 (UPDATE)
1. **用户**: 只能更新自己的待审核评论
2. **管理员/编辑**: 可以更新任何评论（用于审核）

### 删除权限 (DELETE)
1. **用户**: 只能删除自己的待审核评论
2. **管理员**: 可以删除任何评论

## 验证

执行以下 SQL 验证策略已创建：

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'comments'
ORDER BY policyname;
```

应该看到 8 条策略记录。

## 测试

### 测试匿名评论
1. 退出登录状态
2. 访问任意文章页面
3. 填写姓名、邮箱和评论内容
4. 提交评论
5. 应该显示"评论已提交，等待审核后显示"

### 测试已登录用户评论
1. 登录账号
2. 访问任意文章页面
3. 填写评论内容（不需要填写姓名和邮箱）
4. 提交评论
5. 应该显示"评论已提交，等待审核后显示"

### 测试管理员审核
1. 以管理员身份登录
2. 访问 `/dashboard/comments`
3. 应该能看到所有待审核的评论
4. 可以批准或拒绝评论

## 注意事项

1. **匿名评论安全性**: 匿名用户必须提供姓名和邮箱，防止垃圾评论
2. **审核机制**: 所有新评论默认状态为 `pending`，需要管理员审核
3. **权限分离**: 普通用户只能管理自己的评论，管理员可以管理所有评论
4. **数据完整性**: RLS 策略确保 `user_id` 和 `author_name/email` 的正确性

## 故障排查

如果仍然无法提交评论：

1. **检查 RLS 是否启用**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'comments';
   ```

2. **检查策略是否存在**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'comments';
   ```

3. **检查 API 密钥**
   - 确保使用的是 `anon` key（公开密钥）
   - 不要使用 `service_role` key（服务端密钥）

4. **查看详细错误**
   - 打开浏览器开发者工具
   - 查看 Network 标签中的请求详情
   - 检查返回的错误信息
