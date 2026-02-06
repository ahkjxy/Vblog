-- 检查认证设置和用户状态

-- 1. 检查是否有该邮箱的用户（在 auth.users 表中）
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'your-email@example.com'  -- 替换为你要测试的邮箱
ORDER BY created_at DESC;

-- 2. 检查 profiles 表中是否有对应的记录
SELECT 
  id,
  family_id,
  name,
  role,
  created_at
FROM profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'  -- 替换为你要测试的邮箱
);

-- 3. 检查所有用户（最近10个）
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.name,
  p.role,
  p.family_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 4. 检查是否有孤立的 auth.users（没有对应的 profiles）
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
