-- 调试权限问题
-- 检查当前用户是否是超级管理员，以及为什么看不到文章

-- ============================================
-- 第一步：检查当前用户信息
-- ============================================

SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- ============================================
-- 第二步：检查当前用户的 profile
-- ============================================

SELECT 
  id,
  name,
  role,
  family_id,
  CASE 
    WHEN family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN '✓ 是超级管理员家庭'
    ELSE '✗ 不是超级管理员家庭'
  END as is_super_admin_family
FROM profiles
WHERE id = auth.uid();

-- ============================================
-- 第三步：检查所有文章
-- ============================================

SELECT 
  id,
  title,
  status,
  COALESCE(review_status, 'N/A') as review_status,
  author_id,
  published_at,
  created_at
FROM posts
ORDER BY created_at DESC;

-- ============================================
-- 第四步：检查 RLS 是否启用
-- ============================================

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'posts';

-- ============================================
-- 第五步：检查当前的 RLS 策略
-- ============================================

SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

-- ============================================
-- 第六步：测试能否看到文章（绕过 RLS）
-- ============================================

-- 临时禁用 RLS 查看所有文章
SET LOCAL ROLE postgres;
SELECT 
  id,
  title,
  status,
  author_id
FROM posts
ORDER BY created_at DESC
LIMIT 5;
RESET ROLE;

-- ============================================
-- 第七步：检查超级管理员家庭的所有用户
-- ============================================

SELECT 
  id,
  name,
  role,
  family_id
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- ============================================
-- 第八步：统计信息
-- ============================================

DO $$
DECLARE
  total_posts INTEGER;
  published_posts INTEGER;
  approved_posts INTEGER;
  current_user_id UUID;
  is_super_admin BOOLEAN;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  SELECT COUNT(*) INTO total_posts FROM posts;
  SELECT COUNT(*) INTO published_posts FROM posts WHERE status = 'published';
  
  -- 检查 review_status 字段是否存在
  BEGIN
    SELECT COUNT(*) INTO approved_posts FROM posts WHERE review_status = 'approved';
  EXCEPTION WHEN undefined_column THEN
    approved_posts := -1;
  END;
  
  -- 检查是否是超级管理员
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = current_user_id
    AND role = 'admin'
    AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  ) INTO is_super_admin;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '当前用户 ID: %', current_user_id;
  RAISE NOTICE '是否超级管理员: %', is_super_admin;
  RAISE NOTICE '总文章数: %', total_posts;
  RAISE NOTICE '已发布文章数: %', published_posts;
  IF approved_posts >= 0 THEN
    RAISE NOTICE '已审核通过文章数: %', approved_posts;
  ELSE
    RAISE NOTICE 'review_status 字段不存在';
  END IF;
  RAISE NOTICE '========================================';
END $$;
