-- 紧急修复：用户注册后数据库中查不到用户
-- 这个脚本会诊断问题并修复触发器

-- ============================================
-- 第一部分：诊断当前状态
-- ============================================

-- 1. 查看所有 auth.users（包括刚注册的用户）
SELECT 
  'AUTH USERS' as table_name,
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. 查看所有 profiles
SELECT 
  'PROFILES' as table_name,
  id,
  name,
  family_id,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. 查找在 auth.users 中存在但 profiles 中不存在的用户
SELECT 
  'MISSING PROFILES' as issue,
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 4. 查看触发器状态
SELECT 
  'TRIGGER STATUS' as info,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. 查看函数定义
SELECT 
  'FUNCTION STATUS' as info,
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- ============================================
-- 第二部分：删除并重建触发器和函数
-- ============================================

-- 1. 删除旧的触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除旧的函数（如果存在）
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. 创建新的函数（带详细日志）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_family_id UUID;
  v_user_name TEXT;
  v_email TEXT;
BEGIN
  -- 记录开始
  RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
  
  -- 获取邮箱
  v_email := NEW.email;
  
  -- 从 metadata 或 email 中获取用户名
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  RAISE LOG 'User name determined: %', v_user_name;
  
  -- 为新用户创建一个家庭
  INSERT INTO public.families (name)
  VALUES (v_user_name || '的家庭')
  RETURNING id INTO v_family_id;
  
  RAISE LOG 'Family created with ID: %', v_family_id;
  
  -- 创建用户的 profile，关联到新创建的家庭
  INSERT INTO public.profiles (
    id, 
    family_id, 
    name, 
    role,
    created_at
  )
  VALUES (
    NEW.id,
    v_family_id,
    v_user_name,
    'parent',  -- 默认角色为家长
    NOW()
  );
  
  RAISE LOG 'Profile created for user: % with family: %', NEW.id, v_family_id;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- 记录详细错误信息
    RAISE WARNING 'Error in handle_new_user for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
    RAISE LOG 'Error details: %', SQLERRM;
    -- 即使出错也返回 NEW，不阻止用户注册
    RETURN NEW;
END;
$$;

-- 4. 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. 验证触发器和函数
SELECT 
  'VERIFICATION' as status,
  'Trigger created' as message
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 
  'VERIFICATION' as status,
  'Function created' as message
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- ============================================
-- 第三部分：为现有的孤立用户创建 profile 和 family
-- ============================================

DO $$
DECLARE
  v_user RECORD;
  v_family_id UUID;
  v_user_name TEXT;
  v_count INT := 0;
BEGIN
  RAISE NOTICE '=== 开始修复孤立用户 ===';
  
  -- 遍历所有在 auth.users 中存在但 profiles 中不存在的用户
  FOR v_user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data,
      au.created_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE p.id IS NULL
    ORDER BY au.created_at
  LOOP
    v_count := v_count + 1;
    
    -- 获取用户名
    v_user_name := COALESCE(
      v_user.raw_user_meta_data->>'name',
      v_user.raw_user_meta_data->>'username',
      v_user.raw_user_meta_data->>'full_name',
      split_part(v_user.email, '@', 1)
    );
    
    RAISE NOTICE '处理用户 %: % (Email: %)', v_count, v_user_name, v_user.email;
    
    -- 创建家庭
    INSERT INTO public.families (name, created_at)
    VALUES (v_user_name || '的家庭', v_user.created_at)
    RETURNING id INTO v_family_id;
    
    RAISE NOTICE '  -> 创建家庭: % (ID: %)', v_user_name || '的家庭', v_family_id;
    
    -- 创建 profile
    INSERT INTO public.profiles (
      id,
      family_id,
      name,
      role,
      created_at
    )
    VALUES (
      v_user.id,
      v_family_id,
      v_user_name,
      'parent',
      v_user.created_at
    );
    
    RAISE NOTICE '  -> 创建 profile: % (Role: parent)', v_user_name;
  END LOOP;
  
  IF v_count = 0 THEN
    RAISE NOTICE '没有发现孤立用户';
  ELSE
    RAISE NOTICE '=== 修复完成，共处理 % 个用户 ===', v_count;
  END IF;
END $$;

-- ============================================
-- 第四部分：最终验证
-- ============================================

-- 1. 再次检查是否还有孤立用户
SELECT 
  'FINAL CHECK' as status,
  COUNT(*) as orphaned_users_count
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 2. 显示所有用户及其家庭
SELECT 
  'ALL USERS' as status,
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

-- 3. 统计信息
SELECT 
  'STATISTICS' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM families) as total_families,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON p.id = au.id WHERE p.id IS NULL) as orphaned_users;

RAISE NOTICE '=== 修复脚本执行完成 ===';
RAISE NOTICE '请检查上面的输出，确认所有用户都有 profile 和 family';
RAISE NOTICE '如果还有问题，请查看 Supabase Logs 中的详细日志';
