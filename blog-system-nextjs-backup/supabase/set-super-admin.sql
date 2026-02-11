-- 设置超级管理员
-- 将家庭 admin 设置为博客系统的超级管理员

-- 1. 获取家庭 ID 对应的 admin profile
DO $$
DECLARE
  v_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
  v_admin_profile_id UUID;
  v_admin_name TEXT;
  v_user_id UUID;
BEGIN
  -- 获取家庭的 admin profile
  SELECT id, name INTO v_admin_profile_id, v_admin_name
  FROM profiles
  WHERE family_id = v_family_id
    AND role = 'admin'
  LIMIT 1;

  -- 获取关联的 user_id
  SELECT user_id INTO v_user_id
  FROM family_members
  WHERE family_id = v_family_id
  LIMIT 1;

  IF v_admin_profile_id IS NULL THEN
    RAISE EXCEPTION 'No admin profile found for family %', v_family_id;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found for family %', v_family_id;
  END IF;

  -- 为这个用户创建或更新博客系统的 profile
  INSERT INTO profiles (id, name, role, family_id, avatar_url, avatar_color, balance, level, experience)
  VALUES (
    v_user_id,
    v_admin_name,
    'admin',  -- 博客系统的 admin 角色
    v_family_id,
    (SELECT avatar_url FROM profiles WHERE id = v_admin_profile_id),
    (SELECT avatar_color FROM profiles WHERE id = v_admin_profile_id),
    (SELECT balance FROM profiles WHERE id = v_admin_profile_id),
    (SELECT level FROM profiles WHERE id = v_admin_profile_id),
    (SELECT experience FROM profiles WHERE id = v_admin_profile_id)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    role = 'admin',  -- 确保是 admin 角色
    family_id = EXCLUDED.family_id,
    avatar_url = EXCLUDED.avatar_url,
    avatar_color = EXCLUDED.avatar_color,
    balance = EXCLUDED.balance,
    level = EXCLUDED.level,
    experience = EXCLUDED.experience;

  RAISE NOTICE 'Super admin set successfully!';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Admin Name: %', v_admin_name;
  RAISE NOTICE 'Family ID: %', v_family_id;
END $$;

-- 2. 验证设置
SELECT 
  u.id as user_id,
  u.email,
  p.name,
  p.role as blog_role,
  p.family_id,
  p_admin.name as family_admin_name,
  p_admin.role as family_role
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN profiles p_admin ON p_admin.family_id = p.family_id AND p_admin.role = 'admin'
WHERE p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
