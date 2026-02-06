-- 检查所有用户的家庭归属情况
-- 查看 profiles 表中的数据

-- 1. 查看所有 profiles 记录
SELECT 
  id,
  name,
  family_id,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. 查看 families 表
SELECT 
  id,
  name,
  created_at
FROM families
ORDER BY created_at DESC;

-- 3. 查看每个家庭有多少成员
SELECT 
  f.id as family_id,
  f.name as family_name,
  COUNT(p.id) as member_count,
  STRING_AGG(p.name, ', ') as members
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
GROUP BY f.id, f.name
ORDER BY member_count DESC;

-- 4. 查看 auth.users 和 profiles 的对应关系
SELECT 
  au.id as auth_user_id,
  au.email,
  p.id as profile_id,
  p.name as profile_name,
  p.family_id,
  f.name as family_name,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN families f ON f.id = p.family_id
ORDER BY au.created_at DESC;
