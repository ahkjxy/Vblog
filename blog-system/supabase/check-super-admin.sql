-- 检查超级管理员设置
-- 超级管理员 = 超级管理家庭(79ed05a1-e0e5-4d8c-9a79-d8756c488171) 的家长(role='admin')

-- 查看超级管理员家庭的所有成员
SELECT 
  id,
  name,
  role as family_role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' 
    THEN '✓ 是超级管理员（家长）'
    WHEN role = 'child' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓ 超管家庭的孩子'
    ELSE '✗ 不是超管'
  END as admin_status
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY role;

-- 查看当前登录用户的信息
SELECT 
  auth.uid() as current_user_id,
  p.name,
  p.role as family_role,
  p.family_id,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' 
    THEN '✓ 你是超级管理员'
    ELSE '✗ 你不是超级管理员'
  END as your_status
FROM profiles p
WHERE p.id = auth.uid();

-- 说明
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '超级管理员判断规则：';
  RAISE NOTICE '1. family_id = 79ed05a1-e0e5-4d8c-9a79-d8756c488171';
  RAISE NOTICE '2. role = admin (家长)';
  RAISE NOTICE '========================================';
END $$;
