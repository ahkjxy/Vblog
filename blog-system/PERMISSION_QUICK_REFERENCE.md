# 权限系统快速参考

## 权限级别对比

| 功能 | 超级管理员 | 普通用户 |
|------|-----------|---------|
| 查看所有文章 | ✅ | ❌ 只能看自己的 |
| 查看所有评论 | ✅ | ❌ 只能看自己文章的 |
| 审核文章/评论 | ✅ | ❌ |
| 管理用户 | ✅ | ❌ |
| 管理分类/标签 | ✅ | ❌ |
| 管理媒体库 | ✅ | ❌ |
| 系统设置 | ✅ | ❌ |

## 菜单可见性

### 超级管理员看到的菜单（8个）
1. 📊 概览
2. 📝 文章
3. 🖼️ 媒体库
4. 📁 分类
5. 🏷️ 标签
6. 💬 评论
7. 👥 用户
8. ⚙️ 设置

### 普通用户看到的菜单（2个）
1. 📊 概览（只显示自己的文章）
2. 📝 文章（只显示自己的文章）

## 超级管理员判断条件

```typescript
const isSuperAdmin = 
  profile?.role === 'admin' && 
  profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
```

## 数据过滤示例

### 后台首页
```typescript
// 超级管理员：显示所有文章
// 普通用户：只显示自己的文章
if (!isSuperAdmin) {
  query = query.eq('author_id', user?.id)
}
```

### 文章列表
```typescript
// 超级管理员：显示所有用户的文章
// 普通用户：只显示自己的文章
if (!isSuperAdmin) {
  postsQuery = postsQuery.eq('author_id', user?.id)
}
```

### 评论管理
```typescript
// 超级管理员：显示所有文章的评论
// 普通用户：只显示自己文章的评论
if (!isSuperAdmin && currentUserId) {
  query = query.eq('posts.author_id', currentUserId)
}
```

## 测试账号

- **超级管理员**: ahkjxy@qq.com
- **普通用户**: 任何其他注册用户

## 快速测试

1. 登录超级管理员账号 → 应该看到 8 个菜单
2. 登录普通用户账号 → 应该只看到 2 个菜单
3. 普通用户访问 `/dashboard/users` → 应该显示"权限不足"
