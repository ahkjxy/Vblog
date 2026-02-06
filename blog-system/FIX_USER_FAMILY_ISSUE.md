# 修复用户家庭归属问题

## 问题描述
所有用户都被错误地归属到管理员家庭下，而不是各自独立的家庭。

## 原因分析
1. `handle_new_user()` 函数使用了过时的字段（`username`, `email`）
2. 函数没有为新用户创建独立的家庭
3. 现有用户数据需要重新分配到各自的家庭

## 修复步骤

### 步骤 1: 检查当前数据状态
在 Supabase SQL Editor 中运行：
```sql
-- 查看文件: blog-system/supabase/CHECK_USER_FAMILY_DATA.sql
```

### 步骤 2: 修复自动注册函数
在 Supabase SQL Editor 中运行：
```sql
-- 查看文件: blog-system/supabase/FIX_AUTO_REGISTRATION_FUNCTION.sql
```

这个脚本会：
- 删除旧的触发器和函数
- 创建新的函数，为每个新用户自动创建独立家庭
- 重新创建触发器

### 步骤 3: 修复现有用户数据
在 Supabase SQL Editor 中运行：
```sql
-- 查看文件: blog-system/supabase/FIX_EXISTING_USER_FAMILIES.sql
```

这个脚本会：
- 保留超级管理员（王僚原）在原家庭
- 为所有其他用户创建独立的家庭
- 将用户移动到各自的家庭

## 验证修复结果

运行以下查询验证：
```sql
-- 查看每个家庭的成员数
SELECT 
  f.name as family_name,
  COUNT(p.id) as member_count,
  STRING_AGG(p.name, ', ') as members
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
GROUP BY f.id, f.name
ORDER BY member_count DESC;
```

预期结果：
- 王僚原的家庭：只有王僚原（super_admin）
- 其他家庭：每个家庭只有一个成员

## 注意事项

1. **备份数据**：在执行修复脚本前，建议先备份数据
2. **超级管理员**：确保超级管理员的 family_id 是 `79ed05a1-e0e5-4d8c-9a79-d8756c488171`
3. **新用户**：修复后，新注册的用户会自动创建独立家庭
4. **文章归属**：用户的文章会保持原有的 author_id，不受影响

## 相关文件
- `blog-system/supabase/CHECK_USER_FAMILY_DATA.sql` - 诊断查询
- `blog-system/supabase/FIX_AUTO_REGISTRATION_FUNCTION.sql` - 修复注册函数
- `blog-system/supabase/FIX_EXISTING_USER_FAMILIES.sql` - 修复现有数据
