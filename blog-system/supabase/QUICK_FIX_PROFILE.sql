-- 快速修复：创建王僚原的 profile 记录

-- 一步完成：创建或更新 profile
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
VALUES (
  '79bba44c-f61d-4197-9e6b-4781a19d962b',
  '王僚原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 验证
SELECT 
  id,
  name,
  role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 成功！是超级管理员'
    ELSE '❌ 失败'
  END as result
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
