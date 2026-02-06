-- 步骤 2：修复触发器和函数

-- 1. 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除旧的函数
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. 创建新的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_family_id UUID;
  v_user_name TEXT;
BEGIN
  -- 从 metadata 或 email 中获取用户名
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- 为新用户创建一个家庭
  INSERT INTO public.families (name)
  VALUES (v_user_name || '的家庭')
  RETURNING id INTO v_family_id;
  
  -- 创建用户的 profile，关联到新创建的家庭
  INSERT INTO public.profiles (
    id, 
    family_id, 
    name, 
    role
  )
  VALUES (
    NEW.id,
    v_family_id,
    v_user_name,
    'parent'
  );
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止用户注册
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. 验证
SELECT 'Trigger created successfully' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Function created successfully' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';
