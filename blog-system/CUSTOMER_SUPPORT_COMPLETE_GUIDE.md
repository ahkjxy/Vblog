# 博客系统客服功能完整指南

## 功能概述

博客系统的客服功能已完全集成到数据库，用户发送的消息会保存到 `feedback_messages` 表，超级管理员可以在元气银行后台查看和回复。

## 核心功能

### 1. 用户端（博客系统）
- ✅ 智能客服聊天窗口
- ✅ 常见问题快速回答
- ✅ 登录用户可发送消息到数据库
- ✅ 未登录用户提示先登录
- ✅ 消息发送成功/失败提示
- ✅ 引导用户到元气银行后台查看回复
- ✅ **自动加载历史聊天记录**（最近20条）
- ✅ **显示客服回复**

### 2. 管理端（元气银行后台）
- ✅ 超级管理员可查看所有反馈
- ✅ 超级管理员可回复用户反馈
- ✅ 用户可在"系统设置 → 反馈与建议"查看回复

## 技术实现

### 数据库表结构

#### feedback_messages 表
```sql
- id: UUID (主键)
- family_id: UUID (家庭ID)
- profile_id: UUID (用户ID)
- subject: TEXT (主题，默认"博客系统客服咨询")
- message: TEXT (消息内容)
- category: TEXT (分类: question/bug/feature/other)
- priority: TEXT (优先级: low/normal/high/urgent)
- status: TEXT (状态: pending/in_progress/resolved/closed)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### feedback_replies 表
```sql
- id: UUID (主键)
- feedback_id: UUID (关联 feedback_messages)
- profile_id: UUID (回复者ID)
- message: TEXT (回复内容)
- created_at: TIMESTAMP
```

### RLS 权限策略

#### 创建反馈（INSERT）
```sql
-- 任何认证用户都可以创建反馈
CREATE POLICY "Authenticated users can create feedback"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = feedback_messages.profile_id
      AND family_id = feedback_messages.family_id
    )
  );
```

#### 查看反馈（SELECT）
```sql
-- 用户可以查看自己的反馈
CREATE POLICY "Users can view own feedback"
  ON feedback_messages FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
    OR
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    OR
    -- 超级管理员可以查看所有反馈
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

#### 回复权限（INSERT on feedback_replies）
```sql
-- 只有超级管理员可以回复
CREATE POLICY "Super admin can reply"
  ON feedback_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );
```

## 组件实现

### CustomerSupport.tsx 核心逻辑

```typescript
// 1. 检查登录状态
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)
    
    if (user) {
      // 获取用户 profile（profiles 表的 id 就是 auth.users 的 id）
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, family_id')
        .eq('id', user.id)
        .maybeSingle()
      
      if (profile) {
        setUserProfile(profile)
      }
    }
  }
  
  checkAuth()
}, [])

// 2. 加载历史消息
useEffect(() => {
  const loadHistory = async () => {
    if (!isLoggedIn || !userProfile || historyLoaded) return

    setIsLoadingHistory(true)
    
    // 获取用户的反馈消息（最近20条）
    const { data: feedbacks } = await supabase
      .from('feedback_messages')
      .select('id, message, created_at, status')
      .eq('profile_id', userProfile.id)
      .order('created_at', { ascending: true })
      .limit(20)

    if (feedbacks && feedbacks.length > 0) {
      // 获取所有反馈的回复
      const feedbackIds = feedbacks.map(f => f.id)
      const { data: replies } = await supabase
        .from('feedback_replies')
        .select('feedback_id, message, created_at')
        .in('feedback_id', feedbackIds)
        .order('created_at', { ascending: true })

      // 合并消息和回复，按时间顺序显示
      const historyMessages = []
      feedbacks.forEach(feedback => {
        historyMessages.push({
          id: feedback.id,
          type: 'user',
          content: feedback.message,
          timestamp: new Date(feedback.created_at)
        })

        // 添加对应的回复
        const feedbackReplies = replies?.filter(r => r.feedback_id === feedback.id) || []
        feedbackReplies.forEach(reply => {
          historyMessages.push({
            id: `reply-${reply.feedback_id}`,
            type: 'bot',
            content: `💬 客服回复：\n\n${reply.message}`,
            timestamp: new Date(reply.created_at)
          })
        })
      })

      // 显示历史消息
      setMessages([
        { type: 'bot', content: '📜 以下是您的历史消息记录：' },
        ...historyMessages,
        { type: 'bot', content: '👋 欢迎回来！有什么可以帮助你的吗？' }
      ])
    }
    
    setHistoryLoaded(true)
    setIsLoadingHistory(false)
  }

  if (isOpen && isLoggedIn && userProfile) {
    loadHistory()
  }
}, [isOpen, isLoggedIn, userProfile, historyLoaded])

// 3. 发送消息到数据库
const handleSendMessage = async () => {
  if (!isLoggedIn || !userProfile) {
    // 提示用户登录
    return
  }

  // 获取最新的 profile 信息
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, family_id')
    .eq('id', userProfile.id)
    .maybeSingle()

  if (!currentProfile?.family_id) {
    throw new Error('用户没有关联的家庭')
  }

  // 保存到数据库
  await supabase.from('feedback_messages').insert({
    family_id: currentProfile.family_id,
    profile_id: currentProfile.id,
    subject: '博客系统客服咨询',
    message: messageContent,
    category: 'question',
    priority: 'normal',
    status: 'pending'
  })
}
```

## 关键修复

### 问题 1: profiles 表结构不匹配
**错误**: `column profiles.user_id does not exist`

**原因**: 博客系统的 profiles 表使用 `id UUID REFERENCES auth.users(id) PRIMARY KEY`，不是 `user_id`

**解决方案**: 
```typescript
// ❌ 错误
.eq('user_id', user.id)

// ✅ 正确
.eq('id', user.id)
```

### 问题 2: profiles 表列名不匹配
**错误**: `column profiles.username does not exist`

**原因**: 博客系统的 profiles 表可能使用 `name` 而不是 `username`

**解决方案**: 只查询必需的列
```typescript
// ✅ 只查询必需的列
.select('id, family_id')
```

### 问题 3: family_id 可能为 null
**原因**: 新注册用户可能还没有关联家庭

**解决方案**: 
```typescript
// 使用 maybeSingle() 而不是 single()
.maybeSingle()

// 检查 family_id 是否存在
if (!currentProfile?.family_id) {
  throw new Error('用户没有关联的家庭，请先在元气银行系统中完成设置')
}
```

## 用户流程

### 未登录用户
1. 打开客服窗口
2. 可以查看常见问题
3. 尝试发送消息时提示登录
4. 点击"立即登录"跳转到登录页

### 已登录用户（无家庭）
1. 打开客服窗口
2. 自动加载历史消息（如果有）
3. 发送消息
4. 提示"用户没有关联的家庭，请先在元气银行系统中完成设置"
5. 引导用户访问元气银行完成设置

### 已登录用户（有家庭）
1. 打开客服窗口
2. **自动加载历史消息**（最近20条）
3. **显示之前的问题和客服回复**
4. 发送新消息
5. 消息保存到数据库
6. 显示成功提示
7. 引导用户到元气银行后台查看回复

### 超级管理员
1. 登录元气银行后台
2. 进入"系统设置 → 反馈与建议"
3. 查看所有用户反馈
4. 回复用户问题
5. 用户在博客系统客服窗口可以看到回复（打开窗口时自动加载）

## 测试清单

- [ ] 未登录用户打开客服窗口
- [ ] 未登录用户尝试发送消息（应提示登录）
- [ ] 已登录用户（无家庭）发送消息（应提示设置家庭）
- [ ] 已登录用户（有家庭）发送消息（应成功保存）
- [ ] **已登录用户打开窗口时自动加载历史消息**
- [ ] **历史消息按时间顺序显示（用户消息 + 客服回复）**
- [ ] **关闭窗口后重新打开，重新加载最新消息**
- [ ] 超级管理员查看所有反馈
- [ ] 超级管理员回复用户反馈
- [ ] **用户打开客服窗口看到管理员的回复**
- [ ] 常见问题快速回答功能
- [ ] 移动端响应式布局
- [ ] 加载历史消息时显示加载指示器

## 相关文件

### 前端组件
- `blog-system/src/components/CustomerSupport.tsx` - 客服聊天组件
- `family-points-bank/components/FeedbackModal.tsx` - 反馈管理组件
- `family-points-bank/components/SystemSettings.tsx` - 系统设置（包含反馈入口）

### 数据库迁移
- `family-points-bank/supabase/migrations/012_add_privacy_and_feedback.sql` - 创建反馈表
- `family-points-bank/supabase/migrations/013_final_feedback_rls_fix.sql` - 修复 RLS 策略
- `family-points-bank/supabase/migrations/014_diagnose_and_fix_feedback.sql` - 诊断和修复
- `family-points-bank/supabase/migrations/015_restrict_reply_permissions.sql` - 限制回复权限
- `family-points-bank/supabase/migrations/016_allow_blog_users_feedback.sql` - 允许博客用户反馈

### 文档
- `blog-system/CUSTOMER_SUPPORT_FEATURE.md` - 功能说明
- `blog-system/CUSTOMER_SUPPORT_DATABASE_INTEGRATION.md` - 数据库集成
- `blog-system/CUSTOMER_SUPPORT_PERMISSION_FIX.md` - 权限修复
- `blog-system/CUSTOMER_SUPPORT_COMPLETE_GUIDE.md` - 完整指南（本文档）

## 注意事项

1. **数据库共享**: 博客系统和元气银行使用同一个 Supabase 数据库
2. **profiles 表结构**: 博客系统的 profiles 表主键是 `id`，不是 `user_id`
3. **family_id 必需**: 用户必须有 family_id 才能发送反馈
4. **超级管理员**: 只有 family_id 为 `79ed05a1-e0e5-4d8c-9a79-d8756c488171` 的用户可以回复
5. **权限策略**: 使用 RLS 确保数据安全

## 未来改进

- [ ] 添加消息通知功能
- [ ] 支持附件上传
- [ ] 添加消息已读状态
- [ ] 支持消息搜索和过滤
- [ ] 添加客服工单系统
- [ ] 支持多语言客服
- [ ] 添加客服满意度评价
- [ ] 实时消息推送（WebSocket）
- [ ] 分页加载更多历史消息
- [ ] 消息导出功能

---

**最后更新**: 2024-02-09
**维护者**: Kiro AI Assistant

## 更新日志

### 2024-02-09
- ✅ 添加历史消息自动加载功能
- ✅ 显示客服回复在聊天窗口
- ✅ 添加加载指示器
- ✅ 优化消息显示顺序
- ✅ 支持最近20条消息加载
