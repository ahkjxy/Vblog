-- 查询 profiles 表的详细信息

-- 1. profiles 表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. 当前用户的 profile 数据
SELECT *
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'ahkixy@qq.com';

-- 3. 当前用户的 family_members 数据
SELECT *
FROM family_members fm
JOIN auth.users u ON fm.user_id = u.id
WHERE u.email = 'ahkixy@qq.com';

-- 4. 当前用户所属家庭的信息
SELECT f.*
FROM families f
JOIN family_members fm ON f.id = fm.family_id
JOIN auth.users u ON fm.user_id = u.id
WHERE u.email = 'ahkixy@qq.com';

-- 5. 所有 profiles 示例（前5条）
SELECT 
  p.*,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
LIMIT 5;

-- 6. family_members 表结构
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'family_members'
ORDER BY ordinal_position;
