# 媒体库存储策略修复指南

## 问题描述

用户在上传图片到媒体库时遇到错误：
```
{"statusCode": "403","error": "Unauthorized","message": "new row violates row-level security policy"}
```

## 根本原因

Supabase Storage 的 RLS（Row Level Security）策略配置不正确，导致认证用户无法上传文件到 `media` bucket。

## 解决方案

### 1. 在 Supabase Dashboard 中执行 SQL

打开 Supabase Dashboard > SQL Editor，执行以下文件：

```bash
blog-system/supabase/FIX_STORAGE_POLICIES.sql
```

### 2. 策略说明

修复后的策略包括：

1. **插入策略（Insert）**：允许所有认证用户上传文件到 media bucket
2. **查询策略（Select）**：允许所有人（包括匿名用户）读取 media bucket 中的文件
3. **更新策略（Update）**：允许用户更新自己的文件，管理员可以更新所有文件
4. **删除策略（Delete）**：允许用户删除自己的文件，管理员可以删除所有文件

### 3. Bucket 配置

- **名称**：media
- **公开访问**：是（public = true）
- **文件大小限制**：50MB
- **允许的 MIME 类型**：
  - image/jpeg
  - image/png
  - image/gif
  - image/webp
  - image/svg+xml

## 验证修复

执行 SQL 后，你应该看到：

```
✓ 存储策略已修复！所有认证用户现在都可以上传图片到媒体库。
```

## 测试上传

1. 登录博客系统后台
2. 进入"媒体库"页面
3. 点击"上传图片"按钮
4. 选择一张图片上传
5. 应该能成功上传并看到图片

## 相关文件

- `blog-system/supabase/FIX_STORAGE_POLICIES.sql` - 修复 SQL 脚本
- `blog-system/supabase/migration-storage-policies.sql` - 原始策略文件
- `blog-system/src/app/dashboard/media/page.tsx` - 媒体库页面
- `blog-system/src/components/editor/MediaLibraryModal.tsx` - 媒体库选择器组件

## 注意事项

1. 文件上传路径格式：`{user_id}/{timestamp}.{extension}`
2. 所有上传的文件都存储在用户自己的文件夹中
3. 管理员可以管理所有用户的文件
4. 普通用户只能管理自己上传的文件

## 故障排除

如果上传仍然失败：

1. 检查用户是否已登录（`auth.uid()` 不为空）
2. 检查 bucket 是否存在且为公开
3. 检查文件大小是否超过限制（50MB）
4. 检查文件类型是否在允许列表中
5. 在 Supabase Dashboard > Storage > Policies 中查看策略是否正确创建

## 相关错误代码

- `403 Unauthorized` - RLS 策略阻止了操作
- `404 Not Found` - Bucket 不存在
- `413 Payload Too Large` - 文件太大
- `415 Unsupported Media Type` - 文件类型不支持
