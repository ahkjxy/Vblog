-- 修复自动注册函数，确保每个用户创建自己的家庭

-- 1. 删除旧的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除旧的函数
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. 创建新的函数，为每个新用户创建独立的家庭
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_family_id UUID;
  v_user_name TEXT;
BEGIN
  -- 从 email 或 metadata 中获取用户名
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- 为新用户创建一个家庭
  INSERT INTO public.families (name)
  VALUES (v_user_name || '的家庭')
  RETURNING id INTO v_family_id;
  
  -- 创建用户的 profile，关联到新创建的家庭
  INSERT INTO public.profiles (id, family_id, name, role)
  VALUES (
    NEW.id,
    v_family_id,
    v_user_name,
    'parent'  -- 默认角色为家长
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果出错，记录日志但不阻止用户注册
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 验证函数是否创建成功
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 6. 验证触发器是否创建成功
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
