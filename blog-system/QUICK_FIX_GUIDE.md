# 快速修复指南：用户注册问题

## 问题
- 有 15 个 auth.users，但只有 5 个 profiles
- 14 个孤立用户（注册了但没有 profile 和 family）
- role 字段有约束检查，不能随意使用值

## 解决步骤

### 第 1 步：检查 role 约束

运行：`blog-system/supabase/CHECK_ROLE_CONSTRAINT.sql`

这会告诉你 role 字段允许哪些值（可能是 'admin', 'editor', 'author', 'child', 'moppet' 等）

---

### 第 2 步：修复触发器

根据第 1 步的结果，选择正确的脚本：

**如果 role 允许 'admin'：**
运行：`blog-system/supabase/STEP2_FIX_TRIGGER_V2.sql`

**如果 role 不允许 'admin'，需要修改：**
1. 打开 `STEP2_FIX_TRIGGER_V2.sql`
2. 将 `'admin'` 改为允许的值（如 'author'）
3. 运行修改后的脚本

---

### 第 3 步：修复孤立用户

运行：`blog-system/supabase/STEP3_FIX_ORPHANED_USERS_V2.sql`

这个脚本会：
1. 先尝试使用 'admin' 角色
2. 如果失败，自动尝试 'author' 角色
3. 为每个孤立用户创建 family 和 profile

---

### 第 4 步：验证

运行：`blog-system/supabase/STEP1_CHECK_ISSUE.sql`

检查：
- `orphaned_users_count` 应该是 0
- 所有用户都应该有 profile 和 family

---

## 如果还有问题

### 查看 role 约束的详细信息

```sql
SELECT 
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%role%';
```

### 查看现有的 role 值

```sql
SELECT DISTINCT role, COUNT(*) 
FROM profiles 
GROUP BY role;
```

### 手动创建一个用户的 profile

如果知道正确的 role 值，可以手动创建：

```sql
-- 替换这些值
DO $$
DECLARE
  v_user_id UUID := '替换为用户ID';
  v_email TEXT := '替换为用户邮箱';
  v_family_id UUID;
BEGIN
  -- 创建家庭
  INSERT INTO families (name)
  VALUES ('用户名的家庭')
  RETURNING id INTO v_family_id;
  
  -- 创建 profile（使用正确的 role 值）
  INSERT INTO profiles (id, family_id, name, role)
  VALUES (v_user_id, v_family_id, '用户名', '正确的role值');
END $$;
```

---

## 常见的 role 值

根据系统架构文档，可能的值：
- `admin` - 超级管理员
- `parent` - 家长（但可能约束不允许）
- `editor` - 编辑
- `author` - 作者
- `child` - 孩子
- `moppet` - 小孩

**Blog 系统应该使用：** `admin`, `editor`, 或 `author`

---

## 下一步

修复完成后：
1. 测试新用户注册
2. 检查用户管理页面
3. 确认所有用户都有家庭信息
