-- 修复 RLS 策略 - 让文章能正常显示
-- 问题：之前的策略太严格，导致文章都看不到

-- ============================================
-- 第一步：删除所有旧的 RLS 策略
-- ============================================

DROP POLICY IF EXISTS "Public can view approved published posts" ON posts;
DROP POLICY IF EXISTS "Users can view own family posts" ON posts;
DROP POLICY IF EXISTS "Super admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own family posts" ON posts;
DROP POLICY IF EXISTS "Super admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own family posts" ON posts;
DROP POLICY IF EXISTS "Super admins can delete all posts" ON posts;

-- 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete all posts" ON posts;

-- ============================================
-- 第二步：创建新的简化 RLS 策略
-- ============================================

-- SELECT 策略
-- 1. 前台：所有人可以查看已发布的文章（暂时不检查审核状态）
CREATE POLICY "Public can view published posts"
ON posts FOR SELECT
TO public
USING (status = 'published');

-- 2. 后台：认证用户可以查看自己的文章
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- 3. 后台：超级管理员可以查看所有文章
CREATE POLICY "Super admin can view all posts"
ON posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- INSERT 策略
-- 认证用户可以创建文章
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- UPDATE 策略
-- 1. 用户可以更新自己的文章
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 2. 超级管理员可以更新所有文章
CREATE POLICY "Super admin can update all posts"
ON posts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- DELETE 策略
-- 1. 用户可以删除自己的文章
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 2. 超级管理员可以删除所有文章
CREATE POLICY "Super admin can delete all posts"
ON posts FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- ============================================
-- 第三步：验证策略
-- ============================================

-- 查看当前的 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

-- 测试查询（以当前用户身份）
SELECT 
  id,
  title,
  status,
  author_id,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;

-- 显示结果
DO $$
DECLARE
  policy_count INTEGER;
  post_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'posts';
  SELECT COUNT(*) INTO post_count FROM posts WHERE status = 'published';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS 策略数量: %', policy_count;
  RAISE NOTICE '已发布文章数: %', post_count;
  RAISE NOTICE '========================================';
END $$;
