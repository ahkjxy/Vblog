-- 检查王僚原的重复记录

-- 1. 查看所有王僚原的 profile 记录
SELECT 
  'All Wangliaoyuan Profiles' as check_type,
  id,
  name,
  family_id,
  role,
  created_at,
  avatar_url
FROM profiles 
WHERE name LIKE '%王僚原%' OR name LIKE '%王俊原%'
ORDER BY created_at DESC;

-- 2. 查看王俊原家庭的所有成员
SELECT 
  'Family Members' as check_type,
  p.id,
  p.name,
  p.role,
  p.family_id,
  p.created_at
FROM profiles p
WHERE p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY p.created_at DESC;

-- 3. 删除重复的王僚原记录（保留最新的那个）
-- 先查看哪个是要删除的
SELECT 
  'Profiles to Keep/Delete' as action,
  id,
  name,
  role,
  created_at,
  CASE 
    WHEN id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e' THEN '✅ 保留（这是登录用户）'
    ELSE '❌ 可以删除'
  END as recommendation
FROM profiles 
WHERE name = '王僚原' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
ORDER BY created_at DESC;

-- 4. 删除旧的重复记录（如果确认要删除）
-- DELETE FROM profiles 
-- WHERE name = '王僚原' 
--   AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
--   AND id != 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';
