-- 打印所有用户信息和家庭信息

-- 1. 当前登录用户的 auth.users 信息
SELECT 
  '=== AUTH.USERS 信息 ===' as section,
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'ahkixy@qq.com';

-- 2. profiles 表结构
SELECT 
  '=== PROFILES 表结构 ===' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. 当前用户的 profile 信息（如果存在）
SELECT 
  '=== PROFILES 数据 ===' as section,
  p.*
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'ahkixy@qq.com';

-- 4. families 表结构（如果存在）
SELECT 
  '=== FAMILIES 表结构 ===' as section,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'families'
ORDER BY ordinal_position;

-- 5. family_members 表结构（如果存在）
SELECT 
  '=== FAMILY_MEMBERS 表结构 ===' as section,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'family_members'
ORDER BY ordinal_position;

-- 6. 当前用户的 family_members 信息（如果存在）
SELECT 
  '=== FAMILY_MEMBERS 数据 ===' as section,
  fm.*
FROM family_members fm
JOIN auth.users u ON fm.user_id = u.id
WHERE u.email = 'ahkixy@qq.com';

-- 7. 当前用户所属家庭的信息（如果存在）
SELECT 
  '=== FAMILIES 数据 ===' as section,
  f.*
FROM families f
JOIN family_members fm ON f.id = fm.family_id
JOIN auth.users u ON fm.user_id = u.id
WHERE u.email = 'ahkixy@qq.com';

-- 8. 当前用户家庭的所有成员（如果存在）
SELECT 
  '=== 家庭所有成员 ===' as section,
  p.id,
  p.name,
  p.role,
  fm.role as family_role,
  u.email
FROM family_members fm
JOIN profiles p ON fm.user_id = p.id
JOIN auth.users u ON p.id = u.id
WHERE fm.family_id IN (
  SELECT family_id 
  FROM family_members fm2
  JOIN auth.users u2 ON fm2.user_id = u2.id
  WHERE u2.email = 'ahkixy@qq.com'
);

-- 9. 所有表名
SELECT 
  '=== 所有表 ===' as section,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 10. 所有用户的 profiles（前5条）
SELECT 
  '=== 所有 PROFILES（前5条）===' as section,
  p.*,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
LIMIT 5;
