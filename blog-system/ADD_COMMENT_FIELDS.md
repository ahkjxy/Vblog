# 添加评论字段迁移指南

## 问题
评论功能需要 `author_name` 和 `author_email` 字段来支持匿名用户评论，但数据库中缺少这些字段。

## 解决方案

### 方法 1: 使用 Supabase Dashboard（推荐）

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **SQL Editor**
4. 创建新查询并粘贴以下 SQL：

```sql
-- Add author_name and author_email fields to comments table
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS author_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS author_email VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
```

5. 点击 **Run** 执行 SQL

### 方法 2: 使用迁移文件

如果你使用 Supabase CLI：

```bash
# 应用迁移
supabase db push

# 或者手动运行迁移文件
psql $DATABASE_URL -f supabase/migration-add-comment-fields.sql
```

## 验证

执行以下 SQL 验证字段已添加：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comments';
```

应该看到：
- `author_name` (character varying)
- `author_email` (character varying)

## 字段说明

- **author_name**: 评论作者姓名（用于匿名用户）
- **author_email**: 评论作者邮箱（用于匿名用户）
- **user_id**: 如果是注册用户评论，此字段会有值；匿名用户为 NULL

## 使用场景

### 注册用户评论
- `user_id`: 用户 ID
- `author_name`: 从 profiles 表获取 username
- `author_email`: 从 auth.users 获取 email

### 匿名用户评论
- `user_id`: NULL
- `author_name`: 用户输入的姓名
- `author_email`: 用户输入的邮箱

## 注意事项

1. 匿名评论默认状态为 `pending`（待审核）
2. 管理员需要在后台审核后才会显示
3. 邮箱不会公开显示，仅用于管理员联系
