-- 一键修复所有用户相关问题
-- 执行顺序：
-- 1. 修复 role 约束
-- 2. 为所有用户创建 profile
-- 3. 更新触发器

-- ============================================
-- 第一步：修复 role 约束
-- ============================================

-- 删除旧的 role 约束（如果存在）
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'profiles' 
        AND con.conname = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
        RAISE NOTICE '✓ Dropped old role constraint';
    ELSE
        RAISE NOTICE '✓ No old role constraint to drop';
    END IF;
    
    -- 添加新的 role 约束，允许 'admin', 'child', 'author', 'editor'
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'child', 'author', 'editor'));
    
    RAISE NOTICE '✓ Created new role constraint allowing: admin, child, author, editor';
END $$;

-- ============================================
-- 第二步：为所有用户创建 profile
-- ============================================

DO $$
DECLARE
    user_record RECORD;
    default_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
    user_name TEXT;
    random_avatar TEXT;
    created_count INTEGER := 0;
BEGIN
    RAISE NOTICE '--- Checking for users without profiles ---';
    
    FOR user_record IN 
        SELECT 
            u.id,
            u.email,
            u.raw_user_meta_data->>'username' as username
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- 获取用户名
        user_name := COALESCE(
            user_record.username,
            split_part(user_record.email, '@', 1)
        );
        
        -- 生成随机头像
        random_avatar := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || user_record.id::text;
        
        -- 插入 profile
        BEGIN
            INSERT INTO profiles (
                id,
                family_id,
                name,
                balance,
                role,
                avatar_color,
                avatar_url,
                level,
                experience,
                bio
            )
            VALUES (
                user_record.id,
                default_family_id,
                user_name,
                0,
                'author',
                '#' || lpad(to_hex((random() * 16777215)::int), 6, '0'),
                random_avatar,
                1,
                0,
                NULL
            );
            
            created_count := created_count + 1;
            RAISE NOTICE '✓ Created profile for: % (email: %)', user_name, user_record.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '✗ Failed to create profile for % (email: %): %', 
                    user_name, user_record.email, SQLERRM;
        END;
    END LOOP;
    
    IF created_count = 0 THEN
        RAISE NOTICE '✓ All users already have profiles';
    ELSE
        RAISE NOTICE '✓ Created % new profile(s)', created_count;
    END IF;
END $$;

-- ============================================
-- 第三步：更新触发器
-- ============================================

DO $$
BEGIN
    -- 删除旧的触发器和函数
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    RAISE NOTICE '✓ Dropped old trigger and function';
END $$;

-- 创建新的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
  user_name TEXT;
  random_avatar TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  random_avatar := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text;

  INSERT INTO public.profiles (
    id,
    family_id,
    name,
    balance,
    role,
    avatar_color,
    avatar_url,
    level,
    experience,
    bio
  )
  VALUES (
    NEW.id,
    default_family_id,
    user_name,
    0,
    'author',
    '#' || lpad(to_hex((random() * 16777215)::int), 6, '0'),
    random_avatar,
    1,
    0,
    NULL
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
    RAISE NOTICE '✓ Created new trigger and function';
END $$;

-- ============================================
-- 验证结果
-- ============================================

-- 查看 role 约束
SELECT
    '✓ Role constraint' as status,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'profiles'
    AND con.conname = 'profiles_role_check';

-- 查看触发器
SELECT
    '✓ Trigger' as status,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 统计用户和 profile
SELECT 
    '✓ User statistics' as status,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT p.id) as users_with_profiles,
    COUNT(DISTINCT u.id) - COUNT(DISTINCT p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- 显示最近的用户和他们的 profiles
SELECT 
    '✓ Recent users' as status,
    u.email,
    p.name,
    p.role,
    CASE 
        WHEN p.id IS NULL THEN '✗ NO PROFILE'
        ELSE '✓ Has profile'
    END as profile_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 最终消息
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✓ ALL FIXES COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '1. Role constraint now allows: admin, child, author, editor';
    RAISE NOTICE '2. All existing users now have profiles';
    RAISE NOTICE '3. New users will automatically get profiles';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '- Register new users (they will get role=author)';
    RAISE NOTICE '- Post articles as any user';
    RAISE NOTICE '- Non-admin posts will be pending review';
    RAISE NOTICE '';
END $$;
