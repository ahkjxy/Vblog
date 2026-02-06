-- 恢复所有 RLS 策略

-- ============================================
-- PROFILES 表策略
-- ============================================

-- 删除旧策略
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 创建新策略：所有人都可以查看 profiles（包括匿名用户）
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- 用户可以更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- POSTS 表策略
-- ============================================

-- 删除旧策略
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Authors can view own drafts" ON posts;
DROP POLICY IF EXISTS "Editors and admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Authors can insert posts" ON posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- 所有人都可以查看已发布且审核通过的文章（包括匿名用户）
CREATE POLICY "Published approved posts are viewable by everyone"
  ON posts
  FOR SELECT
  TO public
  USING (
    status = 'published' 
    AND (
      review_status = 'approved' 
      OR review_status IS NULL
    )
  );

-- 作者可以查看自己的所有文章
CREATE POLICY "Authors can view own posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- 管理员可以查看所有文章
CREATE POLICY "Admins can view all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    )
  );

-- 认证用户可以创建文章
CREATE POLICY "Authenticated users can insert posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 作者可以更新自己的文章
CREATE POLICY "Authors can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- 管理员可以更新所有文章
CREATE POLICY "Admins can update all posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    )
  );

-- 管理员可以删除文章
CREATE POLICY "Admins can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    )
  );

-- ============================================
-- 验证策略
-- ============================================

-- 查看 profiles 表的策略
SELECT 'PROFILES POLICIES:' as info;
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 查看 posts 表的策略
SELECT 'POSTS POLICIES:' as info;
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

-- 测试查询：匿名用户应该能看到已发布的文章
SELECT 'TEST QUERY:' as info;
SELECT 
  p.id,
  p.title,
  p.status,
  p.review_status,
  pr.name as author_name
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'published'
  AND (p.review_status = 'approved' OR p.review_status IS NULL)
ORDER BY p.published_at DESC
LIMIT 3;
