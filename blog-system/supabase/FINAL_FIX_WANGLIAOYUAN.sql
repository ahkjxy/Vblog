-- 最终修复：为王僚原（ahkixy@qq.com）创建超级管理员 profile

-- 为 ahkixy@qq.com 创建 profile，显示名为"王僚原"
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
  u.email as 登录邮箱,
  p.name as 显示名字,
  p.role as 角色,
  p.family_id as 家庭ID,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 成功！王僚原是超级管理员'
    ELSE '❌ 失败'
  END as 状态
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahkixy@qq.com';
