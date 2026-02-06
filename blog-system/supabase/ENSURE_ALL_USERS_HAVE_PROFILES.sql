-- 确保所有 auth.users 都有对应的 profiles 记录

-- 1. 检查哪些用户没有 profile
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 2. 为没有 profile 的用户创建 profile
INSERT INTO profiles (
  id,
  family_id,
  name,
  balance,
  role,
  avatar_color,
  level,
  experience,
  bio
)
SELECT 
  u.id,
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171' as family_id,  -- 默认家庭ID
  COALESCE(
    u.raw_user_meta_data->>'username',
    split_part(u.email, '@', 1)
  ) as name,
  0 as balance,
  'author' as role,
  '#' || lpad(to_hex((random() * 16777215)::int), 6, '0') as avatar_color,
  1 as level,
  0 as experience,
  NULL as bio
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. 验证所有用户都有 profile
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profile,
  COUNT(*) - COUNT(p.id) as users_without_profile
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- 4. 显示最近创建的 profiles
SELECT 
  p.id,
  p.name,
  p.role,
  p.family_id,
  p.created_at,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
