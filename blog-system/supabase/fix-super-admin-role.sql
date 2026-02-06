-- 修复超级管理员的博客角色
-- 问题：王僚原在 profiles 表中的 role 可能不是 'admin'

-- 1. 查看王僚原当前的信息
SELECT 
  id,
  name,
  role as current_role,
  family_id,
  CASE 
    WHEN family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN '✓ 是超管家庭'
    ELSE '✗ 不是超管家庭'
  END as family_status
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 2. 将王僚原的博客角色设为 admin
UPDATE profiles
SET role = 'admin'
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 3. 验证更新结果
SELECT 
  id,
  name,
  role as updated_role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓✓✓ 现在是超级管理员了！'
    ELSE '还有问题'
  END as final_status
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 4. 显示所有超管家庭成员的角色
SELECT 
  id,
  name,
  role,
  CASE 
    WHEN role = 'admin' THEN '✓ 管理员（家长）'
    WHEN role = 'child' THEN '孩子'
    WHEN role = 'editor' THEN '编辑'
    WHEN role = 'author' THEN '作者'
    ELSE role
  END as role_label
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY role;

-- 说明
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '已将王僚原的角色设为 admin';
  RAISE NOTICE '现在他应该有超级管理员权限了';
  RAISE NOTICE '请刷新浏览器测试';
  RAISE NOTICE '========================================';
END $$;
