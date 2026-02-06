-- 检查所有家庭成员的数据

-- 1. 查看所有 profiles 及其角色
SELECT 
  'All Profiles' as check_type,
  p.id,
  p.name,
  p.role,
  p.family_id,
  f.name as family_name,
  CASE 
    WHEN p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171' THEN '超管家庭'
    ELSE '普通家庭'
  END as family_type
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
ORDER BY p.family_id, p.created_at;

-- 2. 按家庭分组统计
SELECT 
  'Family Summary' as check_type,
  f.name as family_name,
  f.id as family_id,
  COUNT(p.id) as member_count,
  STRING_AGG(p.name || ' (' || p.role || ')', ', ') as members
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
GROUP BY f.id, f.name
ORDER BY f.name;

-- 3. 查看所有孩子（role='child'）
SELECT 
  'All Children' as check_type,
  p.id,
  p.name,
  p.role,
  p.family_id,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
WHERE p.role = 'child'
ORDER BY f.name, p.name;

-- 4. 查看所有家长（role='admin' 或 role='owner'）
SELECT 
  'All Parents' as check_type,
  p.id,
  p.name,
  p.role,
  p.family_id,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON f.id = p.family_id
WHERE p.role IN ('admin', 'owner')
ORDER BY f.name, p.name;
