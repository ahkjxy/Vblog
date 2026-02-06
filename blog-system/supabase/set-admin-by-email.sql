-- 通过邮箱设置超级管理员
-- 使用方法：替换下面的邮箱为实际邮箱

DO $$
DECLARE
  v_email TEXT := 'ahkjxy@qq.com';  -- 替换为实际邮箱
  v_user_id UUID;
  v_family_id UUID;
  v_admin_name TEXT;
BEGIN
  -- 1. 获取用户 ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_email;
  END IF;

  -- 2. 获取用户的家庭 ID
  SELECT family_id INTO v_family_id
  FROM family_members
  WHERE user_id = v_user_id;

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'User % is not in any family', v_email;
  END IF;

  -- 3. 获取家庭 admin 的名字
  SELECT name INTO v_admin_name
  FROM profiles
  WHERE family_id = v_family_id
    AND role = 'admin'
  LIMIT 1;

  IF v_admin_name IS NULL THEN
    v_admin_name := '管理员';
  END IF;

  -- 4. 创建或更新用户的博客 profile，设置为 admin
  INSERT INTO profiles (id, name, role, family_id, balance, level, experience)
  VALUES (
    v_user_id,
    v_admin_name,
    'admin',  -- 博客系统的超级管理员
    v_family_id,
    0,
    1,
    0
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    role = 'admin',  -- 确保是 admin 角色
    family_id = EXCLUDED.family_id;

  RAISE NOTICE '✅ Super admin set successfully!';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Name: %', v_admin_name;
  RAISE NOTICE 'Family ID: %', v_family_id;
  RAISE NOTICE 'Role: admin (超级管理员)';
END $$;

-- 验证结果
SELECT 
  u.email,
  p.id as profile_id,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.role = 'admin' THEN '✅ 超级管理员'
    WHEN p.role = 'editor' THEN '编辑'
    WHEN p.role = 'author' THEN '作者'
    ELSE '未知角色'
  END as role_display
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'ahkjxy@qq.com';  -- 替换为实际邮箱
