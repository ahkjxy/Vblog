-- 检查 author_id 对应的 profile 是否存在
SELECT 
  p.id as post_id,
  p.title,
  p.author_id,
  pr.id as profile_id,
  pr.name as profile_name,
  pr.avatar_url,
  pr.family_id
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.slug = 'yuan-qi-yin-hang-bu-zhi-yu-ji-fen-yi-chang-jia-ting-cheng-zhang-de-wen-rou-ge-ming'
LIMIT 1;

-- 检查 profiles 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 检查 posts 表的外键关系
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'posts'
  AND kcu.column_name = 'author_id';
