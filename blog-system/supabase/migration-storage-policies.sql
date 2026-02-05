-- Storage bucket for media files
-- 首先需要在 Supabase Dashboard 中创建 bucket: media
-- 或者使用以下 SQL (需要 supabase_storage_admin 权限)

-- 创建 media bucket (如果还没有创建)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 删除现有的策略（如果存在）
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own media" ON storage.objects;

-- 1. 允许已认证用户上传文件到 media bucket
CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. 允许所有人读取 media bucket 中的文件（因为是公开的）
CREATE POLICY "Allow public to read media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 3. 允许用户更新自己上传的文件
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

-- 4. 允许用户删除自己上传的文件
CREATE POLICY "Allow users to delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 允许管理员管理所有文件
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
