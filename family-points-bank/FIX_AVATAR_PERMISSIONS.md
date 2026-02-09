# 修复头像显示问题

## 问题诊断

从控制台日志可以看到：
- ✅ avatarUrl 有正确的 Supabase Storage URL
- ✅ 组件判断应该显示图片 (showAvatar: true)
- ❌ 但图片加载失败 (imageError: true)

**根本原因：Supabase Storage 的 avatars bucket 没有配置公开读取权限**

## 解决方案

### 方法 1：通过 Supabase Dashboard 修复（推荐）

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单 **Storage**
4. 找到 `avatars` bucket
5. 点击 bucket 右侧的设置图标
6. 确保 **Public bucket** 选项已启用
7. 或者在 **Policies** 标签页添加以下策略：

```sql
-- 允许所有人读取头像
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 方法 2：通过 SQL 编辑器修复

在 Supabase Dashboard 的 SQL Editor 中运行：

```sql
-- 1. 将 avatars bucket 设置为公开
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 2. 添加公开读取策略
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 方法 3：运行迁移脚本

```bash
# 在 Supabase Dashboard 的 SQL Editor 中运行
# supabase/migrations/fix_avatar_storage_permissions.sql
```

## 验证修复

修复后，刷新页面，你应该能看到：
1. 控制台日志显示 `Image loaded SUCCESS`
2. 成员矩阵中显示真实头像而不是文字

## 临时解决方案（如果不想改权限）

如果你不想将 bucket 设为公开，可以使用 Supabase 的 signed URLs：

在 `App.tsx` 的 `fetchData` 函数中修改：

```typescript
// 为每个头像生成 signed URL
if (p.avatar_url) {
  const { data } = await supabase.storage
    .from('avatars')
    .createSignedUrl(p.avatar_url, 3600); // 1小时有效期
  p.avatarUrl = data?.signedUrl || p.avatar_url;
}
```

但这会增加复杂度，建议直接使用公开 bucket。
