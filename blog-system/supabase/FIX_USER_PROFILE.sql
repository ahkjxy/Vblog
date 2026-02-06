-- 修复用户档案问题（profiles 表没有 email 字段）

-- 1. 检查当前登录用户的 auth.users 记录
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'wangliaoyuan@gmail.com';

-- 2. 检查 profiles 表中是否有对应记录
SELECT 
  id,
  name,
  role,
  family_id,
  balance,
  avatar_url,
  avatar_color,
  bio,
  created_at
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 3. 创建或更新 profile 记录（如果不存在）
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance,
  created_at
)
VALUES (
  '79bba44c-f61d-4197-9e6b-4781a19d962b',
  '王侦原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王侦原';

-- 4. 验证结果
SELECT 
  id,
  name,
  role,
  family_id,
  balance,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 是超级管理员'
    ELSE '❌ 不是超级管理员'
  END as is_super_admin
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 5. 检查 family_members 表
SELECT 
  user_id,
  family_id,
  role,
  created_at
FROM family_members
WHERE user_id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 6. 创建或更新 family_members 记录（如果需要）
INSERT INTO family_members (
  user_id,
  family_id,
  role
)
VALUES (
  '79bba44c-f61d-4197-9e6b-4781a19d962b',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  'admin'
)
ON CONFLICT (user_id, family_id) DO UPDATE SET
  role = 'admin';

-- 7. 最终验证
SELECT 
  p.id,
  p.name,
  p.role as profile_role,
  p.family_id,
  p.balance,
  fm.role as family_role,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 超级管理员'
    ELSE '❌ 非超管'
  END as status
FROM profiles p
LEFT JOIN family_members fm ON fm.user_id = p.id AND fm.family_id = p.family_id
WHERE p.id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
