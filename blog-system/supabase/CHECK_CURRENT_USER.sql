-- 检查当前登录的用户是谁

-- 1. 查看所有用户
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY last_sign_in_at DESC;

-- 2. 查看所有 profiles
SELECT 
  id,
  name,
  role,
  family_id,
  balance,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. 查看哪些用户没有 profile
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.id IS NULL THEN '❌ 缺少 profile'
    ELSE '✅ 有 profile'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. 查看王僚原的信息
SELECT 
  u.id as user_id,
  u.email,
  p.name,
  p.role,
  p.family_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%wang%' OR p.name LIKE '%王%';
