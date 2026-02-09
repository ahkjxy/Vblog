# 客服反馈系统完整指南

## 概述

博客系统的客服反馈功能已完全集成，超级管理员可以在后台查看和回复用户反馈。

## 功能特性

### 前台客服组件 (CustomerSupport.tsx)

**位置**: `blog-system/src/components/CustomerSupport.tsx`

**功能**:
- ✅ 浮动客服按钮（右下角）
- ✅ 登录状态检测
- ✅ 未登录用户：显示常见问题 (FAQ) 和引导登录
- ✅ 已登录用户：可以发送反馈消息到数据库
- ✅ 自动加载历史消息（最近20条）
- ✅ 显示管理员回复
- ✅ 实时认证状态监听

**使用方式**:
```tsx
import { CustomerSupport } from '@/components/CustomerSupport'

// 在任何页面添加
<CustomerSupport />
```

### 后台管理页面 (FeedbackManagement)

**位置**: 
- 页面: `blog-system/src/app/dashboard/feedback/page.tsx`
- 组件: `blog-system/src/components/dashboard/FeedbackManagement.tsx`

**功能**:
- ✅ 查看所有用户反馈列表
- ✅ 按状态筛选（全部、待处理、处理中、已解决）
- ✅ 查看反馈详情和完整对话历史
- ✅ 管理员回复功能
- ✅ 更新反馈状态
- ✅ 实时数据加载

**访问权限**: 仅超级管理员可访问

**导航菜单**: 后台左侧菜单 → "客服管理"

## 数据库结构

### feedback_messages 表
```sql
- id: UUID (主键)
- family_id: UUID (关联 families 表)
- profile_id: UUID (关联 profiles 表)
- subject: TEXT (主题)
- message: TEXT (消息内容)
- category: TEXT (分类: general, bug, feature, question, other)
- priority: TEXT (优先级: low, normal, high, urgent)
- status: TEXT (状态: pending, in_progress, resolved, closed)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### feedback_replies 表
```sql
- id: UUID (主键)
- feedback_id: UUID (关联 feedback_messages)
- family_id: UUID (关联 families 表)
- profile_id: UUID (关联 profiles 表)
- message: TEXT (回复内容)
- is_admin_reply: BOOLEAN (是否为管理员回复)
- created_at: TIMESTAMP
```

## RLS 策略

### feedback_messages
- ✅ 任何认证用户可以创建反馈
- ✅ 用户可以查看自己的反馈
- ✅ 超级管理员可以查看所有反馈
- ✅ 超级管理员可以更新反馈状态

### feedback_replies
- ✅ 任何认证用户可以创建回复
- ✅ 用户可以查看自己反馈的回复
- ✅ 超级管理员可以查看所有回复

## 迁移文件

**位置**: `family-points-bank/supabase/migrations/016_allow_blog_users_feedback.sql`

**内容**:
- 更新 RLS 策略允许博客用户创建反馈
- 确保跨系统数据访问权限

## 使用流程

### 用户端
1. 访问博客任意页面
2. 点击右下角客服按钮
3. 如未登录，查看 FAQ 或点击登录
4. 登录后，输入反馈消息并发送
5. 查看历史消息和管理员回复

### 管理员端
1. 登录博客后台
2. 点击左侧菜单"客服管理"
3. 查看反馈列表，可按状态筛选
4. 点击反馈查看详情
5. 输入回复并发送
6. 更新反馈状态（待处理 → 处理中 → 已解决）

## 超级管理员配置

**超级管理员家庭 ID**: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`

**判断逻辑**:
```typescript
const isSuperAdmin = userProfile?.role === 'admin' && 
                     userProfile?.family_id === SUPER_ADMIN_FAMILY_ID
```

## 技术细节

### 前台组件特性
- 使用 `'use client'` 客户端组件
- 实时认证状态监听
- 自动加载历史消息
- 优雅的加载状态显示
- 响应式设计

### 后台组件特性
- 服务端渲染页面 + 客户端组件
- 权限检查在服务端完成
- 实时数据更新
- 状态管理和筛选
- 完整的对话历史展示

## 已完成的清理工作

### 删除的错误组件
- ❌ `blog-system/src/components/dashboard/ChatWidget.tsx` (家庭聊天组件，不适用于博客)
- ❌ `blog-system/src/components/dashboard/DashboardClientWrapper.tsx` (包装器组件)

### 更新的文件
- ✅ `blog-system/src/app/dashboard/layout.tsx`
  - 添加"客服管理"菜单项
  - 移除错误的聊天组件引用
  - 清理导入语句

## 测试清单

- [x] 未登录用户可以看到 FAQ
- [x] 登录用户可以发送反馈
- [x] 反馈保存到数据库
- [x] 历史消息正确加载
- [x] 超级管理员可以访问后台
- [x] 普通用户无法访问后台
- [x] 管理员可以查看所有反馈
- [x] 管理员可以回复反馈
- [x] 管理员可以更新状态
- [x] 用户可以看到管理员回复
- [x] TypeScript 编译无错误
- [x] 构建成功

## 下一步优化建议

1. **邮件通知**: 当管理员回复时，发送邮件通知用户
2. **实时更新**: 使用 Supabase Realtime 实现实时消息推送
3. **附件支持**: 允许用户上传截图或文件
4. **统计面板**: 添加反馈统计和分析图表
5. **自动分类**: 使用 AI 自动分类和优先级判断
6. **快捷回复**: 预设常用回复模板
7. **满意度评价**: 用户可以对回复进行评分

## 相关文档

- [数据库设置](./DATABASE_SETUP.md)
- [权限系统](./PERMISSION_SYSTEM.md)
- [系统架构](../SYSTEM_ARCHITECTURE.md)
- [隐私与反馈系统](../family-points-bank/PRIVACY_AND_FEEDBACK_SYSTEM.md)

---

**最后更新**: 2026年2月9日
**状态**: ✅ 完成并测试通过
