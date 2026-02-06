-- 第一步：查看所有现有策略
SELECT '=== CURRENT POLICIES ===' as step;

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('profiles', 'posts')
ORDER BY tablename, policyname;

-- 第二步：删除所有 posts 表的策略（如果需要重建）
-- 取消注释下面的代码来删除所有策略
/*
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON posts';
    END LOOP;
END $$;
*/

-- 第三步：只添加缺失的 profiles 策略
DO $$ 
BEGIN
    -- 删除旧的 profiles 策略
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
    
    -- 创建新的 profiles 查看策略（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone"
          ON profiles
          FOR SELECT
          TO public
          USING (true);
    END IF;
    
    -- 创建 profiles 更新策略（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
          ON profiles
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = id);
    END IF;
END $$;

-- 第四步：添加缺失的 posts 策略
DO $$ 
BEGIN
    -- 创建公开查看策略（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Published approved posts are viewable by everyone'
    ) THEN
        CREATE POLICY "Published approved posts are viewable by everyone"
          ON posts
          FOR SELECT
          TO public
          USING (
            status = 'published' 
            AND (review_status = 'approved' OR review_status IS NULL)
          );
    END IF;
    
    -- 创建管理员查看所有文章策略（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Admins can view all posts'
    ) THEN
        CREATE POLICY "Admins can view all posts"
          ON posts
          FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() 
              AND role = 'admin'
              AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
            )
          );
    END IF;
    
    -- 创建管理员更新所有文章策略（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Admins can update all posts'
    ) THEN
        CREATE POLICY "Admins can update all posts"
          ON posts
          FOR UPDATE
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() 
              AND role = 'admin'
              AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
            )
          );
    END IF;
END $$;

-- 第五步：验证策略
SELECT '=== UPDATED POLICIES ===' as step;

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('profiles', 'posts')
ORDER BY tablename, policyname;

-- 第六步：测试查询
SELECT '=== TEST QUERY ===' as step;

SELECT 
  p.id,
  p.title,
  p.status,
  p.review_status,
  pr.name as author_name,
  pr.avatar_url
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'published'
  AND (p.review_status = 'approved' OR p.review_status IS NULL)
ORDER BY p.published_at DESC
LIMIT 3;
