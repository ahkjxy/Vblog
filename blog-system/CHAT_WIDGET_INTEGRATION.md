# 博客后台聊天功能集成

## 功能概述

已将元气银行的家庭聊天功能成功迁移到博客后台，允许博客管理员与家庭成员实时沟通。

## 实现细节

### 1. 组件结构

- **ChatWidget.tsx** - 主聊天组件（客户端组件）
  - 位置：`blog-system/src/components/dashboard/ChatWidget.tsx`
  - 功能：消息显示、发送、实时订阅

- **DashboardClientWrapper.tsx** - 客户端包装器
  - 位置：`blog-system/src/components/dashboard/DashboardClientWrapper.tsx`
  - 作用：在服务器组件布局中渲染客户端聊天组件

### 2. 核心功能

#### 用户识别
- 自动获取当前登录用户
- 通过 `family_members` 表查找用户所属家庭
- 获取家长的 profile 信息作为聊天身份

#### 消息管理
- 从 `messages` 表加载最近 50 条消息
- 实时订阅新消息（使用 Supabase Realtime）
- 支持发送文本消息和表情符号

#### UI 特性
- 浮动聊天按钮（右下角）
- 未读消息计数徽章
- 可最大化/最小化的聊天窗口
- 响应式设计，适配移动端
- 系统消息特殊显示

### 3. 数据库依赖

使用与元气银行相同的数据表：

```sql
-- messages 表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id),
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- family_members 表
CREATE TABLE family_members (
  family_id UUID NOT NULL REFERENCES families(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (family_id, user_id)
);

-- profiles 表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  family_id UUID REFERENCES families(id),
  name TEXT NOT NULL,
  avatar_url TEXT,
  avatar_color TEXT,
  role TEXT NOT NULL
);
```

### 4. 权限要求

- 用户必须登录博客后台
- 用户必须关联到一个家庭（通过 `family_members` 表）
- 只能查看和发送所属家庭的消息

### 5. 使用场景

1. **博客管理员与家庭成员沟通**
   - 管理员可以在后台直接与家庭成员聊天
   - 实时接收家庭成员的消息

2. **系统通知**
   - 支持显示系统消息（以 `[系统]` 开头）
   - 系统消息居中显示，样式特殊

3. **多设备同步**
   - 通过 Supabase Realtime 实现多设备消息同步
   - 消息实时推送到所有在线设备

## 集成位置

聊天组件已集成到博客后台布局中：
- 文件：`blog-system/src/app/dashboard/layout.tsx`
- 位置：页面右下角浮动按钮
- 可见范围：所有后台页面

## 样式特点

- 使用紫粉渐变色主题，与博客系统风格一致
- 圆角设计，现代化 UI
- 平滑动画过渡
- 支持明暗主题（当前为亮色主题）

## 未来优化方向

1. **消息通知**
   - 添加浏览器通知支持
   - 消息提示音

2. **功能增强**
   - 消息搜索
   - 消息删除/编辑
   - 图片/文件发送
   - @提及功能

3. **性能优化**
   - 消息分页加载
   - 虚拟滚动（大量消息时）
   - 离线消息缓存

## 注意事项

1. 聊天功能依赖 Supabase Realtime，需要确保 Supabase 项目已启用 Realtime 功能
2. 用户必须有有效的家庭关联才能使用聊天功能
3. 消息存储在共享数据库中，博客系统和元气银行系统可以互通消息
