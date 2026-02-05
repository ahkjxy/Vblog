# 修复 Supabase Storage RLS 权限问题

## 问题描述
上传文件时出现错误：
```
{"statusCode": "403","error": "Unauthorized","message": "new row violates row-level security policy"}
```

这是因为 Supabase Storage 的 RLS（Row Level Security）策略没有正确配置。

## 解决方案

### 方法 1：在 Supabase Dashboard 中配置（推荐）

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目

2. **创建 Storage Bucket（如果还没有）**
   - 进入 Storage 页面
   - 点击 "New bucket"
   - Bucket 名称：`media`
   - 勾选 "Public bucket"（允许公开访问）
   - 点击 "Create bucket"

3. **配置 RLS 策略**
   - 在 Storage 页面，点击 `media` bucket
   - 点击 "Policies" 标签
   - 点击 "New policy"

#### 策略 1：允许已认证用户上传文件
```sql
-- Policy name: Allow authenticated users to upload media
-- Allowed operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 策略 2：允许所有人读取文件
```sql
-- Policy name: Allow public to read media
-- Allowed operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public to read media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');
```

#### 策略 3：允许用户更新自己的文件
```sql
-- Policy name: Allow users to update own media
-- Allowed operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Allow users to update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 策略 4：允许用户删除自己的文件
```sql
-- Policy name: Allow users to delete own media
-- Allowed operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow users to delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 策略 5：允许管理员管理所有文件
```sql
-- Policy name: Allow admins to manage all media
-- Allowed operation: ALL
-- Target roles: authenticated

CREATE POLICY "Allow admins to manage all media"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 方法 2：使用 SQL 编辑器

1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 复制并执行 `supabase/migration-storage-policies.sql` 文件中的内容
3. 点击 "Run" 执行

### 方法 3：简化版策略（如果上面的不工作）

如果上面的策略不工作，可以尝试更简单的策略：

```sql
-- 删除所有现有策略
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage all media" ON storage.objects;

-- 允许已认证用户上传到 media bucket
CREATE POLICY "Authenticated users can upload to media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 允许所有人读取 media bucket
CREATE POLICY "Public can read media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 允许已认证用户更新 media bucket
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- 允许已认证用户删除 media bucket
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
```

## 验证配置

1. **检查 Bucket 是否存在**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'media';
   ```

2. **检查策略是否生效**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
   ```

3. **测试上传**
   - 登录到应用
   - 进入媒体库页面
   - 尝试上传一张图片
   - 如果成功，说明配置正确

## 文件路径结构

应用使用以下路径结构存储文件：
```
media/
  └── {user_id}/
      ├── 1234567890.jpg
      ├── 1234567891.png
      └── ...
```

每个用户的文件存储在以其 `user_id` 命名的文件夹中。

## 常见问题

### Q: 为什么需要 RLS 策略？
A: Supabase Storage 默认启用 RLS，没有策略时任何操作都会被拒绝。

### Q: 为什么使用 `(storage.foldername(name))[1]`？
A: 这个函数提取文件路径的第一个文件夹名称（即 user_id），确保用户只能访问自己的文件。

### Q: 如果我想让所有已认证用户都能上传，怎么办？
A: 使用简化版策略，去掉文件夹名称检查。

### Q: 如何允许匿名用户上传？
A: 将策略中的 `TO authenticated` 改为 `TO public`，但不推荐这样做。

## 安全建议

1. **使用文件夹隔离**：每个用户的文件存储在独立文件夹中
2. **文件类型验证**：在客户端和服务端都验证文件类型
3. **文件大小限制**：设置合理的文件大小限制（当前为 5MB）
4. **定期清理**：定期清理未使用的文件
5. **备份策略**：定期备份重要文件

## 相关文件

- `supabase/migration-storage-policies.sql` - Storage RLS 策略迁移文件
- `src/app/dashboard/media/page.tsx` - 媒体库页面
- `src/lib/supabase/client.ts` - Supabase 客户端配置

## 参考文档

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
