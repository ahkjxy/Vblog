-- 修复 comments 表的 RLS 策略，允许所有人发表评论

-- 查看当前的 comments RLS 策略
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'comments';

-- 删除所有旧的 comments 策略
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;
DROP POLICY IF EXISTS "Enable read access for all users" ON comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON comments;

-- 创建新的策略

-- 1. 所有人都可以查看已审核的评论
CREATE POLICY "Public can view approved comments"
  ON comments
  FOR SELECT
  TO public
  USING (status = 'approved');

-- 2. 认证用户可以查看自己的所有评论
CREATE POLICY "Users can view own comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. 管理员可以查看所有评论
CREATE POLICY "Admins can view all comments"
  ON comments
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

-- 4. 所有人都可以插入评论（包括匿名用户）
CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 5. 用户可以更新自己的评论
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. 管理员可以更新所有评论
CREATE POLICY "Admins can update all comments"
  ON comments
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

-- 7. 用户可以删除自己的评论
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 8. 管理员可以删除所有评论
CREATE POLICY "Admins can delete all comments"
  ON comments
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

-- 验证策略
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'comments'
ORDER BY policyname;

-- 测试插入评论（应该成功）
-- 注意：这只是测试语法，实际插入需要有效的 post_id
SELECT 'Test: Anyone should be able to insert comments' as test;
