-- 检查当前用户并创建 profile（如果不存在）

-- 1. 查看所有 auth.users（不包含敏感信息）
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'username' as username_from_metadata
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. 查看所有 profiles
SELECT 
    id,
    family_id,
    name,
    role,
    avatar_url,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. 找出没有 profile 的用户
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'username' as username
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. 为所有没有 profile 的用户创建 profile
DO $$
DECLARE
    user_record RECORD;
    default_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
    user_name TEXT;
    random_avatar TEXT;
BEGIN
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
            
            RAISE NOTICE 'Created profile for user: % (email: %)', user_record.id, user_record.email;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to create profile for user % (email: %): %', 
                    user_record.id, user_record.email, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. 验证所有用户都有 profile
SELECT 
    COUNT(*) as total_users,
    COUNT(p.id) as users_with_profiles,
    COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- 6. 再次查看没有 profile 的用户（应该为空）
SELECT 
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
