-- 修复 posts 表的 RLS 策略，允许公开访问已发布且审核通过的文章

-- 1. 删除可能冲突的旧策略
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Authors can view own drafts" ON posts;
DROP POLICY IF EXISTS "Editors and admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Public posts are viewable by all" ON posts;

-- 2. 创建新的 SELECT 策略：允许所有人（包括匿名用户）查看已发布且审核通过的文章
CREATE POLICY "Public can view approved published posts"
ON posts
FOR SELECT
TO public  -- 允许所有人，包括匿名用户
USING (
  status = 'published' AND 
  (review_status = 'approved' OR review_status IS NULL)
);

-- 3. 创建策略：认证用户可以查看自己的所有文章
CREATE POLICY "Authors can view own posts"
ON posts
FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- 4. 创建策略：超级管理员可以查看所有文章
CREATE POLICY "Super admins can view all posts"
ON posts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- 5. 验证策略
SELECT 
  'RLS Policies' as info,
  policyname,
  cmd,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'posts'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 6. 测试：作为匿名用户查询
SET ROLE anon;
SELECT 
  'Test as anon' as test,
  COUNT(*) as post_count
FROM posts
WHERE status = 'published';
RESET ROLE;

-- 7. 显示所有已发布的文章
SELECT 
  'All published posts' as info,
  id,
  title,
  slug,
  status,
  review_status
FROM posts
WHERE status = 'published'
ORDER BY created_at DESC;
