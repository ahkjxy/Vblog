-- 快速检查：为什么注册的用户在数据库中查不到

-- 1. 查看最近注册的 auth.users（最近 10 个）
SELECT 
  '1. 最近注册的用户 (auth.users)' as step,
  id,
  email,
  created_at,
  raw_user_meta_data->>'name' as metadata_name,
  raw_user_meta_data->>'username' as metadata_username
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. 查看最近创建的 profiles（最近 10 个）
SELECT 
  '2. 最近创建的 profiles' as step,
  id,
  name,
  family_id,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. 查找孤立用户（在 auth.users 中有，但 profiles 中没有）
SELECT 
  '3. 孤立用户（有 auth 但没有 profile）' as step,
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 4. 查看触发器是否存在
SELECT 
  '4. 触发器状态' as step,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. 查看函数是否存在
SELECT 
  '5. 函数状态' as step,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 6. 统计数据
SELECT 
  '6. 统计信息' as step,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM families) as families_count,
  (SELECT COUNT(*) 
   FROM auth.users au 
   LEFT JOIN profiles p ON p.id = au.id 
   WHERE p.id IS NULL) as orphaned_users_count;
