# 🔧 修复当前登录用户问题

## 问题分析

从截图看到：
- ✅ 当前登录用户: **ahkixy@qq.com**
- ❌ 用户 ID: `f9ad98b6-17ad-4c58-b6fa-b5b02d8374...`
- ❌ 档案信息: **全部为空**（Name: 无, Role: 无, Balance: 0）
- ❌ 家庭信息: **全部为空**（Family ID: 无, 家长: 王僚原）
- ❌ 超管判断: **两个条件都不满足**

## 核心问题

**当前登录用户 (ahkixy@qq.com) 在 profiles 表中没有记录！**

## 快速修复

### 方法 1: 通过邮箱自动创建（推荐）

在 Supabase SQL Editor 中运行：

```sql
-- 为 ahkixy@qq.com 创建 profile
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
SELECT 
  id,
  '王僚原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000
FROM auth.users
WHERE email = 'ahkixy@qq.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';

-- 验证
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 成功！是超级管理员'
    ELSE '❌ 失败'
  END as result
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'ahkixy@qq.com';
```

### 方法 2: 先查找完整 ID，再创建

```sql
-- 步骤 1: 查找完整的用户 ID
SELECT id, email
FROM auth.users
WHERE email = 'ahkixy@qq.com';

-- 步骤 2: 复制上面的 ID，替换下面的 'YOUR_USER_ID'
INSERT INTO profiles (
  id,
  name,
  role,
  family_id,
  balance
)
VALUES (
  'YOUR_USER_ID',  -- 替换为步骤 1 查到的 ID
  '王僚原',
  'admin',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  1000
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  name = '王僚原';
```

## 预期结果

验证查询应该返回：
```
id: f9ad98b6-17ad-4c58-b6fa-b5b02d8374...
email: ahkixy@qq.com
name: 王僚原
role: admin
family_id: 79ed05a1-e0e5-4d8c-9a79-d8756c488171
result: ✅ 成功！是超级管理员
```

## 执行后

1. **清除浏览器缓存**: `Cmd + Shift + R`
2. **重新登录**
3. **查看调试信息**，应该显示：

```
🐛 调试信息                    ✅ 超级管理员

👤 用户
ID: f9ad98b6-17ad-4c58-b6fa-b5b02d8374...
Email: ahkixy@qq.com

📋 档案
Name: 王僚原
Role: admin
Balance: 1000

👥 家庭
Family ID: 79ed05a1-e0e5-4d8c-9a79-d8756c488171
家长: 王僚原

🔍 超管判断
role === 'admin': ✅ 是
family_id 匹配: ✅ 是
```

4. **侧边栏应该显示**: "超级管理员"（紫粉色渐变徽章）

## 检查其他用户

如果你有多个账号，运行这个查询查看所有用户：

```sql
-- 查看所有用户及其 profile 状态
SELECT 
  u.id,
  u.email,
  p.name,
  p.role,
  p.family_id,
  CASE 
    WHEN p.id IS NULL THEN '❌ 缺少 profile'
    WHEN p.role = 'admin' AND p.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    THEN '✅ 超级管理员'
    ELSE '✅ 有 profile'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

## 相关文件

- `supabase/FIX_CURRENT_USER.sql` - 修复当前用户脚本
- `supabase/CHECK_CURRENT_USER.sql` - 检查所有用户
- `supabase/FIX_ALL_USERS.sql` - 修复所有用户

## 注意事项

1. **确认邮箱**: 确保 `ahkixy@qq.com` 是王僚原的邮箱
2. **名字拼写**: 是"王**僚**原"，不是"王**侦**原"
3. **只修复当前登录用户**: 使用方法 1（推荐）
4. **修复所有用户**: 使用 `FIX_ALL_USERS.sql`

---

**状态**: 等待执行 SQL
**优先级**: 🔴 高
**预计时间**: 2 分钟
