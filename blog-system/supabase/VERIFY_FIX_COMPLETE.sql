-- 验证修复是否完成

-- 1. 查看所有用户及其家庭（最近 20 个）
SELECT 
  '1. 所有用户及其家庭' as section,
  au.email,
  p.name as profile_name,
  f.name as family_name,
  p.role,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN families f ON f.id = p.family_id
ORDER BY au.created_at DESC
LIMIT 20;

-- 2. 统计信息
SELECT 
  '2. 统计信息' as section,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_profiles,
  (SELECT COUNT(*) FROM profiles WHERE role = 'child') as child_profiles,
  (SELECT COUNT(*) FROM families) as total_families,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON p.id = au.id WHERE p.id IS NULL) as orphaned_users;

-- 3. 检查是否所有 auth.users 都有对应的 profile
SELECT 
  '3. 孤立用户检查' as section,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 所有用户都有 profile'
    ELSE '❌ 还有 ' || COUNT(*) || ' 个孤立用户'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 4. 检查是否所有 profile 都有家庭
SELECT 
  '4. 家庭关联检查' as section,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 所有 profile 都有家庭'
    ELSE '❌ 还有 ' || COUNT(*) || ' 个 profile 没有家庭'
  END as status
FROM profiles p
WHERE p.family_id IS NULL;

-- 5. 检查触发器状态
SELECT 
  '5. 触发器状态' as section,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 触发器已创建'
    ELSE '❌ 触发器不存在'
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 6. 检查函数状态
SELECT 
  '6. 函数状态' as section,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 函数已创建'
    ELSE '❌ 函数不存在'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';
