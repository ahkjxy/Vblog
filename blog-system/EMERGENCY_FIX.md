# 紧急修复 - useAuth 导致的 500 错误

## 最新更新
2026-02-12 - 修复了所有 `useAuth()` 引用

## 问题
使用已删除的 `useAuth()` composable 导致多个页面出现 500 错误。

## 根本原因
之前删除了 `composables/useAuth.ts` 文件，但以下文件仍在使用它：
1. `layouts/default.vue`
2. `pages/dashboard/posts/[id]/review.vue`
3. `components/dashboard/MediaLibraryModal.vue`

## 修复的文件

### 1. layouts/default.vue
**问题：**
```typescript
const { user, profile, fetchProfile } = useAuth()  // ❌ useAuth 不存在
```

**修复：**
```typescript
// ✅ 移除所有 useAuth 相关代码，让各组件自己管理认证状态
```

### 2. pages/dashboard/posts/[id]/review.vue
**问题：**
```typescript
const { user, profile } = useAuth()  // ❌ useAuth 不存在
```

**修复：**
```typescript
const user = useSupabaseUser()  // ✅ 使用 Nuxt Supabase 模块提供的 composable

// 在 useAsyncData 内部获取 profile
const { data: profile } = await client
  .from('profiles')
  .select('role')
  .eq('id', user.value.id)
  .single()
```

### 3. components/dashboard/MediaLibraryModal.vue
**问题：**
```typescript
const { user } = useAuth()  // ❌ useAuth 不存在
```

**修复：**
```typescript
const user = useSupabaseUser()  // ✅ 使用 Nuxt Supabase 模块提供的 composable
```

## 正确的认证方式

### 获取当前用户
```typescript
// ✅ 正确
const user = useSupabaseUser()

// ❌ 错误
const { user } = useAuth()
```

### 获取用户 Profile
```typescript
// ✅ 正确 - 在需要时查询
const client = useSupabaseClient()
const { data: profile } = await client
  .from('profiles')
  .select('*')
  .eq('id', user.value?.id)
  .single()

// ❌ 错误
const { profile } = useAuth()
```

### 在 useAsyncData 中使用
```typescript
// ✅ 正确
const user = useSupabaseUser()
const { data } = await useAsyncData('key', async () => {
  const client = useSupabaseClient()
  // 查询数据
})

// ❌ 错误
const { user } = useAuth()
const { data } = await useAsyncData('key', async () => {
  // user 可能未初始化
})
```

## 验证清单

- [x] 删除 `composables/useAuth.ts`
- [x] 修复 `layouts/default.vue`
- [x] 修复 `pages/dashboard/posts/[id]/review.vue`
- [x] 修复 `components/dashboard/MediaLibraryModal.vue`
- [x] 搜索并确认没有其他 `useAuth` 引用
- [ ] 测试所有前台页面
- [ ] 测试 Dashboard 页面
- [ ] 测试文章审核功能
- [ ] 测试媒体库上传功能

## 相关文档

- `blog-system/BLOG_500_FIX.md` - Blog 列表页的 500 错误修复
- `blog-system/BLOG_FIX_COMPLETE.md` - Blog 筛选功能完整修复文档

## 总结

所有 `useAuth()` 引用已被替换为 Nuxt Supabase 模块提供的标准 composables：
- `useSupabaseUser()` - 获取当前用户
- `useSupabaseClient()` - 获取 Supabase 客户端
- 需要 profile 时直接查询数据库

这样更符合 Nuxt 3 和 Supabase 模块的最佳实践。
