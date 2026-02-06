-- 一键修复 404 问题

-- 步骤 1: 检查文章是否存在
DO $$
DECLARE
  post_exists boolean;
  post_status text;
  post_review_status text;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM posts 
    WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang'
  ) INTO post_exists;
  
  IF post_exists THEN
    SELECT status, review_status INTO post_status, post_review_status
    FROM posts
    WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';
    
    RAISE NOTICE '文章存在！状态: %, 审核状态: %', post_status, post_review_status;
  ELSE
    RAISE NOTICE '文章不存在！';
  END IF;
END $$;

-- 步骤 2: 如果文章存在但未审核通过，更新为审核通过
UPDATE posts
SET 
  review_status = 'approved',
  reviewed_at = NOW(),
  reviewed_by = author_id,
  status = 'published'  -- 确保状态是 published
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';

-- 步骤 3: 验证更新
SELECT 
  '✅ 修复后状态' as status,
  id,
  title,
  slug,
  status,
  review_status,
  published_at,
  reviewed_at
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';

-- 步骤 4: 同时修复所有超级管理员的已发布文章
UPDATE posts
SET 
  review_status = 'approved',
  reviewed_at = NOW(),
  reviewed_by = author_id
WHERE author_id IN (
  SELECT id FROM profiles 
  WHERE role = 'admin' 
    AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
)
AND status = 'published'
AND (review_status IS NULL OR review_status != 'approved');

-- 步骤 5: 显示所有超级管理员的文章状态
SELECT 
  '✅ 所有超级管理员文章' as status,
  p.id,
  p.title,
  p.slug,
  p.status,
  p.review_status,
  pr.name as author
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE pr.role = 'admin' 
  AND pr.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY p.created_at DESC;
