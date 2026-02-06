-- 检查 families 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'families'
ORDER BY ordinal_position;

-- 检查 profiles 表中的 family_id 字段
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('id', 'name', 'family_id')
ORDER BY ordinal_position;

-- 查看一个示例数据
SELECT 
  p.id,
  p.name,
  p.family_id,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON p.family_id = f.id
WHERE p.role = 'admin'
LIMIT 3;
