-- 检查 posts 表的 RLS 策略

-- 1. 查看所有 posts 表的 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- 2. 检查 RLS 是否启用
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'posts';

-- 3. 测试查询：作为匿名用户查询已发布的文章
-- 这个查询模拟前台用户的查询
SET ROLE anon;
SELECT 
  id,
  title,
  slug,
  status,
  review_status
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang'
  AND status = 'published';
RESET ROLE;

-- 4. 测试查询：作为匿名用户查询所有已发布的文章
SET ROLE anon;
SELECT 
  id,
  title,
  slug,
  status,
  review_status
FROM posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 5;
RESET ROLE;
