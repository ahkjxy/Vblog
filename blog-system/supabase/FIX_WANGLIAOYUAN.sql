-- 为王僚原（ahkixy@qq.com）创建超级管理员 profile

-- 步骤 1: 查看当前用户信息
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'ahkixy@qq.com';

-- 步骤 2: 为 ahkixy@qq.com 创建 profile，显示名为"王僚原"
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
SELECT 
  id,
  '王僚原',  -- 家长名字
  'admin',   -- 超级管理员角色
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',  -- 超管家庭 ID
  1000
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 步骤 3: 验证结果
SELECT 
  u.id,
  u.email as 登录邮箱,
  p.name as 显示名字,
  p.role as 角色,
  p.family_id as 家庭ID,
  p.balance as 积分,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 成功！是超级管理员'
    ELSE '❌ 失败'
  END as 状态
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahkixy@qq.com';

-- 步骤 4: 检查 family_members 表
SELECT 
  user_id,
  family_id,
  role,
  created_at
FROM family_members
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'ahkixy@qq.com'
);

-- 步骤 5: 如果需要，创建 family_members 记录
INSERT INTO family_members (
  user_id,
  family_id,
  role
)
SELECT 
  id,
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  'admin'
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (user_id, family_id) DO UPDATE SET
  role = 'admin';

-- 步骤 6: 最终验证
SELECT 
  '=== 王僚原信息 ===' as 说明,
  u.email as 登录邮箱,
  p.name as 显示名字,
  p.role as profile角色,
  p.family_id as 家庭ID,
  fm.role as family角色,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 超级管理员'
    ELSE '❌ 非超管'
  END as 最终状态
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN family_members fm ON fm.user_id = u.id AND fm.family_id = p.family_id
WHERE u.email = 'ahkixy@qq.com';
