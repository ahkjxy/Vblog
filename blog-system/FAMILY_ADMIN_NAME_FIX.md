# 家长名字显示修复

## 问题描述

用户在 Blog 后台的侧边栏中看不到家长的名字，"进入 XX 的家庭" 按钮显示不正确。

## 根本原因

1. **Profile 不存在问题**: 用户在 family-points-bank 中有数据，但在 blog 系统中没有对应的 profile 记录
2. **强制重定向**: 之前的代码在找不到 profile 时会重定向到登录页，导致用户无法访问后台
3. **字段不匹配**: Blog 系统和 family-points-bank 使用相同的 Supabase 数据库，但 profile 可能只在一个系统中存在

## 解决方案

### 1. 移除强制 Profile 检查

**之前的代码**:
```typescript
if (!profile) {
  redirect('/auth/login')
}
```

**修复后的代码**:
```typescript
// 如果没有 profile，使用默认值（不重定向，因为用户可能只在 family-points-bank 有数据）
const userName = profile?.name || user.email?.split('@')[0] || '用户'
const userRole = profile?.role || 'author'
const userAvatar = profile?.avatar_url
```

### 2. 优雅降级处理

- 如果 profile 存在，使用 profile 中的数据
- 如果 profile 不存在，从 auth user 的 email 中提取用户名
- 默认角色设置为 'author'

### 3. 家长名字查询逻辑

```typescript
// 获取家长的名字（用于显示"进入 XX 的家庭"）
let familyAdminName = userName
if (profile?.family_id) {
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('name')
    .eq('family_id', profile.family_id)
    .eq('role', 'admin')
    .limit(1)
  
  if (adminProfiles && adminProfiles.length > 0 && adminProfiles[0].name) {
    familyAdminName = adminProfiles[0].name
  }
}
```

## 修改的文件

- `blog-system/src/app/dashboard/layout.tsx`

## 测试场景

1. ✅ 用户在两个系统都有 profile - 显示家长名字
2. ✅ 用户只在 family-points-bank 有 profile - 显示当前用户名
3. ✅ 用户没有 profile - 使用 email 作为默认名字
4. ✅ 用户没有 family_id - 显示当前用户名

## 注意事项

- Blog 系统和 family-points-bank 共享同一个 Supabase 数据库
- Profile 表的 role 字段在 family-points-bank 中只允许 'admin' 或 'child'
- Blog 系统使用 'admin', 'editor', 'author' 角色
- 两个系统的 profile 可能不同步，需要优雅处理

## 相关链接

- Family Points Bank URL: https://www.familybank.chat/
- Blog 系统使用 `name` 字段（不是 `username`）
