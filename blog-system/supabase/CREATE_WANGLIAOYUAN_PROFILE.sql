-- 为王僚原创建 Profile 记录
-- 用户 ID: f9ad98b6-17ad-4c58-b6fa-b5b02d83748e
-- 邮箱: ahkjxy@qq.com
-- 家庭 ID: 79ed05a1-e0e5-4d8c-9a79-d8756c488171

-- 1. 检查当前状态
SELECT 
  'Current Profile' as check_type,
  *
FROM profiles 
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';

-- 2. 创建 Profile（如果不存在）
INSERT INTO profiles (
  id,
  family_id,
  name,
  role,
  balance,
  avatar_color,
  level,
  experience,
  created_at
)
VALUES (
  'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  '王僚原',
  'admin',
  0,
  '#8B5CF6',
  1,
  0,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原',
  role = 'admin';

-- 3. 验证结果
SELECT 
  'After Creation' as check_type,
  id,
  family_id,
  name,
  role,
  balance,
  level,
  experience,
  avatar_color,
  created_at
FROM profiles 
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';

-- 4. 验证超管条件
SELECT 
  'Super Admin Check' as check_type,
  id,
  name,
  role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' 
    THEN '✅ 是超级管理员'
    ELSE '❌ 不是超级管理员'
  END as is_super_admin
FROM profiles 
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';
