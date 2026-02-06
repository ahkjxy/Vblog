# 设置博客超级管理员

## 概述

将家庭积分系统的家长（admin）设置为博客系统的超级管理员，拥有所有管理权限。

## 超级管理员权限

作为超级管理员，可以：

- ✅ 管理所有文章（创建、编辑、删除、发布）
- ✅ 管理分类和标签
- ✅ 管理评论（审核、删除）
- ✅ 管理媒体库
- ✅ 管理用户（查看、编辑角色）
- ✅ 管理系统设置
- ✅ 查看所有统计数据

## 设置方法

### 方法 1: 快速设置（最简单，推荐）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → SQL Editor
3. 复制并运行以下 SQL：

```sql
-- 直接设置为管理员
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ahkjxy@qq.com'
);

-- 验证结果
SELECT 
  u.email,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'ahkjxy@qq.com';
```

4. 如果返回结果显示 `role = 'admin'`，说明设置成功！

### 方法 2: 完整脚本（如果 profile 不存在）

使用 `blog-system/supabase/quick-set-admin.sql` 文件，它会：
1. 检查 profile 是否存在
2. 如果不存在，自动创建
3. 设置为 admin 角色
4. 验证结果

### 方法 3: 使用邮箱脚本

使用 `blog-system/supabase/set-admin-by-email.sql`（已修复 updated_at 错误）

## 验证设置

### 1. 在 Supabase Dashboard 验证

```sql
SELECT 
  u.email,
  p.name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ 超级管理员'
    WHEN p.role = 'editor' THEN '编辑'
    WHEN p.role = 'author' THEN '作者'
    ELSE '未知'
  END as role_display
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'ahkjxy@qq.com';
```

### 2. 在博客系统验证

1. 访问 `https://blog.familybank.chat/dashboard`
2. 检查侧边栏是否显示：
   - ✅ 概览
   - ✅ 文章
   - ✅ 媒体库
   - ✅ 分类
   - ✅ 标签
   - ✅ 评论
   - ✅ **用户** （只有 admin 可见）
   - ✅ **设置** （只有 admin 可见）

3. 检查用户信息卡片：
   - 应该显示 "管理员" 标签

## 角色说明

博客系统有三种角色：

| 角色 | 权限 | 说明 |
|------|------|------|
| **admin** | 所有权限 | 超级管理员，可以管理一切 |
| **editor** | 编辑权限 | 可以编辑所有文章，但不能管理用户和设置 |
| **author** | 作者权限 | 只能管理自己的文章 |

## 数据结构

设置超级管理员后，数据库中的结构：

```
auth.users (Supabase Auth)
  ├─ id: user-uuid
  └─ email: ahkjxy@qq.com

family_members
  ├─ user_id: user-uuid
  └─ family_id: 79ed05a1-e0e5-4d8c-9a79-d8756c488171

profiles (博客系统)
  ├─ id: user-uuid (与 auth.users.id 相同)
  ├─ name: 王僚原 (从家庭 admin 获取)
  ├─ role: admin (博客超级管理员)
  └─ family_id: 79ed05a1-e0e5-4d8c-9a79-d8756c488171

profiles (家庭系统)
  ├─ id: profile-uuid (不同的 ID)
  ├─ name: 王僚原
  ├─ role: admin (家庭管理员)
  └─ family_id: 79ed05a1-e0e5-4d8c-9a79-d8756c488171
```

## 添加更多管理员

如果需要添加其他管理员：

```sql
-- 方法 1: 通过邮箱
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'another@example.com');

-- 方法 2: 通过用户 ID
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-uuid';

-- 方法 3: 设置为编辑
UPDATE profiles
SET role = 'editor'
WHERE id = (SELECT id FROM auth.users WHERE email = 'editor@example.com');
```

## 降级管理员

如果需要移除管理员权限：

```sql
-- 降级为作者
UPDATE profiles
SET role = 'author'
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- 降级为编辑
UPDATE profiles
SET role = 'editor'
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

## 故障排查

### 问题 1: 执行 SQL 后没有变化

**检查：**
```sql
-- 查看用户是否存在
SELECT * FROM auth.users WHERE email = 'ahkjxy@qq.com';

-- 查看 profile 是否存在
SELECT * FROM profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ahkjxy@qq.com'
);
```

**解决：**
如果 profile 不存在，需要先创建：
```sql
INSERT INTO profiles (id, name, role, family_id)
SELECT 
  u.id,
  '王僚原',
  'admin',
  fm.family_id
FROM auth.users u
JOIN family_members fm ON fm.user_id = u.id
WHERE u.email = 'ahkjxy@qq.com';
```

### 问题 2: Dashboard 还是看不到"用户"和"设置"菜单

**原因：** 前端缓存或 session 未刷新

**解决：**
1. 清除浏览器缓存
2. 退出登录
3. 重新登录
4. 刷新页面

### 问题 3: 显示的还是 "作者" 而不是 "管理员"

**检查：**
```sql
SELECT role FROM profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ahkjxy@qq.com'
);
```

**解决：**
确保 role 是 'admin' 而不是 'author' 或 'editor'。

## 安全建议

1. **限制管理员数量**
   - 只给真正需要的人 admin 权限
   - 大多数用户应该是 author 或 editor

2. **定期审查权限**
   ```sql
   -- 查看所有管理员
   SELECT u.email, p.name, p.role
   FROM profiles p
   JOIN auth.users u ON u.id = p.id
   WHERE p.role = 'admin';
   ```

3. **使用强密码**
   - 管理员账号应该使用强密码
   - 启用双因素认证（如果 Supabase 支持）

4. **记录操作日志**
   - 考虑添加审计日志功能
   - 记录管理员的重要操作

## 相关文档

- [用户角色管理](./DATABASE_SETUP.md)
- [权限系统](./supabase/migration-add-rls-policies.sql)
- [调试用户数据](./DEBUG_USER_DATA.sql)
