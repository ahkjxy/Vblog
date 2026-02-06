# 🔧 数据库结构问题修复

## 问题根源

**博客系统和家庭积分系统使用不同的数据库表结构！**

### 博客系统 profiles 表结构：
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(50),      -- ✅ 有
  email VARCHAR(255),         -- ✅ 有
  bio TEXT,                   -- ✅ 有
  avatar_url TEXT,            -- ✅ 有
  role VARCHAR(20),           -- ✅ 有 ('admin', 'editor', 'author')
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 家庭积分系统 profiles 表结构：
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT,                  -- ✅ 有
  family_id UUID,             -- ✅ 有
  balance INTEGER,            -- ✅ 有
  avatar_url TEXT,            -- ✅ 有
  avatar_color TEXT,          -- ✅ 有
  role TEXT,                  -- ✅ 有 ('admin', 'child')
  bio TEXT,
  created_at TIMESTAMP
);
```

## 之前的错误

Dashboard layout 代码在查询：
- ❌ `name` - 博客系统没有这个字段
- ❌ `family_id` - 博客系统没有这个字段
- ❌ `balance` - 博客系统没有这个字段
- ❌ `avatar_color` - 博客系统没有这个字段
- ❌ `family_members` 表 - 博客系统没有这个表

## 已修复

### 1. 更新了 Dashboard Layout
- ✅ 只查询博客系统的字段：`username`, `email`, `role`, `bio`, `avatar_url`
- ✅ 移除了对 `family_members` 表的查询
- ✅ 移除了对 `name`, `family_id`, `balance`, `avatar_color` 的引用
- ✅ 超级管理员判断简化为：`role === 'admin'`

### 2. 更新了显示逻辑
- ✅ 使用 `username` 而不是 `name`
- ✅ 移除了积分显示（`balance`）
- ✅ 移除了家庭信息显示
- ✅ 简化了头像显示逻辑

### 3. 更新了调试信息
- ✅ 显示博客系统的字段
- ✅ 移除了家庭相关信息
- ✅ 简化了超管判断条件

## 创建 Profile

运行这个 SQL 为当前用户创建博客系统的 profile：

```sql
-- 文件：blog-system/supabase/CREATE_BLOG_PROFILE.sql

INSERT INTO profiles (
  id,
  username,
  email,
  role,
  bio
)
SELECT 
  id,
  '王僚原',
  email,
  'admin',
  '超级管理员'
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  username = '王僚原',
  role = 'admin',
  bio = '超级管理员';
```

## 预期结果

执行 SQL 后，刷新页面应该看到：

```
🐛 调试信息                    ✅ 超级管理员

👤 用户
ID: f9ad98b6-17ad-4c58-b6fa-b5b02d8374...
Email: ahkixy@qq.com

📋 档案（博客系统）
Username: 王僚原
Role: admin
Email: ahkixy@qq.com

⚙️ 计算结果
Display Name: 王僚原
Display Role: admin
Is Super Admin: ✅ 是

🔍 超管判断（博客系统）
role === 'admin': ✅ 是
```

侧边栏应该显示：
- 名字：**王僚原**
- 角色：**超级管理员**（紫粉色渐变徽章）

## 两个系统的区别

### 博客系统
- **用途**：内容管理系统（CMS）
- **用户角色**：admin（管理员）, editor（编辑）, author（作者）
- **超管判断**：`role === 'admin'`
- **显示名字**：使用 `username` 字段

### 家庭积分系统
- **用途**：家庭积分管理
- **用户角色**：admin（家长）, child（孩子）
- **超管判断**：`role === 'admin' AND family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'`
- **显示名字**：使用 `name` 字段

## 相关文件

### 已修复
- ✅ `src/app/dashboard/layout.tsx` - Dashboard 布局
- ✅ `supabase/CREATE_BLOG_PROFILE.sql` - 创建 profile 脚本

### 数据库结构
- 📄 `supabase/schema.sql` - 博客系统数据库结构

---

**状态**: ✅ 代码已修复，等待运行 SQL
**更新时间**: 2026-02-06
