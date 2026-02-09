-- 检查 avatar_url 字段的问题

-- 1. 查看 profiles 表结构
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'avatar_url';

-- 2. 查看当前所有成员的 avatar_url
SELECT 
    id,
    name,
    avatar_url,
    LENGTH(avatar_url) as url_length
FROM profiles
ORDER BY name;

-- 3. 如果字段长度不够，修改为 TEXT 类型
-- ALTER TABLE profiles ALTER COLUMN avatar_url TYPE TEXT;
