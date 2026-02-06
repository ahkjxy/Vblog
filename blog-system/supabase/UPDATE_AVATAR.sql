-- 更新王僚原的头像
-- 从家庭积分系统同步头像 URL

-- 1. 查看当前头像设置
SELECT 
  'Current Avatar' as check_type,
  id,
  name,
  avatar_url,
  avatar_color
FROM profiles 
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';

-- 2. 查询家庭积分系统中的头像（从 families 表的 current_profile_id 对应的 profile）
SELECT 
  'Family System Avatar' as check_type,
  p.id,
  p.name,
  p.avatar_url,
  p.avatar_color
FROM profiles p
JOIN families f ON f.current_profile_id = p.id
WHERE f.id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 3. 更新博客系统的头像（使用家庭系统中王僚原的头像）
-- 方法1: 如果知道具体的头像 URL，直接更新
-- UPDATE profiles 
-- SET avatar_url = '具体的URL'
-- WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';

-- 方法2: 从家庭系统的 profile 复制头像
UPDATE profiles 
SET 
  avatar_url = (
    SELECT p.avatar_url 
    FROM profiles p
    JOIN families f ON f.current_profile_id = p.id
    WHERE f.id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  ),
  avatar_color = (
    SELECT p.avatar_color 
    FROM profiles p
    JOIN families f ON f.current_profile_id = p.id
    WHERE f.id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';

-- 4. 验证更新结果
SELECT 
  'After Update' as check_type,
  id,
  name,
  avatar_url,
  avatar_color
FROM profiles 
WHERE id = 'f9ad98b6-17ad-4c58-b6fa-b5b02d83748e';
