-- 检查 profiles 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 检查是否有 family_id 字段
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND column_name = 'family_id'
) as has_family_id;

-- 检查 families 表是否存在
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_name = 'families'
) as families_table_exists;

-- 如果 families 表存在，查看其结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'families'
ORDER BY ordinal_position;

-- 查看一个具体的 profile 数据
SELECT 
  p.id,
  p.name,
  p.family_id,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON p.family_id = f.id
WHERE p.role = 'admin'
LIMIT 3;

-- 查看文章作者的信息
SELECT 
  posts.id,
  posts.title,
  posts.author_id,
  profiles.name as author_name,
  profiles.family_id,
  families.name as family_name
FROM posts
LEFT JOIN profiles ON posts.author_id = profiles.id
LEFT JOIN families ON profiles.family_id = families.id
WHERE posts.status = 'published'
LIMIT 3;
