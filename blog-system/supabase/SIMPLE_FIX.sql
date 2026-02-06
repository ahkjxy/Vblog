-- 简单修复：将王侦原设为超级管理员

-- 1. 查看当前状态
SELECT 
  '修复前' as timing,
  id,
  name,
  role,
  family_id
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 2. 强制更新为 admin
UPDATE profiles
SET role = 'admin'
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 3. 验证结果
SELECT 
  '修复后' as timing,
  id,
  name,
  role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓ 超级管理员设置成功'
    ELSE '✗ 还有问题'
  END as status
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 4. 显示所有超管家庭成员
SELECT 
  name,
  role,
  CASE 
    WHEN role = 'admin' THEN '超级管理员'
    WHEN role = 'child' THEN '孩子'
    ELSE role
  END as role_display
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY role;
