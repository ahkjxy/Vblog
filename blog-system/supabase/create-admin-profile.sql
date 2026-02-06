-- 为用户创建 admin profile
-- 这个脚本会：
-- 1. 检查用户是否存在
-- 2. 获取家庭信息
-- 3. 创建 profile 并设置为 admin

DO $$
DECLARE
  v_email TEXT := 'ahkjxy@qq.com';  -- 用户邮箱
  v_user_id UUID;
  v_family_id UUID;
  v_admin_name TEXT;
  v_avatar_color TEXT;
BEGIN
  -- 1. 获取用户 ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ User with email % not found', v_email;
  END IF;

  RAISE NOTICE '✅ Found user: %', v_user_id;

  -- 2. 获取用户的家庭 ID
  SELECT family_id INTO v_family_id
  FROM family_members
  WHERE user_id = v_user_id;

  IF v_family_id IS NULL THEN
    RAISE NOTICE '⚠️  User is not in any family, will create profile without family_id';
  ELSE
    RAISE NOTICE '✅ Found family: %', v_family_id;
    
    -- 3. 获取家庭 admin 的名字和头像颜色
    SELECT name, avatar_color INTO v_admin_name, v_avatar_color
    FROM profiles
    WHERE family_id = v_family_id
      AND role = 'admin'
    LIMIT 1;
    
    IF v_admin_name IS NOT NULL THEN
      RAISE NOTICE '✅ Found family admin name: %', v_admin_name;
    END IF;
  END IF;

  -- 4. 设置默认值
  IF v_admin_name IS NULL THEN
    v_admin_name := '王僚原';  -- 默认名字
  END IF;
  
  IF v_avatar_color IS NULL THEN
    v_avatar_color := '#FF4D94';  -- 默认颜色
  END IF;

  -- 5. 创建或更新 profile
  INSERT INTO profiles (
    id, 
    name, 
    role, 
    family_id, 
    avatar_color, 
    balance, 
    level, 
    experience
  )
  VALUES (
    v_user_id,
    v_admin_name,
    'admin',  -- 博客超级管理员
    v_family_id,
    v_avatar_color,
    0,
    1,
    0
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    role = 'admin',  -- 确保是 admin
    family_id = EXCLUDED.family_id,
    avatar_color = EXCLUDED.avatar_color;

  RAISE NOTICE '✅ Profile created/updated successfully!';
  RAISE NOTICE '📧 Email: %', v_email;
  RAISE NOTICE '👤 Name: %', v_admin_name;
  RAISE NOTICE '🎨 Color: %', v_avatar_color;
  RAISE NOTICE '👑 Role: admin (超级管理员)';
  RAISE NOTICE '🏠 Family: %', COALESCE(v_family_id::TEXT, 'None');
END $$;

-- 验证结果
SELECT 
  u.email,
  p.id as profile_id,
  p.name,
  p.role,
  p.family_id,
  p.avatar_color,
  p.balance,
  CASE 
    WHEN p.role = 'admin' THEN '✅ 超级管理员'
    WHEN p.role = 'editor' THEN '📝 编辑'
    WHEN p.role = 'author' THEN '✍️ 作者'
    ELSE '❓ 未知角色'
  END as role_display
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'ahkjxy@qq.com';
