# 🔧 修复用户档案问题

## 问题诊断

从调试信息看到：
- ✅ Family ID 正确: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`
- ✅ 家长信息正确: 王侦原, Role: admin
- ❌ **用户档案为空**: 这是核心问题！
- ❌ Is Super Admin: 否
- ❌ Display Role: author

## 根本原因

**当前登录用户在 `profiles` 表中没有记录！**

这导致：
1. `userProfile` 为 `null`
2. 无法获取 `role` 和 `family_id`
3. 超管判断失败
4. 显示为 "author"（默认值）

## 立即修复步骤

### 步骤 1: 检查用户 ID

在 Supabase SQL Editor 中运行：

```sql
-- 查找你的用户 ID
SELECT id, email
FROM auth.users
WHERE email = 'wangliaoyuan@gmail.com';
```

记下返回的 `id`（应该是 `79bba44c-f61d-4197-9e6b-4781a19d962b`）

### 步骤 2: 检查 profiles 表

```sql
-- 检查 profiles 表中是否有记录
SELECT *
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
```

**如果返回空结果，说明需要创建 profile 记录！**

### 步骤 3: 创建/更新 profile 记录

```sql
-- 创建或更新 profile
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  family_id,
  balance,
  created_at
)
VALUES (
  '79bba44c-f61d-4197-9e6b-4781a19d962b',  -- 你的用户 ID
  '王侦原',                                  -- 名字
  'wangliaoyuan@gmail.com',                -- 邮箱
  'admin',                                  -- 角色（重要！）
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171', -- 超管家庭 ID（重要！）
  1000,                                     -- 积分余额
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王侦原';
```

### 步骤 4: 验证结果

```sql
-- 验证 profile 已创建
SELECT 
  id,
  name,
  role,
  family_id,
  CASE 
    WHEN role = 'admin' AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 是超级管理员'
    ELSE '❌ 不是超级管理员'
  END as status
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
```

**预期结果**:
- name: `王侦原`
- role: `admin`
- family_id: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`
- status: `✅ 是超级管理员`

### 步骤 5: 刷新页面

1. **清除浏览器缓存**: `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows)
2. **重新登录**: 退出后重新登录
3. **查看调试信息**: 应该看到：
   - ✅ 用户档案有数据
   - ✅ Is Super Admin: 是
   - ✅ Display Role: admin
   - ✅ 侧边栏显示"超级管理员"

## 完整修复脚本

运行文件：`blog-system/supabase/FIX_USER_PROFILE.sql`

这个脚本会：
1. 检查 auth.users
2. 检查 profiles
3. 创建/更新 profile 记录
4. 检查 family_members
5. 创建/更新 family_members 记录
6. 最终验证

## 为什么会出现这个问题？

可能的原因：
1. **注册时没有创建 profile**: 注册流程可能有问题
2. **profile 被删除**: 之前的操作可能删除了 profile
3. **数据库迁移问题**: 迁移时可能丢失了数据
4. **RLS 策略问题**: 可能无法读取 profile

## 预防措施

### 1. 确保注册时创建 profile

在注册流程中添加：

```typescript
// 注册后立即创建 profile
const { data: { user } } = await supabase.auth.signUp({
  email,
  password,
})

if (user) {
  await supabase.from('profiles').insert({
    id: user.id,
    name: userName,
    email: user.email,
    role: 'author', // 默认角色
  })
}
```

### 2. 添加数据库触发器

创建触发器自动创建 profile：

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'author',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. 检查 RLS 策略

确保用户可以读取自己的 profile：

```sql
-- 允许用户读取自己的 profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

## 调试信息说明

修复后，调试面板应该显示：

```
🐛 调试信息                                    ✅ 超级管理员

👤 用户
ID: 79bba44c-f61d-4197-9e6b-4781a19d962b
Email: wangliaoyuan@gmail.com

📋 档案
Name: 王侦原
Role: admin
Balance: 1000

👥 家庭
Family ID: 79ed05a1-e0e5-4d8c-9a79-d8756c488171
家长: 王侦原

🔍 超管判断
role === 'admin': ✅ 是
family_id 匹配: ✅ 是
```

## 相关文件

- `supabase/FIX_USER_PROFILE.sql` - 完整修复脚本
- `src/app/dashboard/layout.tsx` - Dashboard 布局（含调试信息）
- `SIMPLE_FIX.sql` - 简单修复脚本（只更新 role）

## 需要帮助？

如果修复后还有问题，请提供：
1. 步骤 2 的查询结果截图
2. 步骤 4 的验证结果截图
3. 刷新后的调试信息截图

---

**状态**: 等待执行 SQL 修复
**优先级**: 🔴 高（核心功能受影响）
**预计时间**: 5 分钟
