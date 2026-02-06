-- 步骤 1：检查问题
-- 查看是否有孤立用户（在 auth.users 中有，但 profiles 中没有）

-- 1. 查看最近注册的用户
SELECT 
  '1. 最近注册的用户 (auth.users)' as step,
  id,
  email,
  created_at,
  raw_user_meta_data->>'name' as metadata_name
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. 查看最近创建的 profiles
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

-- 3. 查找孤立用户（重要！）
SELECT 
  '3. 孤立用户（有 auth 但没有 profile）' as step,
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'name' as metadata_name
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 4. 统计信息
SELECT 
  '4. 统计信息' as step,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM families) as families_count,
  (SELECT COUNT(*) 
   FROM auth.users au 
   LEFT JOIN profiles p ON p.id = au.id 
   WHERE p.id IS NULL) as orphaned_users_count;
