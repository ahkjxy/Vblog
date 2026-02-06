-- 修复现有用户的家庭归属问题
-- 为每个用户创建独立的家庭（除了超级管理员）

DO $$
DECLARE
  v_admin_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
  v_admin_profile_id UUID;
  v_profile RECORD;
  v_new_family_id UUID;
BEGIN
  -- 1. 找到超级管理员的 profile ID
  SELECT id INTO v_admin_profile_id
  FROM profiles
  WHERE family_id = v_admin_family_id
    AND role = 'super_admin'
  LIMIT 1;
  
  RAISE NOTICE '超级管理员 Profile ID: %', v_admin_profile_id;
  
  -- 2. 为所有非管理员用户创建独立的家庭
  FOR v_profile IN 
    SELECT 
      p.id,
      p.name,
      p.family_id,
      p.role
    FROM profiles p
    WHERE p.id != v_admin_profile_id  -- 排除超级管理员
      AND p.role != 'super_admin'      -- 排除超级管理员角色
    ORDER BY p.created_at
  LOOP
    RAISE NOTICE '处理用户: % (ID: %, 当前家庭: %)', v_profile.name, v_profile.id, v_profile.family_id;
    
    -- 检查这个用户是否已经有自己的家庭（是该家庭的唯一成员）
    DECLARE
      v_family_member_count INT;
      v_is_own_family BOOLEAN := FALSE;
    BEGIN
      -- 统计当前家庭的成员数
      SELECT COUNT(*) INTO v_family_member_count
      FROM profiles
      WHERE family_id = v_profile.family_id;
      
      -- 如果这个家庭只有这一个成员，说明已经是独立家庭
      IF v_family_member_count = 1 THEN
        v_is_own_family := TRUE;
        RAISE NOTICE '  -> 用户已有独立家庭，跳过';
      END IF;
      
      -- 如果不是独立家庭，创建新家庭
      IF NOT v_is_own_family THEN
        -- 创建新家庭
        INSERT INTO families (name)
        VALUES (v_profile.name || '的家庭')
        RETURNING id INTO v_new_family_id;
        
        RAISE NOTICE '  -> 创建新家庭: % (ID: %)', v_profile.name || '的家庭', v_new_family_id;
        
        -- 更新用户的 family_id
        UPDATE profiles
        SET family_id = v_new_family_id
        WHERE id = v_profile.id;
        
        RAISE NOTICE '  -> 已将用户移动到新家庭';
      END IF;
    END;
  END LOOP;
  
  -- 3. 显示最终结果
  RAISE NOTICE '=== 修复完成 ===';
  RAISE NOTICE '家庭统计:';
  
  FOR v_profile IN
    SELECT 
      f.id as family_id,
      f.name as family_name,
      COUNT(p.id) as member_count,
      STRING_AGG(p.name || ' (' || p.role || ')', ', ') as members
    FROM families f
    LEFT JOIN profiles p ON p.family_id = f.id
    GROUP BY f.id, f.name
    ORDER BY member_count DESC
  LOOP
    RAISE NOTICE '家庭: % - 成员数: % - 成员: %', 
      v_profile.family_name, 
      v_profile.member_count, 
      v_profile.members;
  END LOOP;
END $$;

-- 验证结果
SELECT 
  f.name as family_name,
  COUNT(p.id) as member_count,
  STRING_AGG(p.name || ' (' || p.role || ')', ', ') as members
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
GROUP BY f.id, f.name
ORDER BY member_count DESC;
