-- 检查王侦原的实际 role 值

SELECT 
  id,
  name,
  role,
  family_id,
  created_at
FROM profiles
WHERE name = '王侦原' OR id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 如果 role 不是 'admin'，显示当前值
DO $$
DECLARE
  current_role VARCHAR;
BEGIN
  SELECT role INTO current_role
  FROM profiles
  WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '王侦原当前的 role: %', current_role;
  
  IF current_role = 'admin' THEN
    RAISE NOTICE '✓ role 已经是 admin';
  ELSE
    RAISE NOTICE '✗ role 是 %, 需要改为 admin', current_role;
  END IF;
  RAISE NOTICE '========================================';
END $$;
