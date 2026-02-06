-- 诊断缺失家庭的用户

-- 1. 查看所有 profiles 及其家庭关联
SELECT 
  p.id as profile_id,
  p.name as profile_name,
  p.family_id,
  f.name as family_name,
  p.role,
  p.created_at
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
ORDER BY p.created_at DESC;

-- 2. 查找没有家庭的 profiles
SELECT 
  p.id,
  p.name,
  p.family_id,
  p.role,
  p.created_at
FROM profiles p
WHERE p.family_id IS NULL
ORDER BY p.created_at DESC;

-- 3. 查找 family_id 存在但 families 表中没有对应记录的情况
SELECT 
  p.id as profile_id,
  p.name as profile_name,
  p.family_id,
  p.role,
  p.created_at
FROM profiles p
WHERE p.family_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM families f WHERE f.id = p.family_id
  )
ORDER BY p.created_at DESC;

-- 4. 查看所有 families 记录
SELECT 
  f.id,
  f.name,
  f.created_at,
  COUNT(p.id) as member_count
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
GROUP BY f.id, f.name, f.created_at
ORDER BY f.created_at DESC;

-- 5. 查看 auth.users 和 profiles 的对应关系
SELECT 
  au.id as auth_user_id,
  au.email,
  au.created_at as auth_created_at,
  p.id as profile_id,
  p.name as profile_name,
  p.family_id,
  f.name as family_name,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN families f ON f.id = p.family_id
ORDER BY au.created_at DESC;

-- 6. 检查触发器是否存在
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 7. 检查 handle_new_user 函数是否存在
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';
