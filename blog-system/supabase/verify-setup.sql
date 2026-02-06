-- 验证设置是否正确

-- 1. 检查字段是否存在
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'review_status'
    ) THEN '✓ review_status 字段存在'
    ELSE '✗ review_status 字段不存在 - 需要运行 ONE_CLICK_FIX.sql'
  END as field_check;

-- 2. 检查文章数量
SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE status = 'published') as published_posts,
  COUNT(*) FILTER (WHERE review_status = 'approved') as approved_posts
FROM posts;

-- 3. 检查 RLS 策略数量
SELECT 
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'posts';

-- 4. 检查超级管理员
SELECT 
  COUNT(*) as super_admin_count,
  STRING_AGG(name, ', ') as super_admin_names
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  AND role = 'admin';

-- 5. 检查当前用户
SELECT 
  auth.uid() as your_user_id,
  p.name as your_name,
  p.role as your_role,
  p.family_id as your_family_id,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓ 你是超级管理员'
    ELSE '✗ 你不是超级管理员'
  END as your_status
FROM profiles p
WHERE p.id = auth.uid();

-- 6. 显示最近的文章
SELECT 
  id,
  title,
  status,
  COALESCE(review_status, 'N/A') as review_status,
  author_id,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 3;
