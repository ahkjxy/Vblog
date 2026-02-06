-- 为博客系统创建 profile（使用博客系统的表结构）

-- 博客系统的 profiles 表字段：
-- - id (UUID)
-- - username (VARCHAR)
-- - email (VARCHAR)
-- - bio (TEXT)
-- - avatar_url (TEXT)
-- - role (VARCHAR: 'admin', 'editor', 'author')
-- - created_at, updated_at

-- 为 ahkixy@qq.com 创建博客系统的 profile
INSERT INTO profiles (
  id,
  username,
  email,
  role,
  bio
)
SELECT 
  id,
  '王僚原',  -- username 显示为王僚原
  email,
  'admin',   -- 超级管理员
  '超级管理员'
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  username = '王僚原',
  role = 'admin',
  bio = '超级管理员';

-- 验证
SELECT 
  u.email as 登录邮箱,
  p.username as 显示名字,
  p.role as 角色,
  p.bio as 简介,
  CASE 
    WHEN p.role = 'admin'
    THEN '✅ 成功！王僚原是超级管理员'
    ELSE '❌ 失败'
  END as 状态
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahkixy@qq.com';
