-- 自动审核通过超级管理员发布的所有文章
-- 超级管理员：role='admin' AND family_id='79ed05a1-e0e5-4d8c-9a79-d8756c488171'

-- 1. 查看超级管理员的信息
SELECT 
  id,
  name,
  role,
  family_id
FROM profiles
WHERE role = 'admin' 
  AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 2. 查看超级管理员发布的文章状态
SELECT 
  p.id,
  p.title,
  p.slug,
  p.status,
  p.review_status,
  p.author_id,
  pr.name as author_name
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE pr.role = 'admin' 
  AND pr.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  AND p.status = 'published';

-- 3. 自动审核通过超级管理员发布的所有文章
UPDATE posts
SET 
  review_status = 'approved',
  reviewed_by = author_id,
  reviewed_at = NOW()
WHERE author_id IN (
  SELECT id 
  FROM profiles 
  WHERE role = 'admin' 
    AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
)
AND status = 'published'
AND (review_status IS NULL OR review_status != 'approved');

-- 4. 验证更新结果
SELECT 
  p.id,
  p.title,
  p.slug,
  p.status,
  p.review_status,
  p.reviewed_at,
  pr.name as author_name
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE pr.role = 'admin' 
  AND pr.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  AND p.status = 'published'
ORDER BY p.created_at DESC;
