-- 为没有家庭的用户创建家庭

DO $$
DECLARE
  v_profile RECORD;
  v_family_id UUID;
BEGIN
  -- 遍历所有没有 family_id 的 profiles
  FOR v_profile IN 
    SELECT 
      p.id,
      p.name,
      au.email
    FROM profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE p.family_id IS NULL
    ORDER BY p.created_at
  LOOP
    RAISE NOTICE '处理用户: % (ID: %, Email: %)', v_profile.name, v_profile.id, v_profile.email;
    
    -- 为该用户创建家庭
    INSERT INTO families (name)
    VALUES (v_profile.name || '的家庭')
    RETURNING id INTO v_family_id;
    
    RAISE NOTICE '  -> 创建家庭: % (ID: %)', v_profile.name || '的家庭', v_family_id;
    
    -- 更新 profile 的 family_id
    UPDATE profiles
    SET family_id = v_family_id
    WHERE id = v_profile.id;
    
    RAISE NOTICE '  -> 已关联用户到家庭';
  END LOOP;
  
  -- 显示修复结果
  RAISE NOTICE '=== 修复完成 ===';
  RAISE NOTICE '所有用户及其家庭:';
  
  FOR v_profile IN
    SELECT 
      p.name as profile_name,
      f.name as family_name,
      p.role,
      p.created_at
    FROM profiles p
    LEFT JOIN families f ON f.id = p.family_id
    ORDER BY p.created_at DESC
  LOOP
    RAISE NOTICE '用户: % - 家庭: % - 角色: %', 
      v_profile.profile_name, 
      COALESCE(v_profile.family_name, '无家庭'), 
      v_profile.role;
  END LOOP;
END $$;

-- 验证结果
SELECT 
  p.name as profile_name,
  f.name as family_name,
  p.role,
  p.created_at
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
ORDER BY p.created_at DESC;
