# 修复自动注册功能

## 问题原因

博客系统的 `handle_new_user()` 触发器函数与实际的 profiles 表结构不匹配：

### 触发器尝试插入的字段（错误）：
```sql
INSERT INTO public.profiles (id, username, email)
```

### 实际 profiles 表的字段（正确）：
```
id, family_id, name, balance, role, avatar_color, avatar_url, level, experience, bio, created_at
```

**问题**: 触发器试图插入 `username` 和 `email` 字段，但这两个字段在实际的 profiles 表中不存在（因为博客系统与家庭积分银行共享同一个数据库）。

这导致新用户注册时，`auth.users` 表中创建了用户，但触发器执行失败，`profiles` 表中没有创建对应的记录。Supabase 返回"User already registered"错误，但实际上用户无法登录。

## 解决方案

### 步骤 1: 执行修复 SQL

在 Supabase SQL Editor 中执行以下文件：

```
blog-system/supabase/FIX_HANDLE_NEW_USER.sql
```

这个脚本会：
1. 删除旧的触发器和函数
2. 创建新的函数，匹配实际的 profiles 表结构
3. 重新创建触发器

### 步骤 2: 验证修复

执行测试脚本：

```
blog-system/supabase/TEST_AUTO_REGISTRATION.sql
```

检查：
- 触发器是否存在
- 函数定义是否正确
- profiles 表结构

### 步骤 3: 清理失败的注册

如果之前有注册失败的用户（在 auth.users 中存在但 profiles 中不存在），需要清理：

```sql
-- 查找孤立的用户
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 删除孤立的用户（可选，如果需要重新注册）
-- 注意：这会永久删除用户，请谨慎操作
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
);
```

### 步骤 4: 测试自动注册

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 使用一个新邮箱尝试登录
4. 查看控制台日志：
   - "登录尝试:" - 应该显示 "Invalid login credentials"
   - "尝试注册新用户..." - 应该出现
   - "注册尝试:" - 应该显示成功，包含 session 或 user 数据
   - 应该显示 "注册并登录成功，欢迎加入元气银行博客!"

## 新的触发器逻辑

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
  user_name TEXT;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id,
    family_id,
    name,
    balance,
    role,
    avatar_color,
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
```

### 关键改进：

1. **使用 `name` 字段**: 而不是 `username` 和 `email`
2. **设置默认 `family_id`**: 使用超级管理员家庭ID
3. **初始化所有必需字段**: balance, role, avatar_color, level, experience
4. **错误处理**: 如果插入失败，记录警告但不阻止用户注册
5. **随机头像颜色**: 使用随机十六进制颜色

## 测试场景

### 场景 1: 新用户注册
- 输入: 新邮箱 + 密码
- 预期: 注册成功，自动登录，跳转到后台
- 验证: 在 auth.users 和 profiles 表中都能找到该用户

### 场景 2: 老用户登录
- 输入: 已注册邮箱 + 正确密码
- 预期: 直接登录，跳转到后台
- 验证: 不会创建新的 profile 记录

### 场景 3: 密码错误
- 输入: 已注册邮箱 + 错误密码
- 预期: 提示"密码错误，如忘记密码请点击下方找回"
- 验证: 不会创建新的用户或 profile

## 注意事项

1. **默认家庭ID**: 所有新注册的用户都会被分配到超级管理员家庭（ID: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`）
2. **默认角色**: 新用户的角色为 `author`，不是 `admin`
3. **邮箱验证**: 如果 Supabase 启用了邮箱验证，用户需要验证邮箱后才能登录
4. **错误处理**: 触发器中添加了 EXCEPTION 处理，即使 profile 创建失败，用户也能在 auth.users 中创建成功

## 后续优化建议

1. **创建独立家庭**: 考虑为每个新用户创建独立的家庭，而不是都分配到超级管理员家庭
2. **邮箱验证**: 在生产环境中启用邮箱验证，提高安全性
3. **欢迎邮件**: 发送欢迎邮件给新注册用户
4. **用户资料完善**: 引导新用户完善个人资料（头像、简介等）
