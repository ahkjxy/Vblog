# 文章审核系统实现文档

## 概述
实现了完整的文章审核系统，包括权限控制、审核流程和前台展示过滤。

## 核心功能

### 1. 审核状态管理
添加了三个新字段到 `posts` 表：
- `review_status`: 审核状态（pending/approved/rejected）
- `reviewed_by`: 审核者 ID
- `reviewed_at`: 审核时间

### 2. 权限控制

#### 家庭用户权限
- 只能查看和管理自己家庭的文章
- 可以创建文章（默认为待审核状态）
- 可以编辑自己家庭的文章
- 可以删除自己家庭的文章
- **不能修改审核状态**

#### 超级管理员权限
- 可以查看所有文章
- 可以审核所有文章
- 可以编辑所有文章（包括审核状态）
- 可以删除所有文章

超级管理员家庭 ID: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`

### 3. 前台展示规则
前台（博客页面）只显示：
- 状态为 `published`（已发布）
- 审核状态为 `approved`（已通过）

的文章。

## 数据库迁移

### 运行迁移脚本
```sql
-- 在 Supabase SQL Editor 中运行
blog-system/supabase/migration-add-review-system.sql
```

### 主要变更
1. 添加审核相关字段
2. 更新 RLS 策略
3. 创建审核函数 `approve_post()`
4. 创建待审核文章数量视图

## RLS 策略详解

### SELECT 策略
```sql
-- 1. 前台：公开访问已审核通过的文章
CREATE POLICY "Public can view approved published posts"
ON posts FOR SELECT
USING (status = 'published' AND review_status = 'approved');

-- 2. 后台：用户查看自己家庭的文章
CREATE POLICY "Users can view own family posts"
ON posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.family_id = p2.family_id
    WHERE p1.id = auth.uid()
    AND p2.id = posts.author_id
    AND p1.family_id IS NOT NULL
  )
);

-- 3. 后台：超级管理员查看所有文章
CREATE POLICY "Super admins can view all posts"
ON posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);
```

### INSERT 策略
```sql
-- 用户创建文章（默认待审核）
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND review_status = 'pending'
);
```

### UPDATE 策略
```sql
-- 1. 家庭用户更新自己家庭的文章
CREATE POLICY "Users can update own family posts"
ON posts FOR UPDATE
USING (家庭成员检查)
WITH CHECK (家庭成员检查);

-- 2. 超级管理员更新所有文章
CREATE POLICY "Super admins can update all posts"
ON posts FOR UPDATE
USING (超管检查)
WITH CHECK (超管检查);
```

### DELETE 策略
```sql
-- 1. 家庭用户删除自己家庭的文章
CREATE POLICY "Users can delete own family posts"
ON posts FOR DELETE
USING (家庭成员检查);

-- 2. 超级管理员删除所有文章
CREATE POLICY "Super admins can delete all posts"
ON posts FOR DELETE
USING (超管检查);
```

## 审核函数

### approve_post()
```sql
CREATE OR REPLACE FUNCTION approve_post(
  post_id UUID,
  approve BOOLEAN
)
RETURNS VOID
```

**功能**：
- 检查当前用户是否是超级管理员
- 更新文章的审核状态
- 记录审核者和审核时间

**使用方法**：
```typescript
await supabase.rpc('approve_post', {
  post_id: 'xxx-xxx-xxx',
  approve: true  // true=通过, false=拒绝
})
```

## 前端实现

### 1. 文章列表页面
**文件**: `blog-system/src/app/dashboard/posts/page.tsx`

**功能**：
- 显示审核状态列
- 超级管理员可以看到"审核"按钮
- 根据用户权限过滤文章列表

### 2. 审核页面
**文件**: `blog-system/src/app/dashboard/posts/[id]/review/page.tsx`

**功能**：
- 显示文章完整内容
- 显示作者和家庭信息
- 提供"通过"和"拒绝"按钮
- 只有超级管理员可以访问

### 3. 前台页面更新
**文件**：
- `blog-system/src/app/(frontend)/blog/page.tsx` - 博客列表
- `blog-system/src/app/(frontend)/blog/[slug]/page.tsx` - 文章详情
- `blog-system/src/app/(frontend)/page.tsx` - 首页

**变更**：
- 所有查询都添加了 `.eq('review_status', 'approved')` 过滤条件

### 4. 家庭系统集成
**文件**: `family-points-bank/components/BlogPosts.tsx`

**功能**：
- 在家庭积分系统的 Dashboard 显示最新博客文章
- 显示文章标题、摘要、作者、时间、浏览量
- 提供跳转到博客的链接
- 只显示已审核通过的文章

## 类型定义更新

**文件**: `blog-system/src/types/database.types.ts`

添加了审核相关字段：
```typescript
posts: {
  Row: {
    // ... 其他字段
    review_status: 'pending' | 'approved' | 'rejected'
    reviewed_by: string | null
    reviewed_at: string | null
  }
}
```

## 使用流程

### 家庭用户发布文章
1. 登录后台
2. 创建新文章
3. 编辑内容
4. 点击"发布"
5. 文章状态变为"已发布"，审核状态为"待审核"
6. 等待超级管理员审核

### 超级管理员审核文章
1. 登录后台
2. 进入"文章管理"
3. 看到待审核文章（黄色"待审核"标签）
4. 点击"审核"按钮
5. 查看文章内容
6. 点击"通过审核"或"拒绝文章"
7. 文章审核状态更新

### 前台用户浏览
1. 访问博客首页或文章列表
2. 只能看到已审核通过的文章
3. 点击文章查看详情

## 审核状态说明

| 状态 | 英文 | 说明 | 颜色 |
|------|------|------|------|
| 待审核 | pending | 文章已发布，等待审核 | 黄色 |
| 已通过 | approved | 超管审核通过，前台可见 | 绿色 |
| 已拒绝 | rejected | 超管拒绝，前台不可见 | 红色 |

## 注意事项

1. **默认状态**: 新创建的文章默认为 `pending` 状态
2. **前台可见性**: 只有 `published` + `approved` 的文章才在前台显示
3. **权限隔离**: 家庭用户之间的文章互相不可见
4. **审核权限**: 只有超级管理员可以审核文章
5. **家庭识别**: 通过 `family_id` 字段识别用户所属家庭

## 相关文件

### 数据库
- `blog-system/supabase/migration-add-review-system.sql` - 迁移脚本
- `blog-system/supabase/debug-posts.sql` - 调试脚本

### 后端
- `blog-system/src/types/database.types.ts` - 类型定义

### 前端 - 后台
- `blog-system/src/app/dashboard/posts/page.tsx` - 文章列表
- `blog-system/src/app/dashboard/posts/[id]/review/page.tsx` - 审核页面

### 前端 - 前台
- `blog-system/src/app/(frontend)/blog/page.tsx` - 博客列表
- `blog-system/src/app/(frontend)/blog/[slug]/page.tsx` - 文章详情
- `blog-system/src/app/(frontend)/page.tsx` - 首页

### 家庭系统
- `family-points-bank/components/BlogPosts.tsx` - 博客文章组件
- `family-points-bank/components/DashboardSection.tsx` - Dashboard 集成
- `family-points-bank/components/Icon.tsx` - 图标组件（添加了新图标）
- `family-points-bank/components/index.ts` - 组件导出

## 测试建议

1. **创建测试文章**: 使用家庭用户账号创建文章
2. **检查权限**: 确认家庭用户只能看到自己家庭的文章
3. **审核流程**: 使用超管账号审核文章
4. **前台验证**: 确认前台只显示已审核通过的文章
5. **家庭系统**: 检查家庭积分系统中是否正确显示博客文章
