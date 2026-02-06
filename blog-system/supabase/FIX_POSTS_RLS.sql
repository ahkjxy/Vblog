-- 修复文章的 RLS 策略，确保超级管理员可以看到所有文章

-- 1. 查看当前的 posts 表 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'posts';

-- 2. 删除旧的 SELECT 策略（如果存在）
DROP POLICY IF EXISTS "Users can view all published posts" ON posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON posts;

-- 3. 创建新的 SELECT 策略：用户可以查看自己的文章，超级管理员可以查看所有文章
CREATE POLICY "Users can view own posts or admins can view all"
ON posts
FOR SELECT
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- 4. 确保 INSERT 策略正确
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;

CREATE POLICY "Authenticated users can insert posts"
ON posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- 5. 确保 UPDATE 策略正确：作者可以更新自己的文章，超级管理员可以更新所有文章
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts or admins can update all" ON posts;

CREATE POLICY "Users can update their own posts or admins can update all"
ON posts
FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- 6. 确保 DELETE 策略正确
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete all posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts or admins can delete all" ON posts;

CREATE POLICY "Users can delete their own posts or admins can delete all"
ON posts
FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- 7. 验证策略
SELECT 
  'After Fix' as status,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;
