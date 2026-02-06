-- 一键修复脚本
-- 解决文章不显示和权限问题

-- ============================================
-- 步骤 1: 添加审核字段（如果不存在）
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE posts ADD COLUMN review_status VARCHAR(20) DEFAULT 'approved';
    RAISE NOTICE '✓ 已添加 review_status 字段，默认值为 approved';
  ELSE
    RAISE NOTICE '✓ review_status 字段已存在';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_by UUID;
    RAISE NOTICE '✓ 已添加 reviewed_by 字段';
  ELSE
    RAISE NOTICE '✓ reviewed_by 字段已存在';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ 已添加 reviewed_at 字段';
  ELSE
    RAISE NOTICE '✓ reviewed_at 字段已存在';
  END IF;
END $$;

-- ============================================
-- 步骤 2: 将所有已发布的文章设为已通过
-- ============================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE posts 
  SET review_status = 'approved',
      reviewed_at = NOW()
  WHERE status = 'published';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ 已将 % 篇已发布文章设为"已通过"', updated_count;
END $$;

-- ============================================
-- 步骤 3: 删除所有旧的 RLS 策略
-- ============================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON posts';
    RAISE NOTICE '✓ 已删除策略: %', r.policyname;
  END LOOP;
END $$;

-- ============================================
-- 步骤 4: 创建新的简化 RLS 策略
-- ============================================

-- SELECT: 所有人可以查看已发布的文章
CREATE POLICY "public_select_published"
ON posts FOR SELECT
TO public
USING (status = 'published');

-- SELECT: 认证用户可以查看自己的文章
CREATE POLICY "auth_select_own"
ON posts FOR SELECT
TO authenticated
USING (auth.uid() = author_id);

-- SELECT: 超级管理员可以查看所有文章
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

-- INSERT: 认证用户可以创建文章
CREATE POLICY "auth_insert"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- UPDATE: 用户可以更新自己的文章
CREATE POLICY "auth_update_own"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- UPDATE: 超级管理员可以更新所有文章
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

-- DELETE: 用户可以删除自己的文章
CREATE POLICY "auth_delete_own"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- DELETE: 超级管理员可以删除所有文章
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
-- 步骤 5: 确保 RLS 已启用
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 步骤 6: 显示结果
-- ============================================

DO $$
DECLARE
  total_posts INTEGER;
  published_posts INTEGER;
  approved_posts INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_posts FROM posts;
  SELECT COUNT(*) INTO published_posts FROM posts WHERE status = 'published';
  SELECT COUNT(*) INTO approved_posts FROM posts WHERE review_status = 'approved';
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'posts';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '修复完成！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '总文章数: %', total_posts;
  RAISE NOTICE '已发布: %', published_posts;
  RAISE NOTICE '已审核通过: %', approved_posts;
  RAISE NOTICE 'RLS 策略数: %', policy_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '请刷新浏览器查看效果';
  RAISE NOTICE '========================================';
END $$;

-- 显示前 5 篇文章
SELECT 
  id,
  title,
  status,
  review_status,
  author_id,
  published_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;
