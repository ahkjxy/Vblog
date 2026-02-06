-- 调试用户数据查询
-- 替换 'your-user-id' 为实际的用户 ID

-- 1. 检查 auth.users 表
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- 2. 检查 family_members 表
SELECT fm.*, f.name as family_name
FROM family_members fm
LEFT JOIN families f ON f.id = fm.family_id
WHERE fm.user_id = 'your-user-id';

-- 3. 检查用户的 profile
SELECT id, name, role, family_id, avatar_url, avatar_color, balance
FROM profiles
WHERE id = 'your-user-id';

-- 4. 检查家庭中的所有 profiles
SELECT p.id, p.name, p.role, p.family_id, p.avatar_url, p.avatar_color
FROM profiles p
WHERE p.family_id = (
  SELECT family_id 
  FROM family_members 
  WHERE user_id = 'your-user-id'
  LIMIT 1
);

-- 5. 检查家长的 profile
SELECT p.id, p.name, p.role, p.family_id, p.avatar_url, p.avatar_color
FROM profiles p
WHERE p.family_id = (
  SELECT family_id 
  FROM family_members 
  WHERE user_id = 'your-user-id'
  LIMIT 1
)
AND p.role = 'admin';

-- 6. 完整的查询（模拟代码逻辑）
WITH user_family AS (
  SELECT family_id
  FROM family_members
  WHERE user_id = 'your-user-id'
  LIMIT 1
),
admin_profile AS (
  SELECT name, avatar_url, avatar_color, role
  FROM profiles
  WHERE family_id = (SELECT family_id FROM user_family)
    AND role = 'admin'
  LIMIT 1
),
user_profile AS (
  SELECT name, avatar_url, avatar_color, role, balance
  FROM profiles
  WHERE id = 'your-user-id'
  LIMIT 1
)
SELECT 
  COALESCE(ap.name, up.name, 'fallback') as display_name,
  COALESCE(ap.avatar_url, up.avatar_url) as display_avatar,
  COALESCE(ap.avatar_color, up.avatar_color) as display_color,
  up.role as user_role,
  up.balance as user_balance
FROM user_profile up
LEFT JOIN admin_profile ap ON true;

-- 7. 检查是否有重复的 admin
SELECT family_id, COUNT(*) as admin_count
FROM profiles
WHERE role = 'admin'
GROUP BY family_id
HAVING COUNT(*) > 1;

-- 8. 检查所有家庭和成员
SELECT 
  f.id as family_id,
  f.name as family_name,
  p.id as profile_id,
  p.name as profile_name,
  p.role as profile_role,
  fm.user_id
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
LEFT JOIN family_members fm ON fm.family_id = f.id
ORDER BY f.id, p.role DESC;
