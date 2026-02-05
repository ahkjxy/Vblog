# 数据库设置指南

## 初始设置

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY) - 仅用于服务端

### 2. 运行数据库 Schema

在 Supabase Dashboard 的 SQL Editor 中运行 `supabase/schema.sql` 文件的内容。

这将创建：
- ✅ 所有表（profiles, posts, categories, tags, comments, settings）
- ✅ 关联表（post_categories, post_tags）
- ✅ 索引
- ✅ Row Level Security (RLS) 策略
- ✅ 触发器（自动创建 profile）

### 3. 创建存储桶

在 Supabase Dashboard 的 Storage 部分：

1. 创建名为 `media` 的公共桶
2. 设置：
   - Public: ✅ 是
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

或者在 SQL Editor 中运行：

```sql
-- 创建媒体存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- 设置存储策略
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. 配置环境变量

在 `blog-system/.env.local` 中设置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 更新现有数据库

如果你已经创建了表但缺少某些策略，运行：

```bash
# 在 Supabase SQL Editor 中运行
supabase/migration-add-rls-policies.sql
```

### 修复无效的 Slug

如果你的文章有无效的 slug（如 `-1`, `--`, 空值等），运行：

```sql
-- 在 Supabase SQL Editor 中运行
supabase/fix-slugs.sql
```

这将把所有无效的 slug 更新为 `post-{timestamp}` 格式。

之后，你可以在后台编辑页面手动修改为更友好的 slug。

## 验证设置

### 检查表是否创建

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

应该看到：
- categories
- comments
- post_categories
- post_tags
- posts
- profiles
- settings
- tags

### 检查 RLS 是否启用

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

所有表的 `rowsecurity` 应该为 `true`。

### 检查策略

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 测试数据插入

```sql
-- 创建测试用户（需要先通过 Supabase Auth 注册）
-- 然后可以测试插入数据

-- 插入分类
INSERT INTO categories (name, slug, description)
VALUES ('技术', 'tech', '技术相关文章');

-- 插入标签
INSERT INTO tags (name, slug)
VALUES ('Next.js', 'nextjs');

-- 检查数据
SELECT * FROM categories;
SELECT * FROM tags;
```

## 创建管理员用户

1. 通过应用注册一个新用户
2. 在 Supabase SQL Editor 中将该用户设为管理员：

```sql
-- 替换 'user@example.com' 为实际邮箱
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## 常见问题

### Q: 无法插入数据
A: 检查 RLS 策略是否正确设置，确保用户已认证且有正确的角色。

### Q: 查询返回空结果
A: 检查 RLS 策略，确保查询的数据符合策略条件（如 status = 'published'）。

### Q: 外键约束错误
A: 确保引用的记录存在，特别是 author_id 必须存在于 profiles 表中。

### Q: 存储上传失败
A: 检查存储桶是否创建，策略是否正确设置，文件大小是否超限。

## 数据库维护

### 备份

在 Supabase Dashboard 的 Settings > Database 中可以：
- 下载数据库备份
- 设置自动备份计划

### 性能优化

```sql
-- 分析表统计信息
ANALYZE posts;
ANALYZE comments;

-- 检查慢查询
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- 重建索引（如果需要）
REINDEX TABLE posts;
```

### 清理旧数据

```sql
-- 删除超过 1 年的已归档文章
DELETE FROM posts 
WHERE status = 'archived' 
AND updated_at < NOW() - INTERVAL '1 year';

-- 删除被拒绝的评论
DELETE FROM comments 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '30 days';
```
