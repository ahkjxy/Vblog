-- 调试文章显示问题
-- 检查数据库中的文章数据和 RLS 策略

-- 1. 查看所有文章
SELECT 
  id,
  title,
  status,
  author_id,
  created_at,
  published_at,
  view_count
FROM posts
ORDER BY created_at DESC;

-- 2. 查看文章及其作者信息
SELECT 
  p.id,
  p.title,
  p.status,
  p.author_id,
  pr.name as author_name,
  pr.email as author_email,
  p.created_at,
  p.published_at
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC;

-- 3. 检查 posts 表的 RLS 策略
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

-- 4. 检查当前用户是否能看到文章
-- 注意：这个查询需要在 Supabase SQL Editor 中以登录用户身份运行
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 5. 检查是否有文章但没有作者信息
SELECT 
  p.id,
  p.title,
  p.author_id,
  CASE 
    WHEN pr.id IS NULL THEN '作者不存在'
    ELSE '作者存在'
  END as author_status
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE pr.id IS NULL;

-- 6. 统计各状态的文章数量
SELECT 
  status,
  COUNT(*) as count
FROM posts
GROUP BY status;
