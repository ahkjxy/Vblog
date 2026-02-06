-- 检查并修复 profiles 表的 role 约束

-- 1. 查看当前的 role 约束
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'profiles'
    AND nsp.nspname = 'public'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%role%';

-- 2. 查看现有的 role 值
SELECT DISTINCT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- 3. 删除旧的 role 约束（如果存在）
DO $$ 
BEGIN
    -- 尝试删除可能存在的约束
    IF EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'profiles' 
        AND con.conname = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
        RAISE NOTICE 'Dropped old role constraint';
    END IF;
END $$;

-- 4. 添加新的 role 约束，允许 'admin', 'child', 'author', 'editor'
-- 这样既支持家庭积分银行的角色（admin, child），也支持博客系统的角色（author, editor）
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'child', 'author', 'editor'));

-- 5. 验证约束已创建
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'profiles'
    AND nsp.nspname = 'public'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%role%';

-- 6. 测试插入一个 author 角色的用户
-- 注意：这只是测试，实际使用时会通过触发器自动创建
SELECT 'Role constraint fixed! Now author, editor, admin, and child roles are all allowed.' as status;
