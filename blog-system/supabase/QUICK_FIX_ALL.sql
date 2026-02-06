-- 快速修复所有问题
-- 一次性解决：字段、角色、权限

-- ============================================
-- 步骤 1: 确保王侦原是超级管理员
-- ============================================

-- 查看当前状态
SELECT 
  '修复前' as status,
  id,
  name,
  role,
  family_id
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 设置为 admin
UPDATE profiles
SET role = 'admin'
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 验证
SELECT 
  '修复后' as status,
  id,
  name,
  role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓ 是超级管理员'
    ELSE '✗ 不是超级管理员'
  END as admin_status
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- ============================================
-- 步骤 2: 添加审核字段
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE posts ADD COLUMN review_status VARCHAR(20) DEFAULT 'approved';
    RAISE NOTICE '✓ 已添加 review_status 字段';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_by UUID;
    RAISE NOTICE '✓ 已添加 reviewed_by 字段';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ 已添加 reviewed_at 字段';
  END IF;
END $$;

-- ============================================
-- 步骤 3: 更新已发布文章为已通过
-- ============================================

UPDATE posts 
SET review_status = 'approved',
    reviewed_at = NOW()
WHERE status = 'published';

-- ============================================
-- 步骤 4: 删除所有旧策略
-- ============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON posts';
  END LOOP;
  RAISE NOTICE '✓ 已删除所有旧策略';
END $$;

-- ============================================
-- 步骤 5: 创建新策略
-- ============================================

-- SELECT: 公开查看已发布文章
CREATE POLICY "public_select_published"
ON posts FOR SELECT
TO public
USING (status = 'published');

-- SELECT: 用户查看自己的文章
CREATE POLICY "auth_select_own"
ON posts FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- SELECT: 超级管理员查看所有文章
CREATE POLICY "admin_select_all"
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

-- INSERT: 认证用户创建文章
CREATE POLICY "auth_insert"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- UPDATE: 用户更新自己的文章
CREATE POLICY "auth_update_own"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- UPDATE: 超级管理员更新所有文章
CREATE POLICY "admin_update_all"
ON posts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- DELETE: 用户删除自己的文章
CREATE POLICY "auth_delete_own"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- DELETE: 超级管理员删除所有文章
CREATE POLICY "admin_delete_all"
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
-- 步骤 6: 启用 RLS
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 步骤 7: 显示结果
-- ============================================

DO $$
DECLARE
  total_posts INTEGER;
  published_posts INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_posts FROM posts;
  SELECT COUNT(*) INTO published_posts FROM posts WHERE status = 'published';
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'posts';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓✓✓ 修复完成！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '王侦原: 已设为超级管理员';
  RAISE NOTICE '总文章数: %', total_posts;
  RAISE NOTICE '已发布: %', published_posts;
  RAISE NOTICE 'RLS 策略数: %', policy_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '请刷新浏览器测试';
  RAISE NOTICE '========================================';
END $$;

-- 显示超管家庭成员
SELECT 
  name,
  role,
  CASE 
    WHEN role = 'admin' THEN '✓ 超级管理员'
    WHEN role = 'child' THEN '孩子'
    ELSE role
  END as role_label
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY role;
