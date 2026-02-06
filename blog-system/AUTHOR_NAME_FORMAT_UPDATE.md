# 作者名称显示格式更新

## 更新内容

将所有显示作者名字的地方统一改为"XX的家庭"格式（在 profile.name 后面加上"的家庭"）。

## 修改的文件

### 1. 工具函数
- `blog-system/src/lib/utils.ts`
  - 添加了 `formatAuthorName()` 函数
  - 直接在 profile.name 后面加上"的家庭"
  - 例如："王僚原" → "王僚原的家庭"

### 2. 前台页面

所有前台页面的查询都简化为只查询 `profiles!posts_author_id_fkey(name, avatar_url)`，不再需要查询 families 表。

#### 首页 (`blog-system/src/app/(frontend)/page.tsx`)
- 导入 `formatAuthorName` 函数
- 简化查询，只查询 `name` 和 `avatar_url`
- 使用 `formatAuthorName()` 显示作者名字

#### 博客列表页 (`blog-system/src/app/(frontend)/blog/page.tsx`)
- 导入 `formatAuthorName` 函数
- 简化查询
- 使用 `formatAuthorName()` 显示作者名字

#### 文章详情页 (`blog-system/src/app/(frontend)/blog/[slug]/page.tsx`)
- 导入 `formatAuthorName` 函数
- 简化所有查询
- 在文章头部和作者简介部分使用 `formatAuthorName()` 显示作者名字

#### 分类页 (`blog-system/src/app/(frontend)/categories/[slug]/page.tsx`)
- 导入 `formatAuthorName` 函数
- 简化查询
- 使用 `formatAuthorName()` 显示作者名字

#### 标签页 (`blog-system/src/app/(frontend)/tags/[slug]/page.tsx`)
- 导入 `formatAuthorName` 函数
- 简化查询
- 使用 `formatAuthorName()` 显示作者名字

### 3. 后台页面

#### 文章管理页 (`blog-system/src/app/dashboard/posts/page.tsx`)
- 导入 `formatAuthorName` 函数
- 简化查询，只查询 `name`
- 在文章列表中使用 `formatAuthorName()` 显示作者名字

### 4. 组件

#### 评论组件 (`blog-system/src/components/Comments.tsx`)
- 添加本地 `formatAuthorName()` 函数（因为是客户端组件）
- 简化 `loadComments()` 查询
- 更新 Comment 接口，移除 families 相关类型
- 使用 `formatAuthorName()` 显示评论者名字

## 查询模式

所有查询 profiles 的地方都使用简化的模式：

```typescript
profiles!posts_author_id_fkey(name, avatar_url)
```

或者只查询 name：

```typescript
profiles!posts_author_id_fkey(name)
```

## 显示逻辑

```typescript
// 工具函数
export function formatAuthorName(profile: any): string {
  if (!profile) return '匿名用户'
  
  // 直接在 profile.name 后面加上"的家庭"
  if (profile.name) {
    return `${profile.name}的家庭`
  }
  
  return '匿名用户'
}
```

## 效果

- Header 显示：王僚原（家长名字）
- 前台所有文章列表：显示"王僚原的家庭"
- 文章详情页：显示"王僚原的家庭"
- 后台文章管理：显示"王僚原的家庭"
- 评论列表：显示"王僚原的家庭"

## 构建状态

✅ 构建成功
✅ 所有 28 个页面成功生成
✅ TypeScript 类型检查通过
✅ ESLint 检查通过
✅ 查询简化，不再需要查询 families 表
