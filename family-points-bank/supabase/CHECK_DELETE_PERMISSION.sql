-- =====================================================
-- 检查删除家庭数据的权限
-- =====================================================

-- 1. 查看当前登录用户信息
SELECT 
  'Current User Info' as info_type,
  auth.uid() as user_id,
  p.id as profile_id,
  p.name as profile_name,
  p.family_id as user_family_id,
  p.role as user_role,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
WHERE p.id = auth.uid();

-- 2. 查看目标家庭信息
SELECT 
  'Target Family Info' as info_type,
  id as family_id,
  name as family_name,
  created_at
FROM families
WHERE id = 'e3ff47c0-03fa-443f-823f-833c76398f0d';

-- 3. 查看目标家庭的所有成员
SELECT 
  'Target Family Members' as info_type,
  p.id as profile_id,
  p.name as profile_name,
  p.role as profile_role,
  p.family_id,
  p.id = auth.uid() as is_current_user
FROM profiles p
WHERE p.family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d'
ORDER BY p.role, p.name;

-- 4. 检查权限
SELECT 
  'Permission Check' as info_type,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
    THEN '❌ User profile not found'
    WHEN (SELECT family_id FROM profiles WHERE id = auth.uid()) IS NULL
    THEN '❌ User has no family_id'
    WHEN (SELECT family_id FROM profiles WHERE id = auth.uid()) != 'e3ff47c0-03fa-443f-823f-833c76398f0d'
    THEN '❌ User family_id does not match target family_id'
    WHEN (SELECT role FROM profiles WHERE id = auth.uid() AND family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d') != 'admin'
    THEN '❌ User is not admin of target family'
    ELSE '✅ User has permission to delete'
  END as permission_status,
  (SELECT family_id FROM profiles WHERE id = auth.uid()) as user_family_id,
  'e3ff47c0-03fa-443f-823f-833c76398f0d' as target_family_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as user_role;

-- 5. 查看目标家庭的数据统计
SELECT 
  'Target Family Data Stats' as info_type,
  (SELECT COUNT(*) FROM profiles WHERE family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d') as profiles_count,
  (SELECT COUNT(*) FROM transactions WHERE family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d') as transactions_count,
  (SELECT COUNT(*) FROM tasks WHERE family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d') as tasks_count,
  (SELECT COUNT(*) FROM rewards WHERE family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d') as rewards_count;

-- =====================================================
-- 解决方案
-- =====================================================

-- 如果当前用户不属于目标家庭，有以下几种解决方案：

-- 方案 1: 更新当前用户的 family_id（如果这是你的家庭）
-- UPDATE profiles 
-- SET family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d'
-- WHERE id = auth.uid();

-- 方案 2: 使用超级管理员权限删除（需要修改函数）
-- 见下方的 FORCE_DELETE_FAMILY_DATA 函数

-- 方案 3: 直接在 SQL Editor 中删除（绕过权限检查）
-- 见下方的直接删除脚本
