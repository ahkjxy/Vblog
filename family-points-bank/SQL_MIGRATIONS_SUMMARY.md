# SQL 迁移文件总结

## 📋 迁移文件列表

### 010_add_feedback_system.sql
**功能**：用户反馈系统

**包含内容**：
- ✅ `feedback` 表创建
- ✅ RLS 策略（普通用户 + 超级管理员）
- ✅ `get_feedback_stats()` 函数 - 获取反馈统计
- ✅ `mark_feedback_as_replied()` 函数 - 标记反馈为已回复

**使用场景**：
- 普通家庭提交反馈
- 超级管理员查看和回复所有反馈

**超级管理员家庭 ID**: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`

---

### 011_add_delete_family_function.sql
**功能**：删除家庭数据

**包含内容**：
- ✅ `delete_family_data(target_family_id)` 函数 - 删除家庭所有数据
- ✅ `get_family_data_stats(target_family_id)` 函数 - 查看数据统计

**删除的数据**：
- profiles（成员）
- transactions（交易记录）
- tasks（任务）
- rewards（奖励）
- messages（消息）
- feedback（反馈）
- badge_progress（徽章进度）
- families（家庭记录）

**权限要求**：
- 只能删除自己家庭的数据
- 必须是管理员角色

---

## 🚀 执行顺序

```sql
-- 1. 反馈系统（可选，如果需要反馈功能）
\i family-points-bank/supabase/migrations/010_add_feedback_system.sql

-- 2. 删除家庭数据功能（必需，用于注销账户）
\i family-points-bank/supabase/migrations/011_add_delete_family_function.sql
```

---

## 📝 使用示例

### 1. 查看家庭数据统计
```sql
-- 查看某个家庭有多少数据
SELECT get_family_data_stats('your-family-id-here');

-- 返回示例：
{
  "family_id": "uuid",
  "profiles_count": 5,
  "transactions_count": 120,
  "tasks_count": 15,
  "rewards_count": 10,
  "messages_count": 50,
  "feedback_count": 2,
  "badges_count": 8
}
```

### 2. 删除家庭数据（注销账户）
```sql
-- 删除家庭所有数据
SELECT delete_family_data('your-family-id-here');

-- 返回示例：
{
  "success": true,
  "family_id": "uuid",
  "deleted": {
    "profiles": 5,
    "transactions": 120,
    "tasks": 15,
    "rewards": 10,
    "messages": 50,
    "feedback": 2,
    "badges": 8
  },
  "message": "Family data deleted successfully"
}
```

### 3. 查看反馈统计（超级管理员）
```sql
-- 查看所有反馈的统计信息
SELECT get_feedback_stats();

-- 返回示例：
{
  "total_feedback": 25,
  "pending_count": 8,
  "replied_count": 15,
  "closed_count": 2,
  "high_priority_count": 3
}
```

### 4. 回复反馈（超级管理员）
```sql
-- 回复某个反馈
SELECT mark_feedback_as_replied(
  'feedback-id-here',
  '感谢您的反馈，我们已经修复了这个问题。'
);

-- 返回：true
```

---

## 🔐 权限说明

### feedback 表 RLS 策略

| 操作 | 普通用户 | 超级管理员 |
|------|---------|-----------|
| 查看自己的反馈 | ✅ | ✅ |
| 查看所有反馈 | ❌ | ✅ |
| 创建反馈 | ✅ | ✅ |
| 更新自己的待处理反馈 | ✅ | ✅ |
| 更新任何反馈 | ❌ | ✅ |
| 删除自己的待处理反馈 | ✅ | ✅ |
| 删除任何反馈 | ❌ | ✅ |

### delete_family_data 函数权限

| 条件 | 是否允许 |
|------|---------|
| 删除自己家庭的数据 | ✅ |
| 删除其他家庭的数据 | ❌ |
| 非管理员执行 | ❌ |
| 管理员执行 | ✅ |

---

## ⚠️ 重要提示

### 1. 数据备份
在执行删除操作前，建议先备份数据：
```sql
-- 导出数据（在应用层面实现）
-- 或使用 Supabase 的备份功能
```

### 2. 测试环境
建议先在测试环境执行迁移：
```sql
-- 在测试数据库中测试
SELECT delete_family_data('test-family-id');
```

### 3. 级联删除
确保数据库外键设置了 `ON DELETE CASCADE`：
```sql
-- 检查外键约束
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## 🔍 故障排查

### 问题 1：删除失败 - "Only admin can delete"
**原因**：当前用户不是管理员
**解决**：
```sql
-- 检查用户角色
SELECT id, name, role FROM profiles WHERE id = auth.uid();

-- 如果需要，更新为管理员
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

### 问题 2：删除失败 - "You can only delete your own family data"
**原因**：尝试删除其他家庭的数据
**解决**：
```sql
-- 检查当前用户的家庭 ID
SELECT family_id FROM profiles WHERE id = auth.uid();

-- 只能删除自己家庭的数据
```

### 问题 3：反馈查询返回空
**原因**：RLS 策略限制
**解决**：
```sql
-- 检查 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'feedback';

-- 确认当前用户权限
SELECT 
  auth.uid() as current_user,
  family_id,
  role
FROM profiles 
WHERE id = auth.uid();
```

---

## 📊 监控查询

### 查看所有家庭的数据量
```sql
SELECT 
  f.id as family_id,
  f.name as family_name,
  COUNT(DISTINCT p.id) as members,
  COUNT(DISTINCT t.id) as transactions,
  COUNT(DISTINCT tk.id) as tasks,
  COUNT(DISTINCT r.id) as rewards
FROM families f
LEFT JOIN profiles p ON p.family_id = f.id
LEFT JOIN transactions t ON t.family_id = f.id
LEFT JOIN tasks tk ON tk.family_id = f.id
LEFT JOIN rewards r ON r.family_id = f.id
GROUP BY f.id, f.name
ORDER BY members DESC;
```

### 查看反馈统计
```sql
SELECT 
  status,
  priority,
  COUNT(*) as count
FROM feedback
GROUP BY status, priority
ORDER BY status, priority;
```

---

## ✅ 验证清单

### 迁移后验证
- [ ] `feedback` 表已创建
- [ ] `delete_family_data` 函数存在
- [ ] `get_family_data_stats` 函数存在
- [ ] `get_feedback_stats` 函数存在
- [ ] `mark_feedback_as_replied` 函数存在
- [ ] RLS 策略已启用
- [ ] 权限验证正常工作

### 功能测试
- [ ] 普通用户可以提交反馈
- [ ] 普通用户可以查看自己的反馈
- [ ] 超级管理员可以查看所有反馈
- [ ] 超级管理员可以回复反馈
- [ ] 管理员可以删除自己家庭的数据
- [ ] 非管理员无法删除家庭数据
- [ ] 无法删除其他家庭的数据

---

## 🎉 总结

两个迁移文件提供了完整的系统设置功能：

1. **010_add_feedback_system.sql**
   - 用户反馈系统
   - 超级管理员管理功能

2. **011_add_delete_family_function.sql**
   - 注销账户功能
   - 完整数据删除

所有功能都有完善的权限控制和错误处理。
