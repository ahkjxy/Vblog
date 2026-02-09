# 客服系统数据库集成

## 概述
博客系统的客服消息功能已与家庭积分银行的反馈系统共享同一个数据库。只有登录用户才能发送消息，超级管理员可以在反馈管理中心查看和回复所有客服消息。

## 功能特点

### 1. 登录验证
- ✅ 未登录用户可以查看常见问题
- ✅ 未登录用户尝试发送消息时会提示登录
- ✅ 提供"立即登录"按钮跳转到登录页面
- ✅ 登录后自动获取用户 profile 信息

### 2. 消息保存
- ✅ 消息保存到 `feedback_messages` 表
- ✅ 自动关联用户的 `family_id` 和 `profile_id`
- ✅ 消息分类为"博客系统客服咨询"
- ✅ 优先级设置为"普通"
- ✅ 状态设置为"待处理"

### 3. 超级管理员查看
- ✅ 超级管理员在元气银行后台可以看到所有消息
- ✅ 位置：系统设置 → 反馈与建议
- ✅ 可以回复客服消息
- ✅ 可以更新消息状态

## 数据库结构

### feedback_messages 表
```sql
CREATE TABLE feedback_messages (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL,           -- 用户家庭 ID
  profile_id UUID,                   -- 用户 profile ID
  subject VARCHAR(200) NOT NULL,     -- 主题（固定为"博客系统客服咨询"）
  message TEXT NOT NULL,             -- 消息内容
  category VARCHAR(50),              -- 分类（固定为"question"）
  status VARCHAR(20),                -- 状态：pending, in_progress, resolved, closed
  priority VARCHAR(20),              -- 优先级（固定为"normal"）
  created_at TIMESTAMPTZ,            -- 创建时间
  updated_at TIMESTAMPTZ             -- 更新时间
);
```

### 插入数据示例
```typescript
await supabase.from('feedback_messages').insert({
  family_id: userProfile.family_id,
  profile_id: userProfile.id,
  subject: '博客系统客服咨询',
  message: '用户输入的消息内容',
  category: 'question',
  priority: 'normal',
  status: 'pending'
})
```

## 用户流程

### 未登录用户
1. 点击客服按钮打开聊天窗口
2. 查看欢迎消息和常见问题
3. 点击常见问题查看答案（本地交互）
4. 尝试发送消息时提示登录
5. 点击"立即登录"跳转到登录页面

### 登录用户
1. 点击客服按钮打开聊天窗口
2. 查看欢迎消息和常见问题
3. 输入问题并发送
4. 消息保存到数据库
5. 收到成功提示
6. 可以在元气银行后台查看回复

### 超级管理员
1. 登录元气银行后台
2. 进入"系统设置 → 反馈与建议"
3. 查看所有反馈（包括博客系统客服消息）
4. 识别标题为"博客系统客服咨询"的消息
5. 点击查看详情
6. 添加回复
7. 更新状态（处理中、已解决、已关闭）

## 技术实现

### 1. 登录状态检测
```typescript
const { data: { user } } = await supabase.auth.getUser()
setIsLoggedIn(!!user)

if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, family_id')
    .eq('user_id', user.id)
    .single()
  
  setUserProfile(profile)
}
```

### 2. 消息发送验证
```typescript
const handleSendMessage = async () => {
  // 检查登录状态
  if (!isLoggedIn || !userProfile) {
    // 显示登录提示
    return
  }
  
  // 保存到数据库
  const { error } = await supabase.from('feedback_messages').insert({
    family_id: userProfile.family_id,
    profile_id: userProfile.id,
    subject: '博客系统客服咨询',
    message: messageContent,
    category: 'question',
    priority: 'normal',
    status: 'pending'
  })
  
  if (error) {
    // 显示错误提示
  } else {
    // 显示成功提示
  }
}
```

### 3. UI 状态管理
```typescript
{!isLoggedIn ? (
  <div className="text-center space-y-3">
    <p>请先登录后再发送消息</p>
    <a href="/auth">立即登录</a>
  </div>
) : (
  <div className="flex items-center gap-2">
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      disabled={isSubmitting}
    />
    <button
      onClick={handleSendMessage}
      disabled={!inputValue.trim() || isSubmitting}
    >
      {isSubmitting ? <Spinner /> : <Send />}
    </button>
  </div>
)}
```

## RLS 策略

### 查看权限
```sql
-- 用户可以查看自己家庭的反馈或超级管理员可以查看所有
CREATE POLICY "Users can view feedback"
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

### 插入权限
```sql
-- 用户可以创建自己家庭的反馈
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

## 消息类型识别

### 博客系统客服消息特征
- **主题**: "博客系统客服咨询"
- **分类**: "question"
- **优先级**: "normal"
- **来源**: 博客系统前端

### 元气银行反馈消息特征
- **主题**: 用户自定义
- **分类**: general, bug, feature, question, other
- **优先级**: low, normal, high, urgent
- **来源**: 元气银行系统设置

## 用户体验优化

### 1. 登录提示
```
⚠️ 请先登录后再发送消息。

登录后，您的消息将被保存，我们的客服团队会尽快回复。
```

### 2. 成功提示
```
✅ 您的消息已成功发送！

我们的客服团队会在24小时内回复您。您可以在元气银行后台的"系统设置 → 反馈与建议"中查看回复。
```

### 3. 错误提示
```
❌ 消息发送失败，请稍后重试。

如需紧急帮助，请发送邮件至：ahkjxy@qq.com
```

### 4. 提交状态
- 显示加载动画
- 禁用输入框和发送按钮
- 防止重复提交

## 测试清单

### 未登录用户测试
- [ ] 打开客服窗口
- [ ] 查看欢迎消息
- [ ] 点击常见问题
- [ ] 尝试发送消息
- [ ] 看到登录提示
- [ ] 点击"立即登录"跳转

### 登录用户测试
- [ ] 登录账号
- [ ] 打开客服窗口
- [ ] 输入消息
- [ ] 点击发送
- [ ] 看到成功提示
- [ ] 在数据库中验证消息
- [ ] 在元气银行后台查看消息

### 超级管理员测试
- [ ] 以超级管理员登录
- [ ] 进入反馈管理中心
- [ ] 查看所有反馈
- [ ] 找到博客系统客服消息
- [ ] 查看消息详情
- [ ] 添加回复
- [ ] 更新状态

### 错误处理测试
- [ ] 网络错误时的提示
- [ ] 数据库错误时的提示
- [ ] 权限错误时的提示
- [ ] 重复提交的防护

## 数据库查询

### 查看所有博客系统客服消息
```sql
SELECT 
  fm.id,
  fm.message,
  fm.created_at,
  p.name as user_name,
  f.name as family_name,
  fm.status
FROM feedback_messages fm
LEFT JOIN profiles p ON fm.profile_id = p.id
LEFT JOIN families f ON fm.family_id = f.id
WHERE fm.subject = '博客系统客服咨询'
ORDER BY fm.created_at DESC;
```

### 查看待处理的客服消息
```sql
SELECT 
  fm.id,
  fm.message,
  fm.created_at,
  p.name as user_name
FROM feedback_messages fm
LEFT JOIN profiles p ON fm.profile_id = p.id
WHERE fm.subject = '博客系统客服咨询'
  AND fm.status = 'pending'
ORDER BY fm.created_at DESC;
```

### 统计客服消息数量
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved
FROM feedback_messages
WHERE subject = '博客系统客服咨询';
```

## 未来优化

### 1. 消息通知
- 用户收到回复时发送邮件通知
- 在博客系统中显示未读回复数量
- 添加消息推送功能

### 2. 实时聊天
- 使用 Supabase Realtime 实现实时消息
- 超级管理员在线时即时回复
- 显示对方输入状态

### 3. 消息历史
- 在博客系统中显示历史消息
- 用户可以查看所有对话记录
- 支持搜索和筛选

### 4. 智能回复
- 基于常见问题的自动回复
- AI 辅助回复建议
- 快捷回复模板

## 相关文档

- [反馈系统权限说明](../family-points-bank/FEEDBACK_PERMISSIONS.md)
- [反馈系统 RLS 修复](../family-points-bank/FEEDBACK_RLS_FINAL_FIX.md)
- [客服功能文档](./CUSTOMER_SUPPORT_FEATURE.md)
- [系统架构文档](../SYSTEM_ARCHITECTURE.md)

---
**创建时间**: 2026-02-09  
**最后更新**: 2026-02-09  
**版本**: v1.0
