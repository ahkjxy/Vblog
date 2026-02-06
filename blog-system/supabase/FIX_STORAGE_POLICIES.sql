-- 修复媒体库存储策略
-- 解决上传图片时的 RLS 错误

-- 1. 检查 media bucket 是否存在
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'media';

-- 2. 如果 bucket 不存在，创建它
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media', 
    'media', 
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[];

-- 3. 删除所有现有的 media bucket 策略
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage all media" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket select policy" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket update policy" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket delete policy" ON storage.objects;

-- 4. 创建新的策略 - 允许所有认证用户上传
CREATE POLICY "Media bucket insert policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 5. 允许所有人读取（因为是公开 bucket）
CREATE POLICY "Media bucket select policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 6. 允许认证用户更新自己的文件
CREATE POLICY "Media bucket update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
)
WITH CHECK (
  bucket_id = 'media' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- 7. 允许认证用户删除自己的文件
CREATE POLICY "Media bucket delete policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- 8. 验证策略已创建
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Media bucket%'
ORDER BY policyname;

-- 9. 测试当前用户是否可以上传
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✓ 用户已认证，可以上传'
        ELSE '✗ 用户未认证'
    END as upload_status;

SELECT '✓ 存储策略已修复！所有认证用户现在都可以上传图片到媒体库。' as status;
