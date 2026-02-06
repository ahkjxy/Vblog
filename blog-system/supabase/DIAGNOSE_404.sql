-- 诊断 404 问题：检查文章是否存在以及其状态

-- 1. 检查这个 slug 的文章是否存在
SELECT 
  'Post exists?' as check_type,
  id,
  title,
  slug,
  status,
  review_status,
  author_id,
  published_at,
  created_at
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';

-- 2. 检查所有已发布的文章
SELECT 
  'All published posts' as check_type,
  id,
  title,
  slug,
  status,
  review_status,
  author_id
FROM posts
WHERE status = 'published'
ORDER BY created_at DESC;

-- 3. 检查作者信息
SELECT 
  'Author info' as check_type,
  p.id as post_id,
  p.title,
  p.author_id,
  pr.name as author_name,
  pr.role,
  pr.family_id
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';

-- 4. 检查 posts 表结构（是否有 review_status 字段）
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 如果文章存在，更新为审核通过
UPDATE posts
SET 
  review_status = 'approved',
  reviewed_at = NOW(),
  reviewed_by = author_id
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang'
  AND status = 'published';

-- 6. 验证更新后的状态
SELECT 
  'After update' as check_type,
  id,
  title,
  slug,
  status,
  review_status,
  reviewed_at
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';
