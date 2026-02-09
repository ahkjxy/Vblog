# 反馈系统 RLS 最终修复指南

## 问题根源
用户尝试插入的 `family_id` 与其 profile 中的 `family_id` 不匹配，导致 RLS 策略拒绝插入。

## 解决方案

### 方案 1: 修复前端代码（推荐）✅
前端代码已更新，现在会自动从 profile 获取正确的 family_id。

**FeedbackModal.tsx 已修复：**
```typescript
// 提交反馈时自动获取正确的 family_id
const { data: profile } = await supabase
  .from('profiles')
  .select('family_id')
  .eq('id', profileId)
  .single();

const { error } = await supabase.from('feedback_messages').insert({
  family_id: profile.family_id, // 使用 profile 的 family_id
  profile_id: profileId,
  subject: subject.trim(),
  message: message.trim(),
  category,
  priority,
  status: 'pending',
});
```

### 方案 2: 诊断问题
执行诊断脚本查看详细信息：

```sql
-- 在 Supabase SQL Editor 中执行
supabase/migrations/014_diagnose_and_fix_feedback.sql
```

这将显示：
- 用户的 profile_id 和 family_id
- RLS 策略状态
- 权限测试结果
- 修复建议

### 方案 3: 临时宽松策略（仅用于测试）
如果需要快速测试，可以使用临时策略：

```sql
-- 创建临时宽松策略
DROP POLICY IF EXISTS "feedback_insert_temp" ON feedback_messages;

CREATE POLICY "feedback_insert_temp"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );
```

⚠️ **警告**: 这个策略允许用户插入任何 family_id，仅用于测试！

## 正确的使用方式

### 前端代码示例
```typescript
// ✅ 正确：自动获取 family_id
const handleSubmitFeedback = async () => {
  // 1. 获取当前用户的 profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', profileId)
    .single();

  // 2. 使用 profile 的 family_id
  const { data, error } = await supabase
    .from('feedback_messages')
    .insert({
      family_id: profile.family_id, // 使用 profile 的 family_id
      profile_id: profileId,
      subject: '测试反馈',
      message: '这是一条测试反馈',
      category: 'general',
      priority: 'normal',
      status: 'pending'
    });
};

// ❌ 错误：使用传入的 familyId（可能不匹配）
const { data, error } = await supabase
  .from('feedback_messages')
  .insert({
    family_id: familyId, // 可能与 profile 的 family_id 不匹配
    profile_id: profileId,
    // ...
  });
```

## 验证修复

### 1. 检查用户的 family_id
```sql
SELECT 
  id as profile_id,
  name,
  family_id,
  role
FROM profiles
WHERE id = 'your-profile-id';
```

### 2. 测试插入
```sql
-- 使用正确的 family_id 测试插入
INSERT INTO feedback_messages (
  family_id,
  profile_id,
  subject,
  message,
  category,
  priority,
  status
)
SELECT 
  p.family_id,  -- 使用 profile 的 family_id
  p.id,
  'Test Feedback',
  'This is a test message',
  'general',
  'normal',
  'pending'
FROM profiles p
WHERE p.id = auth.uid();
```

### 3. 查看插入的数据
```sql
SELECT 
  fm.id,
  fm.subject,
  fm.family_id,
  fm.profile_id,
  p.name as profile_name,
  f.name as family_name
FROM feedback_messages fm
LEFT JOIN profiles p ON fm.profile_id = p.id
LEFT JOIN families f ON fm.family_id = f.id
ORDER BY fm.created_at DESC
LIMIT 5;
```

## RLS 策略说明

### feedback_insert 策略
```sql
CREATE POLICY "feedback_insert"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );
```

**工作原理：**
1. 用户尝试插入一条反馈
2. RLS 检查插入的 `family_id` 是否在用户的 profile 的 `family_id` 中
3. 如果匹配，允许插入；否则拒绝

**为什么会失败：**
- 前端传入的 `familyId` 参数可能与用户 profile 的 `family_id` 不同
- 例如：用户的 profile.family_id = 'A'，但传入 familyId = 'B'

**解决方法：**
- 始终从 profile 获取 family_id，而不是从外部传入

## 常见错误

### 错误 1: 使用错误的 family_id
```typescript
// ❌ 错误
const { error } = await supabase.from('feedback_messages').insert({
  family_id: 'hardcoded-family-id', // 硬编码的 family_id
  // ...
});
```

### 错误 2: 使用 props 传入的 family_id
```typescript
// ❌ 可能错误（如果 props.familyId 与 profile 不匹配）
const { error } = await supabase.from('feedback_messages').insert({
  family_id: props.familyId, // 可能不匹配
  // ...
});
```

### 错误 3: 不检查 profile 是否存在
```typescript
// ❌ 错误（没有检查 profile）
const { data, error } = await supabase.from('feedback_messages').insert({
  family_id: familyId,
  // ...
});
```

## 正确的完整流程

```typescript
const handleSubmitFeedback = async () => {
  try {
    // 1. 验证输入
    if (!subject.trim() || !message.trim()) {
      throw new Error('Please fill in all fields');
    }

    // 2. 获取当前用户的 profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;
    if (!profile?.family_id) {
      throw new Error('Profile family_id not found');
    }

    // 3. 插入反馈（使用 profile 的 family_id）
    const { error } = await supabase.from('feedback_messages').insert({
      family_id: profile.family_id, // ✅ 正确
      profile_id: profileId,
      subject: subject.trim(),
      message: message.trim(),
      category,
      priority,
      status: 'pending',
    });

    if (error) throw error;

    // 4. 成功提示
    showToast({ type: 'success', title: 'Feedback submitted' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    showToast({ type: 'error', title: 'Submit failed' });
  }
};
```

## 测试清单

- [ ] 执行 `013_final_feedback_rls_fix.sql` 创建 RLS 策略
- [ ] 执行 `014_diagnose_and_fix_feedback.sql` 诊断问题
- [ ] 更新前端代码（FeedbackModal.tsx 已更新）
- [ ] 测试创建反馈
- [ ] 测试查看反馈列表
- [ ] 测试添加回复
- [ ] 测试超级管理员功能
- [ ] 删除临时测试策略（如果创建了）

## 状态
✅ **已修复** - FeedbackModal 组件已更新，自动获取正确的 family_id

---
**最后更新**: 2026-02-09  
**修复版本**: v2.0
