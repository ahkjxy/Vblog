-- 检查实际的 profiles 表结构

-- 查看 profiles 表的所有列
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 查看现有的 profiles 数据
SELECT * FROM profiles LIMIT 5;

-- 查看当前用户的 profile
SELECT *
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'ahkixy@qq.com';
