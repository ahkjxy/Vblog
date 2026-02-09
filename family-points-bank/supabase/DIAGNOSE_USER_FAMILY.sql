-- =====================================================
-- 诊断用户家庭关系
-- 查看当前用户是否属于目标家庭，以及是否是家长
-- =====================================================

-- 当前登录用户信息
SELECT 
  '1. 当前用户信息' as step,
  auth.uid() as current_user_id,
  p.id as profile_id,
  p.name as profile_name,
  p.family_id as user_family_id,
  p.role as user_role,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
WHERE p.id = auth.uid();

-- 目标家庭信息
SELECT 
  '2. 目标家庭信息' as step,
  id as family_id,
  name as family_name,
  created_at
FROM families
WHERE id = 'e3ff47c0-03fa-443f-823f-833c76398f0d';

-- 目标家庭的所有成员
SELECT 
  '3. 目标家庭成员' as step,
  p.id as profile_id,
  p.name as profile_name,
  p.role as profile_role,
  p.id = auth.uid() as is_current_user,
  CASE 
    WHEN p.role = 'admin' THEN '✅ 家长（可以删除）'
    ELSE '❌ 孩子（不能删除）'
  END as permission
FROM profiles p
WHERE p.family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d'
ORDER BY p.role, p.name;

-- 权限检查结果
SELECT 
  '4. 权限检查' as step,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
    THEN '❌ 用户 profile 不存在'
    
    WHEN (SELECT family_id FROM profiles WHERE id = auth.uid()) IS NULL
    THEN '❌ 用户没有 family_id'
    
    WHEN (SELECT family_id FROM profiles WHERE id = auth.uid()) != 'e3ff47c0-03fa-443f-823f-833c76398f0d'
    THEN '❌ 用户不属于目标家庭'
    
    WHEN (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin'
    THEN '❌ 用户不是家长（admin）'
    
    ELSE '✅ 用户有权限删除此家庭'
  END as permission_status,
  
  (SELECT family_id FROM profiles WHERE id = auth.uid()) as user_family_id,
  'e3ff47c0-03fa-443f-823f-833c76398f0d' as target_family_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role;

-- =====================================================
-- 解决方案
-- =====================================================

-- 如果用户不属于目标家庭，需要：
-- 1. 使用正确的家庭 ID（用户自己的 family_id）
-- 2. 或者使用 FORCE_DELETE_FAMILY.sql 强制删除

-- 如果用户不是家长，需要：
-- 1. 将用户角色改为 admin
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- 查看用户自己的家庭 ID（用于删除）
SELECT 
  '5. 用户自己的家庭' as step,
  family_id as your_family_id,
  '使用这个 ID 调用 delete_family_data' as instruction
FROM profiles
WHERE id = auth.uid();
