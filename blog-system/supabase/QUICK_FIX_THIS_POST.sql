-- 快速修复这篇文章

-- 1. 查看当前状态
SELECT 
  id,
  title,
  slug,
  status,
  review_status,
  author_id,
  published_at
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';

-- 2. 更新为审核通过
UPDATE posts
SET 
  review_status = 'approved',
  reviewed_at = NOW(),
  reviewed_by = author_id,
  status = 'published'
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';

-- 3. 验证更新
SELECT 
  '✅ 更新后' as status,
  id,
  title,
  slug,
  status,
  review_status,
  reviewed_at
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';
