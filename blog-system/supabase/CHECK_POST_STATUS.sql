-- 检查指定 slug 的文章状态
SELECT 
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

-- 如果文章存在但 review_status 不是 approved，更新它
UPDATE posts
SET review_status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = author_id
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang'
  AND (review_status IS NULL OR review_status != 'approved');

-- 验证更新结果
SELECT 
  id,
  title,
  slug,
  status,
  review_status,
  reviewed_at
FROM posts
WHERE slug = 'yuan-qi-yin-hang-wei-hai-zi-jian-li-yi-zuo-xian-shi-yu-meng-xiang-zhi-jian-de-shu-zi-qiao-liang';
