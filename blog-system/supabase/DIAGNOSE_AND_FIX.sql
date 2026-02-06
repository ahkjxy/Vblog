-- 诊断并修复王侦原的角色问题

-- ============================================
-- 第 1 步：诊断 - 查看当前状态
-- ============================================

\echo '========================================';
\echo '第 1 步：诊断当前状态';
\echo '========================================';

-- 查看王侦原的完整信息
SELECT 
  id,
  name,
  role,
  family_id,
  balance,
  level,
  experience,
  created_at
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 查看所有超管家庭成员
SELECT 
  '超管家庭成员' as category,
  name,
  role,
  id
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY role;

-- ============================================
-- 第 2 步：修复 - 强制更新为 admin
-- ============================================

\echo '';
\echo '========================================';
\echo '第 2 步：强制更新为 admin';
\echo '========================================';

UPDATE profiles
SET role = 'admin'
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b'
RETURNING id, name, role, family_id;

-- ============================================
-- 第 3 步：验证 - 确认更新成功
-- ============================================

\echo '';
\echo '========================================';
\echo '第 3 步：验证更新结果';
\echo '========================================';

SELECT 
  name,
  role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✓✓✓ 超级管理员设置成功！'
    WHEN role != 'admin'
    THEN '✗ role 不是 admin，是: ' || role
    WHEN family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✗ family_id 不正确'
    ELSE '✗ 未知问题'
  END as verification_result
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- ============================================
-- 第 4 步：检查是否有其他问题
-- ============================================

\echo '';
\echo '========================================';
\echo '第 4 步：检查其他可能的问题';
\echo '========================================';

-- 检查是否有重复的 profile
SELECT 
  COUNT(*) as profile_count,
  name
FROM profiles
WHERE name = '王侦原'
GROUP BY name;

-- 检查 auth.users 表
SELECT 
  'auth.users 中的用户' as source,
  id,
  email,
  created_at
FROM auth.users
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- ============================================
-- 第 5 步：最终确认
-- ============================================

\echo '';
\echo '========================================';
\echo '第 5 步：最终确认';
\echo '========================================';

DO $$
DECLARE
  v_role VARCHAR;
  v_family_id UUID;
  v_name VARCHAR;
BEGIN
  SELECT role, family_id, name 
  INTO v_role, v_family_id, v_name
  FROM profiles
  WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '最终确认结果：';
  RAISE NOTICE '========================================';
  RAISE NOTICE '姓名: %', v_name;
  RAISE NOTICE 'Role: %', v_role;
  RAISE NOTICE 'Family ID: %', v_family_id;
  RAISE NOTICE '';
  
  IF v_role = 'admin' AND v_family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN
    RAISE NOTICE '✓✓✓ 成功！王侦原现在是超级管理员！';
    RAISE NOTICE '';
    RAISE NOTICE '下一步操作：';
    RAISE NOTICE '1. 刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R）';
    RAISE NOTICE '2. 清除浏览器缓存';
    RAISE NOTICE '3. 重新登录';
    RAISE NOTICE '4. 检查用户管理页面，应该显示"超级管理员"';
  ELSE
    RAISE NOTICE '✗ 还有问题！';
    IF v_role != 'admin' THEN
      RAISE NOTICE '  问题: role 应该是 admin，但是 %', v_role;
    END IF;
    IF v_family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN
      RAISE NOTICE '  问题: family_id 不正确';
    END IF;
  END IF;
  RAISE NOTICE '========================================';
END $$;
