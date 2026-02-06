-- 强制更新王侦原为超级管理员
-- 这个脚本会强制更新，不管当前值是什么

-- 1. 显示更新前的状态
SELECT 
  '更新前' as timing,
  id,
  name,
  role as current_role,
  family_id
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 2. 强制更新为 admin
UPDATE profiles
SET role = 'admin'
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 3. 显示更新后的状态
SELECT 
  '更新后' as timing,
  id,
  name,
  role as new_role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓✓✓ 现在是超级管理员了！'
    ELSE '还有问题，请检查'
  END as status
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 4. 验证更新是否成功
DO $$
DECLARE
  updated_role VARCHAR;
  updated_family_id UUID;
BEGIN
  SELECT role, family_id INTO updated_role, updated_family_id
  FROM profiles
  WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '验证结果：';
  RAISE NOTICE '  姓名: 王侦原';
  RAISE NOTICE '  Role: %', updated_role;
  RAISE NOTICE '  Family ID: %', updated_family_id;
  
  IF updated_role = 'admin' AND updated_family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN
    RAISE NOTICE '  状态: ✓✓✓ 超级管理员设置成功！';
  ELSE
    RAISE NOTICE '  状态: ✗ 还有问题';
    IF updated_role != 'admin' THEN
      RAISE NOTICE '  问题: role 不是 admin，是 %', updated_role;
    END IF;
    IF updated_family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN
      RAISE NOTICE '  问题: family_id 不正确';
    END IF;
  END IF;
  RAISE NOTICE '========================================';
  RAISE NOTICE '请刷新浏览器，清除缓存后重新登录';
  RAISE NOTICE '========================================';
END $$;

-- 5. 显示所有超管家庭成员
SELECT 
  name,
  role,
  CASE 
    WHEN role = 'admin' THEN '✓ 超级管理员'
    WHEN role = 'child' THEN '孩子'
    WHEN role = 'editor' THEN '编辑'
    WHEN role = 'author' THEN '作者'
    ELSE role
  END as role_display
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'editor' THEN 2
    WHEN 'author' THEN 3
    WHEN 'child' THEN 4
    ELSE 5
  END;
