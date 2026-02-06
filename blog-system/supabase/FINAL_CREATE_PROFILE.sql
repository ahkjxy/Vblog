-- 最终修复：为王僚原创建 profile（使用正确的表结构）

-- 为 ahkixy@qq.com 创建 profile
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance,
  level,
  experience
)
SELECT 
  id,
  '王僚原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000,
  1,
  0
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  name = '王僚原',
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 验证
SELECT 
  u.email as 登录邮箱,
  p.name as 显示名字,
  p.role as 角色,
  p.family_id as 家庭ID,
  p.balance as 积分,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 成功！王僚原是超级管理员'
    ELSE '❌ 失败'
  END as 状态
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahkixy@qq.com';
