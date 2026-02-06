-- 步骤 3：为现有的孤立用户创建 profile 和 family

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

-- 验证结果
SELECT 
  'VERIFICATION' as status,
  au.email,
  p.name as profile_name,
  f.name as family_name,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN families f ON f.id = p.family_id
ORDER BY au.created_at DESC
LIMIT 20;
