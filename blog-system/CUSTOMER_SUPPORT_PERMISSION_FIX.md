# 客服系统权限修复指南

## 问题
博客系统用户无法发送客服消息，提示权限错误。

## 原因
原有的 RLS 策略要求用户的 `family_id` 必须与插入的 `family_id` 匹配，但博客系统用户可能：
1. 刚注册，还没有 family
2. Profile 的 family_id 与实际不匹配

## 解决方案

### 1. 执行数据库迁移
在 Supabase SQL Editor 中执行：

```sql
-- 文件：family-points-bank/supabase/migrations/016_allow_blog_users_feedback.sql
```

这个迁移会：
- ✅ 允许任何认证用户创建反馈
- ✅ 自动验证 profile_id 和 family_id 的关联
- ✅ 用户可以查看自己提交的反馈
- ✅ 用户可以查看自己反馈的回复

### 2. 新的 RLS 策略

#### INSERT 策略
```sql
CREATE POLICY "Authenticated users can create feedback"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    -- 任何认证用户都可以创建反馈
    auth.uid() IS NOT NULL
    AND
    -- 确保 profile_id 对应的 profile 存在且属于该 family_id
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = feedback_messages.profile_id
      AND family_id = feedback_messages.family_id
    )
  );
```

#### SELECT 策略
```sql
CREATE POLICY "Users can view own feedback"
  ON feedback_messages FOR SELECT
  USING (
    -- 用户可以查看自己提交的反馈
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
    OR
    -- 用户可以查看自己家庭的反馈
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
    OR
    -- 超级管理员可以查看所有反馈
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

### 3. 前端代码优化

#### 获取最新 Profile 信息
```typescript
// 发送消息前，重新获取 profile 信息
const { data: currentProfile } = await supabase
  .from('profiles')
  .select('id, family_id')
  .eq('id', userProfile.id)
  .single()

if (!currentProfile.family_id) {
  throw new Error('用户没有关联的家庭')
}
```

#### 错误处理
```typescript
try {
  const { error } = await supabase.from('feedback_messages').insert({
    family_id: currentProfile.family_id,
    profile_id: currentProfile.id,
    subject: '博客系统客服咨询',
    message: messageContent,
    category: 'question',
    priority: 'normal',
    status: 'pending'
  })

  if (error) {
    console.error('Insert error:', error)
    throw error
  }
} catch (error: any) {
  console.error('发送消息失败:', error)
  // 显示详细错误信息
  const errorMessage = error.message || '未知错误'
  // ...
}
```

## 权限矩阵

| 操作 | 未登录用户 | 普通用户 | 超级管理员 |
|------|-----------|---------|-----------|
| 查看常见问题 | ✅ | ✅ | ✅ |
| 发送消息 | ❌ | ✅ | ✅ |
| 查看自己的反馈 | ❌ | ✅ | ✅ |
| 查看自己的回复 | ❌ | ✅ | ✅ |
| 查看所有反馈 | ❌ | ❌ | ✅ |
| 回复反馈 | ❌ | ❌ | ✅ |
| 更新状态 | ❌ | ❌ | ✅ |

## 测试步骤

### 1. 测试未登录用户
```bash
# 打开浏览器无痕模式
# 访问博客系统
# 点击客服按钮
# 尝试发送消息
# 预期：显示登录提示
```

### 2. 测试普通用户
```bash
# 登录博客系统
# 点击客服按钮
# 输入消息并发送
# 预期：消息成功发送
# 在数据库中验证消息
```

### 3. 测试超级管理员
```bash
# 以超级管理员登录元气银行
# 进入"系统设置 → 反馈与建议"
# 查看所有反馈
# 找到"博客系统客服咨询"
# 预期：可以看到所有客服消息
```

### 4. 测试回复功能
```bash
# 超级管理员回复客服消息
# 普通用户登录博客系统
# 在元气银行后台查看反馈
# 预期：可以看到管理员的回复
```

## 常见错误

### 错误 1: "new row violates row-level security policy"
**原因**: RLS 策略未更新
**解决**: 执行迁移文件 `016_allow_blog_users_feedback.sql`

### 错误 2: "用户没有关联的家庭"
**原因**: Profile 的 family_id 为 NULL
**解决**: 
1. 用户需要先访问元气银行系统
2. 系统会自动创建 family
3. 或者手动在数据库中创建 family 并关联

### 错误 3: "无法获取用户信息"
**原因**: Profile 不存在或查询失败
**解决**: 
1. 检查用户是否有 profile
2. 检查 Supabase 连接
3. 查看浏览器控制台错误

## 数据库查询

### 查看用户的 Profile 信息
```sql
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.family_id,
  f.name as family_name
FROM profiles p
LEFT JOIN families f ON p.family_id = f.id
WHERE p.user_id = 'user-uuid-here';
```

### 查看用户的反馈
```sql
SELECT 
  fm.id,
  fm.subject,
  fm.message,
  fm.status,
  fm.created_at,
  p.name as user_name,
  f.name as family_name
FROM feedback_messages fm
LEFT JOIN profiles p ON fm.profile_id = p.id
LEFT JOIN families f ON fm.family_id = f.id
WHERE fm.profile_id = 'profile-uuid-here'
ORDER BY fm.created_at DESC;
```

### 查看所有博客系统客服消息
```sql
SELECT 
  fm.id,
  fm.message,
  fm.status,
  fm.created_at,
  p.name as user_name,
  p.user_id,
  f.name as family_name
FROM feedback_messages fm
LEFT JOIN profiles p ON fm.profile_id = p.id
LEFT JOIN families f ON fm.family_id = f.id
WHERE fm.subject = '博客系统客服咨询'
ORDER BY fm.created_at DESC;
```

### 检查 RLS 策略
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('feedback_messages', 'feedback_replies')
ORDER BY tablename, policyname;
```

## 部署清单

- [ ] 执行迁移文件 `016_allow_blog_users_feedback.sql`
- [ ] 验证 RLS 策略已更新
- [ ] 测试未登录用户流程
- [ ] 测试普通用户发送消息
- [ ] 测试普通用户查看回复
- [ ] 测试超级管理员查看所有消息
- [ ] 测试超级管理员回复功能
- [ ] 检查错误日志
- [ ] 更新文档

## 回滚方案

如果需要回滚到原来的策略：

```sql
-- 恢复原有的 INSERT 策略
DROP POLICY IF EXISTS "Authenticated users can create feedback" ON feedback_messages;

CREATE POLICY "Users can create own family feedback"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND family_id = feedback_messages.family_id
    )
  );
```

## 相关文档

- [客服系统数据库集成](./CUSTOMER_SUPPORT_DATABASE_INTEGRATION.md)
- [反馈系统权限说明](../family-points-bank/FEEDBACK_PERMISSIONS.md)
- [反馈系统 RLS 修复](../family-points-bank/FEEDBACK_RLS_FINAL_FIX.md)

---
**创建时间**: 2026-02-09  
**最后更新**: 2026-02-09  
**版本**: v1.0
