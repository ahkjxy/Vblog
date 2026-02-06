-- 修复家庭名称：王僚原 -> 王僚原

-- 1. 查看当前家庭名称
SELECT 
  'Current Family Name' as check_type,
  id,
  name,
  created_at
FROM families
WHERE id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 2. 更新家庭名称
UPDATE families
SET name = '王僚原'
WHERE id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 3. 验证更新结果
SELECT 
  'After Update' as check_type,
  id,
  name,
  created_at
FROM families
WHERE id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
