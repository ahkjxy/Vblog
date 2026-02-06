-- 快速设置超级管理员
-- 最简单的方法：直接更新 role

-- 方法 1: 通过邮箱设置
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ahkjxy@qq.com'
);

-- 验证结果
SELECT 
  u.email,
  p.name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ 超级管理员'
    WHEN p.role = 'editor' THEN '编辑'
    WHEN p.role = 'author' THEN '作者'
    ELSE '未知'
  END as role_display
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'ahkjxy@qq.com';

-- 如果 profile 不存在，先创建
INSERT INTO profiles (id, name, role, family_id)
SELECT 
  u.id,
  COALESCE(
    (SELECT name FROM profiles WHERE family_id = fm.family_id AND role = 'admin' LIMIT 1),
    '管理员'
  ),
  'admin',
  fm.family_id
FROM auth.users u
JOIN family_members fm ON fm.user_id = u.id
WHERE u.email = 'ahkjxy@qq.com'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 再次验证
SELECT 
  u.email,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.role = 'admin' THEN '✅ 超级管理员'
    WHEN p.role = 'editor' THEN '编辑'
    WHEN p.role = 'author' THEN '作者'
    ELSE '未知'
  END as role_display
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'ahkjxy@qq.com';
