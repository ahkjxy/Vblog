-- 检查这个 author_id 是否存在于 profiles 表中
SELECT 
  id,
  name,
  avatar_url,
  family_id,
  role,
  created_at
FROM profiles
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';

-- 检查所有 profiles
SELECT 
  id,
  name,
  family_id,
  role
FROM profiles
ORDER BY created_at DESC;

-- 检查 posts 表中的 author_id
SELECT 
  id,
  title,
  author_id,
  status,
  review_status
FROM posts
WHERE slug = 'yuan-qi-yin-hang-bu-zhi-yu-ji-fen-yi-chang-jia-ting-cheng-zhang-de-wen-rou-ge-ming';
