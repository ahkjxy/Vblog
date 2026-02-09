# 反馈系统权限说明

## 权限规则

### 超级管理员 (79ed05a1-e0e5-4d8c-9a79-d8756c488171)
✅ 查看所有家庭的反馈  
✅ 回复任何反馈  
✅ 更新反馈状态  
✅ 删除回复  

### 普通家庭
✅ 提交反馈  
✅ 查看自己提交的反馈  
✅ 查看管理员的回复  
❌ 不能回复（只能查看管理员回复）  
❌ 不能查看其他家庭的反馈  

## 数据库策略

### feedback_messages 表

#### SELECT 策略
```sql
-- 用户可以查看自己家庭的反馈或超级管理员可以查看所有
CREATE POLICY "feedback_select"
  ON feedback_messages FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

#### INSERT 策略
```sql
-- 用户可以创建自己家庭的反馈
CREATE POLICY "feedback_insert"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );
```

#### UPDATE 策略
```sql
-- 用户可以更新自己家庭的反馈或超级管理员可以更新所有
CREATE POLICY "feedback_update"
  ON feedback_messages FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

### feedback_replies 表

#### SELECT 策略
```sql
-- 用户可以查看自己反馈的回复
CREATE POLICY "replies_select"
  ON feedback_replies FOR SELECT
  USING (
    feedback_id IN (
      SELECT id FROM feedback_messages
      WHERE family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

#### INSERT 策略（限制）
```sql
-- 只有超级管理员可以创建回复
CREATE POLICY "replies_insert"
  ON feedback_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

## 前端实现

### FeedbackModal 组件

#### 回复输入框（只对超级管理员显示）
```tsx
{/* Reply Input - 只有超级管理员可以回复 */}
{isSuperAdmin && (
  <div className="space-y-3">
    <label>添加回复</label>
    <textarea
      value={replyMessage}
      onChange={(e) => setReplyMessage(e.target.value)}
      placeholder="输入您的回复..."
    />
    <button onClick={handleSendReply}>
      发送回复
    </button>
  </div>
)}

{/* 普通用户提示 */}
{!isSuperAdmin && (
  <div className="info-box">
    💬 管理员会尽快回复您的反馈
  </div>
)}
```

#### 超级管理员检测
```tsx
const isSuperAdmin = currentSyncId === '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
```

## 使用流程

### 普通用户流程
1. 打开反馈弹窗
2. 点击"新建反馈"
3. 填写主题、详细说明、分类、优先级
4. 提交反馈
5. 在列表中查看自己的反馈
6. 点击反馈查看详情
7. 查看管理员的回复（如果有）
8. ❌ 不能添加回复

### 超级管理员流程
1. 打开反馈弹窗
2. 查看所有家庭的反馈列表
3. 点击反馈查看详情
4. 查看反馈内容和所有回复
5. 更新反馈状态（待处理、处理中、已解决、已关闭）
6. ✅ 添加回复
7. 回复会标记为"管理员回复"

## UI 差异

### 普通用户界面
- 标题：反馈与建议
- 副标题：向管理员发送反馈
- 列表：只显示自己家庭的反馈
- 详情页：显示反馈内容和管理员回复
- 回复区：显示提示"管理员会尽快回复您的反馈"
- 状态更新：不显示

### 超级管理员界面
- 标题：反馈管理中心
- 副标题：查看和回复用户反馈
- 列表：显示所有家庭的反馈
- 详情页：显示反馈内容和所有回复
- 回复区：显示回复输入框和发送按钮
- 状态更新：显示状态下拉选择器

## 测试场景

### 测试 1: 普通用户提交反馈
```sql
-- 以普通用户身份登录
-- family_id: e3ff47c0-03fa-443f-823f-833c76398f0d

-- 提交反馈（应该成功）
INSERT INTO feedback_messages (
  family_id,
  profile_id,
  subject,
  message,
  category,
  priority,
  status
) VALUES (
  'e3ff47c0-03fa-443f-823f-833c76398f0d',
  auth.uid(),
  '测试反馈',
  '这是一条测试反馈',
  'general',
  'normal',
  'pending'
);
```

### 测试 2: 普通用户尝试回复（应该失败）
```sql
-- 以普通用户身份登录

-- 尝试回复（应该失败 - RLS 拒绝）
INSERT INTO feedback_replies (
  feedback_id,
  family_id,
  profile_id,
  message,
  is_admin_reply
) VALUES (
  'some-feedback-id',
  'e3ff47c0-03fa-443f-823f-833c76398f0d',
  auth.uid(),
  '尝试回复',
  false
);
-- 预期结果: ERROR: new row violates row-level security policy
```

### 测试 3: 超级管理员回复（应该成功）
```sql
-- 以超级管理员身份登录
-- family_id: 79ed05a1-e0e5-4d8c-9a79-d8756c488171

-- 回复任何反馈（应该成功）
INSERT INTO feedback_replies (
  feedback_id,
  family_id,
  profile_id,
  message,
  is_admin_reply
) VALUES (
  'some-feedback-id',
  '79ed05a1-e0e5-4d8c-9a79-d8756c488171',
  auth.uid(),
  '感谢您的反馈，我们会尽快处理',
  true
);
```

### 测试 4: 普通用户查看回复（应该成功）
```sql
-- 以普通用户身份登录

-- 查看自己反馈的回复（应该成功）
SELECT 
  fr.id,
  fr.message,
  fr.is_admin_reply,
  fr.created_at,
  p.name as replier_name
FROM feedback_replies fr
LEFT JOIN profiles p ON fr.profile_id = p.id
WHERE fr.feedback_id IN (
  SELECT id FROM feedback_messages
  WHERE family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
)
ORDER BY fr.created_at ASC;
```

## 部署步骤

1. 执行权限限制脚本
```bash
# 在 Supabase SQL Editor 中执行
supabase/migrations/015_restrict_reply_permissions.sql
```

2. 验证策略
```sql
-- 查看 feedback_replies 的所有策略
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING'
    ELSE 'No USING'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as with_check_clause
FROM pg_policies 
WHERE tablename = 'feedback_replies'
ORDER BY policyname;
```

3. 测试功能
- [ ] 普通用户可以提交反馈
- [ ] 普通用户可以查看自己的反馈
- [ ] 普通用户可以查看管理员回复
- [ ] 普通用户不能添加回复（UI 隐藏）
- [ ] 普通用户尝试回复会被 RLS 拒绝
- [ ] 超级管理员可以查看所有反馈
- [ ] 超级管理员可以回复任何反馈
- [ ] 超级管理员可以更新反馈状态

## 相关文档

- [反馈系统完整文档](./PRIVACY_AND_FEEDBACK_SYSTEM.md)
- [RLS 修复指南](./FEEDBACK_RLS_FINAL_FIX.md)
- [系统设置集成](./SYSTEM_SETTINGS_INTEGRATION_COMPLETE.md)

---
**最后更新**: 2026-02-09  
**权限版本**: v3.0 - 限制回复权限
