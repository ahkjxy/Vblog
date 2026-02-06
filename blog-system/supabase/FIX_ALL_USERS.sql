-- 为所有缺少 profile 的用户创建 profile

-- 步骤 1: 查看哪些用户缺少 profile
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN p.id IS NULL THEN '❌ 缺少 profile'
    ELSE '✅ 有 profile'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- 步骤 2: 为 ahkixy@qq.com 创建 profile（如果这是王僚原的账号）
-- 请先确认这个邮箱是否是王僚原的
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
SELECT 
  id,
  '王僚原',  -- 修改为正确的名字
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 步骤 3: 为 wangliaoyuan@gmail.com 创建 profile（如果存在）
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
SELECT 
  id,
  '王僚原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000
FROM auth.users
WHERE email = 'wangliaoyuan@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 步骤 4: 验证所有用户
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 超级管理员'
    WHEN p.id IS NOT NULL
    THEN '✅ 有 profile'
    ELSE '❌ 缺少 profile'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
