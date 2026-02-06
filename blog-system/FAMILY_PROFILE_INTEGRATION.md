# 家庭积分系统个人信息集成

## 概述

博客系统现在可以读取和显示家庭积分系统（Family Points Bank）的个人信息，包括：
- 用户名称
- 头像（图片或颜色）
- 元气值余额
- 家庭关系

## 数据流程

### 1. 用户登录
用户在任一系统登录后，session 通过跨域 cookie 共享（domain: `.familybank.chat`）

### 2. 获取个人信息
博客系统按以下优先级获取用户信息：

```typescript
// 1. 获取 family_members 记录（包含 current_profile_id）
family_members.user_id = auth.user.id
  ↓
// 2. 获取当前选中的 profile（家庭积分系统）
profiles.id = family_members.current_profile_id
  ↓
// 3. 回退到博客系统的 profile
profiles.id = auth.user.id (博客系统)
```

### 3. 数据优先级

| 字段 | 优先来源 | 回退来源 |
|------|---------|---------|
| 名称 | 家庭 profile.name | 博客 profile.username |
| 头像 | 家庭 profile.avatar_url | 博客 profile.avatar_url |
| 头像颜色 | 家庭 profile.avatar_color | - |
| 元气值 | 家庭 profile.balance | - |
| 角色权限 | 博客 profile.role | 'author' |

## 数据库表结构

### family_members 表
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id),
  user_id UUID REFERENCES auth.users(id),
  current_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### profiles 表（扩展）
```sql
-- 家庭积分系统字段
ALTER TABLE profiles ADD COLUMN name TEXT;
ALTER TABLE profiles ADD COLUMN balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN avatar_color TEXT;
ALTER TABLE profiles ADD COLUMN family_id UUID REFERENCES families(id);
ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN experience INTEGER DEFAULT 0;
```

## 显示效果

### Dashboard 侧边栏

**有家庭积分数据时：**
```
┌─────────────────────────────┐
│  [彩色头像]  王小明          │
│              管理员  ⚡ 1250 │
└─────────────────────────────┘
```

**仅博客数据时：**
```
┌─────────────────────────────┐
│  [渐变头像]  user@email.com │
│              作者            │
└─────────────────────────────┘
```

### 头像显示逻辑

1. **有图片头像** → 显示图片
2. **有颜色头像** → 显示彩色圆形 + 名字最后一个字
3. **无头像** → 显示渐变圆形 + 名字首字母

## 实现文件

### 类型定义
- `blog-system/src/types/database.types.ts` - 添加家庭表结构

### 查询逻辑
- `blog-system/src/app/dashboard/layout.tsx` - 获取和显示个人信息

### Cookie 配置
- `blog-system/src/lib/supabase/client.ts` - 跨域 cookie
- `blog-system/src/lib/supabase/server.ts` - 服务端 cookie
- `blog-system/src/middleware.ts` - 中间件 cookie

## 测试步骤

1. **在家庭积分系统登录**
   ```
   访问: https://www.familybank.chat/
   登录账号
   ```

2. **切换到博客系统**
   ```
   访问: https://blog.familybank.chat/dashboard
   应该自动登录并显示家庭信息
   ```

3. **验证显示内容**
   - ✅ 显示家庭积分系统的名称
   - ✅ 显示头像颜色或图片
   - ✅ 显示元气值余额
   - ✅ "进入 XX 的家庭" 按钮显示正确

## 故障排查

### 问题：显示的是邮箱而不是名字

**原因：** 没有找到家庭积分系统的 profile

**检查：**
```sql
-- 1. 检查 family_members 记录
SELECT * FROM family_members WHERE user_id = 'your-user-id';

-- 2. 检查 current_profile_id 是否有效
SELECT * FROM profiles WHERE id = 'current-profile-id';
```

### 问题：没有显示元气值

**原因：** current_profile_id 为空或 profile 不存在

**解决：**
1. 在家庭积分系统中创建或选择一个 profile
2. 确保 family_members.current_profile_id 已设置

### 问题：头像颜色不显示

**原因：** avatar_color 字段为空

**解决：**
在家庭积分系统中为 profile 设置 avatar_color

## 安全考虑

1. **RLS 策略**
   - family_members 表需要 RLS 策略
   - 用户只能读取自己的记录

2. **数据隔离**
   - 博客系统只读取家庭数据，不修改
   - 家庭数据的修改只在家庭积分系统进行

3. **Cookie 安全**
   - 使用 Secure flag（仅 HTTPS）
   - 使用 SameSite=Lax 防止 CSRF
   - Domain 设置为 `.familybank.chat`

## 未来扩展

### 可能的功能

1. **积分奖励**
   - 发布文章获得元气值
   - 评论互动获得元气值

2. **家庭博客**
   - 家庭成员协作写博客
   - 家庭相册和日记

3. **成就系统**
   - 博客成就同步到家庭积分系统
   - 解锁特殊徽章

## 相关文档

- [跨域 Session 配置](./CROSS_DOMAIN_SESSION.md)
- [部署指南](./VERCEL_DEPLOYMENT.md)
- [数据库设置](./DATABASE_SETUP.md)
