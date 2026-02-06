-- 为当前登录用户创建 profile
-- 当前登录用户: ahkixy@qq.com (ID: f9ad98b6-17ad-4c58-b6fa-b5b02d8374...)

-- 方法 1: 如果你知道完整的用户 ID
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
VALUES (
  'f9ad98b6-17ad-4c58-b6fa-b5b02d8374...',  -- 替换为完整的用户 ID
  '王僚原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 方法 2: 通过邮箱自动查找并创建
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
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 验证
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 成功！是超级管理员'
    ELSE '❌ 失败'
  END as result
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahkixy@qq.com';
