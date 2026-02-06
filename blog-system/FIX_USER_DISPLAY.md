# 修复用户显示不一致问题

## 问题

博客系统显示 "ahkjxy"（邮箱前缀），而不是 "王僚原"（家长名字）。

## 调试步骤

### 1. 访问调试页面

```
https://blog.familybank.chat/debug-user
```

这个页面会显示所有查询的数据，帮助你找到问题。

### 2. 检查数据库

在 Supabase Dashboard → SQL Editor 中运行：

```sql
-- 替换为你的邮箱
SELECT 
  u.id as user_id,
  u.email,
  fm.family_id,
  p_user.name as user_profile_name,
  p_user.role as user_profile_role,
  p_admin.name as admin_profile_name,
  p_admin.role as admin_profile_role
FROM auth.users u
LEFT JOIN family_members fm ON fm.user_id = u.id
LEFT JOIN profiles p_user ON p_user.id = u.id
LEFT JOIN profiles p_admin ON p_admin.family_id = fm.family_id AND p_admin.role = 'admin'
WHERE u.email = 'your-email@example.com';
```

## 可能的原因和解决方案

### 原因 1: 没有 family_members 记录

**检查：**
```sql
SELECT * FROM family_members WHERE user_id = 'your-user-id';
```

**解决：**
```sql
-- 创建 family_members 记录
INSERT INTO family_members (user_id, family_id)
VALUES ('your-user-id', 'your-family-id');
```

### 原因 2: 家庭中没有 admin profile

**检查：**
```sql
SELECT * FROM profiles 
WHERE family_id = 'your-family-id' 
  AND role = 'admin';
```

**解决：**
```sql
-- 创建或更新家长 profile
INSERT INTO profiles (id, name, role, family_id, avatar_color, balance)
VALUES (
  gen_random_uuid(),
  '王僚原',
  'admin',
  'your-family-id',
  '#FF4D94',
  0
)
ON CONFLICT (id) DO UPDATE
SET name = '王僚原', role = 'admin';
```

### 原因 3: profile 的 family_id 不匹配

**检查：**
```sql
SELECT 
  p.id,
  p.name,
  p.family_id,
  fm.family_id as fm_family_id
FROM profiles p
LEFT JOIN family_members fm ON fm.user_id = p.id
WHERE p.id = 'your-user-id';
```

**解决：**
```sql
-- 更新 profile 的 family_id
UPDATE profiles
SET family_id = (
  SELECT family_id 
  FROM family_members 
  WHERE user_id = 'your-user-id'
)
WHERE id = 'your-user-id';
```

### 原因 4: 多个 admin 导致查询混乱

**检查：**
```sql
SELECT family_id, COUNT(*) as admin_count
FROM profiles
WHERE role = 'admin'
GROUP BY family_id
HAVING COUNT(*) > 1;
```

**解决：**
```sql
-- 只保留一个 admin，其他改为 child
UPDATE profiles
SET role = 'child'
WHERE family_id = 'your-family-id'
  AND role = 'admin'
  AND id != 'admin-profile-id';
```

## 标准数据结构

一个正确的家庭应该有：

```sql
-- 1. families 表
INSERT INTO families (id, name) 
VALUES ('family-uuid', '王僚原的家庭');

-- 2. family_members 表（关联用户和家庭）
INSERT INTO family_members (user_id, family_id)
VALUES ('user-uuid', 'family-uuid');

-- 3. profiles 表（家长）
INSERT INTO profiles (id, name, role, family_id, avatar_color, balance)
VALUES (
  'admin-profile-uuid',
  '王僚原',
  'admin',
  'family-uuid',
  '#FF4D94',
  1000
);

-- 4. profiles 表（孩子们）
INSERT INTO profiles (id, name, role, family_id, avatar_color, balance)
VALUES (
  'child-profile-uuid',
  '小明',
  'child',
  'family-uuid',
  '#7C4DFF',
  500
);
```

## 快速修复脚本

如果你知道邮箱和家长名字，可以运行这个脚本：

```sql
-- 设置变量
DO $
DECLARE
  v_user_email TEXT := 'your-email@example.com';
  v_admin_name TEXT := '王僚原';
  v_user_id UUID;
  v_family_id UUID;
  v_admin_profile_id UUID;
BEGIN
  -- 获取 user_id
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
  
  -- 获取或创建 family
  SELECT family_id INTO v_family_id FROM family_members WHERE user_id = v_user_id;
  
  IF v_family_id IS NULL THEN
    -- 创建新家庭
    INSERT INTO families (name) VALUES (v_admin_name || '的家庭')
    RETURNING id INTO v_family_id;
    
    -- 关联用户和家庭
    INSERT INTO family_members (user_id, family_id)
    VALUES (v_user_id, v_family_id);
  END IF;
  
  -- 检查是否有 admin profile
  SELECT id INTO v_admin_profile_id 
  FROM profiles 
  WHERE family_id = v_family_id AND role = 'admin'
  LIMIT 1;
  
  IF v_admin_profile_id IS NULL THEN
    -- 创建 admin profile
    INSERT INTO profiles (name, role, family_id, avatar_color, balance)
    VALUES (v_admin_name, 'admin', v_family_id, '#FF4D94', 0);
  ELSE
    -- 更新现有 admin profile
    UPDATE profiles
    SET name = v_admin_name
    WHERE id = v_admin_profile_id;
  END IF;
  
  RAISE NOTICE 'Fixed! User: %, Family: %, Admin: %', v_user_id, v_family_id, v_admin_profile_id;
END $;
```

## 验证修复

修复后，再次访问：
```
https://blog.familybank.chat/debug-user
```

应该看到：
- ✅ Family Member 有 family_id
- ✅ Admin Profile 显示 "王僚原"
- ✅ 最终显示结果显示 "王僚原"

然后访问：
```
https://blog.familybank.chat/dashboard
```

应该显示 "王僚原" 而不是 "ahkjxy"。

## 预防措施

为了避免将来出现这个问题：

1. **确保数据完整性**
   - 每个用户都应该有 family_members 记录
   - 每个家庭都应该有一个 admin profile

2. **添加数据库约束**
   ```sql
   -- 确保每个家庭至少有一个 admin
   CREATE OR REPLACE FUNCTION check_family_has_admin()
   RETURNS TRIGGER AS $
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM profiles 
       WHERE family_id = NEW.family_id 
         AND role = 'admin'
     ) THEN
       RAISE EXCEPTION 'Family must have at least one admin';
     END IF;
     RETURN NEW;
   END;
   $ LANGUAGE plpgsql;
   ```

3. **使用默认值**
   - 如果没有 admin，显示用户自己的名字
   - 如果没有名字，显示邮箱前缀

## 相关文档

- [调试 SQL 脚本](./DEBUG_USER_DATA.sql)
- [Session 故障排查](./SESSION_TROUBLESHOOTING.md)
- [家庭信息集成](./FAMILY_PROFILE_INTEGRATION.md)
