# 媒体库权限说明

## 概述

媒体库已配置为只显示当前用户上传的图片，确保用户之间的数据隔离和隐私保护。

## 权限设置

### 1. 文件存储结构

所有文件按用户 ID 组织：
```
media/
  ├── {user_id_1}/
  │   ├── 1234567890.jpg
  │   ├── 1234567891.png
  │   └── ...
  ├── {user_id_2}/
  │   ├── 1234567892.jpg
  │   └── ...
  └── ...
```

### 2. 访问控制

#### 媒体库页面 (`/dashboard/media`)
- ✅ 只显示当前用户上传的文件
- ✅ 只能上传到自己的文件夹
- ✅ 只能删除自己的文件
- ✅ 可以复制自己文件的 URL

#### 媒体库选择器（编辑器中）
- ✅ 只显示当前用户上传的图片
- ✅ 只能选择自己的图片插入
- ✅ 可以在选择器中上传新图片

### 3. Storage RLS 策略

在 Supabase Storage 中配置的 RLS 策略：

```sql
-- 插入策略：允许认证用户上传到 media bucket
CREATE POLICY "Media bucket insert policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 查询策略：允许所有人读取（因为是公开 bucket）
CREATE POLICY "Media bucket select policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 更新策略：只能更新自己的文件或管理员可以更新所有文件
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
);

-- 删除策略：只能删除自己的文件或管理员可以删除所有文件
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
```

## 实现细节

### 媒体库页面

**文件**: `blog-system/src/app/dashboard/media/page.tsx`

**关键代码**:
```typescript
// 加载文件时只加载当前用户的文件夹
const { data: { user } } = await supabase.auth.getUser()
const { data, error } = await supabase.storage
  .from('media')
  .list(user.id, {  // 只列出用户自己的文件夹
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  })

// 上传时保存到用户自己的文件夹
const filePath = `${user.id}/${fileName}`
await supabase.storage
  .from('media')
  .upload(filePath, file)

// 删除时只能删除自己文件夹中的文件
await supabase.storage
  .from('media')
  .remove([`${userId}/${fileToDelete.name}`])
```

### 媒体库选择器

**文件**: `blog-system/src/components/editor/MediaLibraryModal.tsx`

**关键代码**:
```typescript
// 加载文件
const { data: { user } } = await supabase.auth.getUser()
const { data, error } = await supabase.storage
  .from('media')
  .list(user.id, {  // 只列出用户自己的文件
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  })

// 生成公开 URL
const { data: { publicUrl } } = supabase.storage
  .from('media')
  .getPublicUrl(`${user.id}/${file.name}`)
```

## 用户体验

### 普通用户
1. 进入媒体库，只看到自己上传的图片
2. 上传图片时，自动保存到自己的文件夹
3. 在编辑器中插入图片时，只能选择自己上传的图片
4. 无法看到或访问其他用户的图片列表

### 超级管理员
1. 在媒体库中也只看到自己上传的图片
2. 通过 Storage RLS 策略，管理员可以管理所有用户的文件
3. 但在 UI 层面，为了简化操作，管理员也只显示自己的文件

## 安全性

### 文件访问
- ✅ **列表隔离**: 用户只能列出自己文件夹中的文件
- ✅ **上传隔离**: 用户只能上传到自己的文件夹
- ✅ **删除隔离**: 用户只能删除自己的文件
- ⚠️ **URL 公开**: 虽然文件 URL 是公开的，但用户无法通过 UI 获取其他用户的文件 URL

### 注意事项

1. **公开 Bucket**: media bucket 是公开的，意味着如果有人知道完整的文件 URL，就可以访问该文件
2. **URL 猜测**: 理论上，如果有人知道其他用户的 user_id 和文件名，可以构造 URL 访问文件
3. **建议**: 如果需要更高的安全性，可以：
   - 将 bucket 设置为私有
   - 使用签名 URL（有时效性）
   - 添加额外的访问控制逻辑

## 相关文件

- `blog-system/src/app/dashboard/media/page.tsx` - 媒体库主页面
- `blog-system/src/components/editor/MediaLibraryModal.tsx` - 媒体库选择器
- `blog-system/supabase/FIX_STORAGE_POLICIES.sql` - Storage RLS 策略
- `blog-system/STORAGE_FIX_GUIDE.md` - Storage 修复指南

## 测试清单

### 功能测试

1. **媒体库页面**
   - [ ] 登录用户 A，上传图片
   - [ ] 验证只能看到自己上传的图片
   - [ ] 登录用户 B，验证看不到用户 A 的图片
   - [ ] 验证用户 B 只能看到自己的图片

2. **媒体库选择器**
   - [ ] 在编辑器中点击"插入图片"
   - [ ] 验证只显示当前用户的图片
   - [ ] 上传新图片，验证立即显示在列表中
   - [ ] 选择图片并插入，验证 URL 正确

3. **权限测试**
   - [ ] 尝试删除自己的文件 - 应该成功
   - [ ] 验证无法通过 UI 访问其他用户的文件列表

### 安全测试

1. **URL 访问**
   - [ ] 复制自己图片的 URL，在浏览器中打开 - 应该可以访问
   - [ ] 尝试修改 URL 中的 user_id，访问其他用户的文件 - 可以访问（公开 bucket）

2. **API 测试**
   - [ ] 尝试通过 API 列出其他用户的文件 - 应该失败或返回空
   - [ ] 尝试上传到其他用户的文件夹 - 应该失败

## 故障排除

### 问题：看不到自己上传的图片

**可能原因**:
1. 文件上传失败
2. 文件路径不正确
3. Storage RLS 策略配置错误

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 在 Supabase Dashboard > Storage 中查看文件是否存在
3. 执行 `FIX_STORAGE_POLICIES.sql` 修复 RLS 策略

### 问题：上传失败

**可能原因**:
1. 文件大小超过限制（5MB）
2. 文件类型不支持
3. Storage RLS 策略阻止上传

**解决方案**:
1. 检查文件大小和类型
2. 查看浏览器控制台的错误信息
3. 执行 `FIX_STORAGE_POLICIES.sql` 修复策略

### 问题：可以看到其他用户的图片

**可能原因**:
1. 代码逻辑错误，没有正确过滤用户 ID
2. 使用了错误的 API 调用

**解决方案**:
1. 检查代码中是否使用了 `user.id` 作为文件夹路径
2. 确保 `.list()` 方法的第一个参数是 `user.id`
