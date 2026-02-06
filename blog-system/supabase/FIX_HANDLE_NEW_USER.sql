-- 修复 handle_new_user 函数以匹配实际的 profiles 表结构
-- profiles 表实际字段: id, family_id, name, balance, role, avatar_color, avatar_url, level, experience, bio, created_at
-- 注意：role 字段必须是 'admin', 'child', 'author', 'editor' 之一

-- 删除旧的触发器和函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 创建新的函数，匹配实际的 profiles 表结构
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171'; -- 默认家庭ID（超级管理员家庭）
  user_name TEXT;
  random_avatar TEXT;
BEGIN
  -- 从 raw_user_meta_data 获取用户名，如果没有则使用邮箱前缀
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- 生成随机头像 URL（使用 DiceBear API）
  random_avatar := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text;

  -- 插入到 profiles 表
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
    default_family_id,  -- 使用默认家庭ID
    user_name,          -- 使用 name 字段而不是 username
    0,                  -- 初始余额为 0
    'author',           -- 默认角色为 author（博客作者）
    '#' || lpad(to_hex((random() * 16777215)::int), 6, '0'), -- 随机颜色
    random_avatar,      -- 随机头像
    1,                  -- 初始等级为 1
    0,                  -- 初始经验为 0
    NULL                -- bio 为空
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果插入失败，记录错误但不阻止用户注册
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 验证触发器是否创建成功
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
