# 博客系统权限管理

## 实现时间
2026-02-06

## 权限级别

### 1. 超级管理员 (Super Admin)
**判断条件**: `role='admin' AND family_id='79ed05a1-e0e5-4d8c-9a79-d8756c488171'`

**权限**:
- ✅ 查看所有用户的文章
- ✅ 查看所有文章的评论
- ✅ 审核所有文章和评论
- ✅ 访问所有后台菜单
- ✅ 管理用户、分类、标签、媒体库、设置

**可见菜单**:
- 概览
- 文章
- 媒体库
- 分类
- 标签
- 评论
- 用户
- 设置

### 2. 普通用户 (Author/Editor)
**判断条件**: 不是超级管理员的所有用户

**权限**:
- ✅ 只能查看自己的文章
- ✅ 只能查看自己文章的评论
- ❌ 不能审核文章和评论
- ❌ 不能访问管理功能

**可见菜单**:
- 概览（只显示自己的文章）
- 文章（只显示自己的文章）

## 实现的功能

### 1. 后台首页 (`/dashboard`)
**文件**: `blog-system/src/app/dashboard/page.tsx`

```typescript
// 检查是否是超级管理员
const isSuperAdmin = profile?.role === 'admin' && 
  profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

// 构建查询，非超级管理员只能看到自己的文章
let recentPostsQuery = supabase
  .from('posts')
  .select('...')
  .order('updated_at', { ascending: false })
  .limit(5)

// 如果不是超级管理员，只显示自己的文章
if (!isSuperAdmin) {
  recentPostsQuery = recentPostsQuery.eq('author_id', user?.id)
}
```

**效果**:
- 超级管理员：显示所有文章 + 待审核文章 + 待审核评论
- 普通用户：只显示自己的文章

### 2. 文章列表页 (`/dashboard/posts`)
**文件**: `blog-system/src/app/dashboard/posts/page.tsx`

```typescript
// 构建查询，非超级管理员只能看到自己的文章
let postsQuery = supabase
  .from('posts')
  .select('...')
  .order('created_at', { ascending: false })

// 如果不是超级管理员，只显示自己的文章
if (!isSuperAdmin) {
  postsQuery = postsQuery.eq('author_id', user?.id)
}
```

**效果**:
- 超级管理员：显示所有用户的文章
- 普通用户：只显示自己的文章

### 3. 评论管理页 (`/dashboard/comments`)
**文件**: `blog-system/src/app/dashboard/comments/page.tsx`

```typescript
// 构建查询
let query = supabase
  .from('comments')
  .select(`
    *,
    profiles(name, avatar_url, role),
    posts!inner(title, slug, author_id)
  `)
  .order('created_at', { ascending: false })

// 如果不是超级管理员，只显示自己文章的评论
if (!isSuperAdmin && currentUserId) {
  query = query.eq('posts.author_id', currentUserId)
}
```

**效果**:
- 超级管理员：显示所有文章的评论
- 普通用户：只显示自己文章的评论

### 4. 侧边栏导航 (`/dashboard/layout`)
**文件**: `blog-system/src/app/dashboard/layout.tsx`

```typescript
// 根据用户权限动态生成导航菜单
const navItems = [
  { href: '/dashboard', icon: 'LayoutDashboard', label: '概览' },
  { href: '/dashboard/posts', icon: 'FileText', label: '文章' },
]

// 只有超级管理员才能看到其他菜单
if (isSuperAdmin) {
  navItems.push(
    { href: '/dashboard/media', icon: 'Image', label: '媒体库' },
    { href: '/dashboard/categories', icon: 'FolderOpen', label: '分类' },
    { href: '/dashboard/tags', icon: 'Tag', label: '标签' },
    { href: '/dashboard/comments', icon: 'MessageSquare', label: '评论' },
    { href: '/dashboard/users', icon: 'Users', label: '用户' },
    { href: '/dashboard/settings', icon: 'Settings', label: '设置' }
  )
}
```

**效果**:
- 超级管理员：显示所有菜单项（8个）
- 普通用户：只显示"概览"和"文章"（2个）

### 5. 用户管理页 (`/dashboard/users`)
**文件**: `blog-system/src/app/dashboard/users/page.tsx`

```typescript
// 检查是否是超级管理员
const isAdmin = currentProfile.role === 'admin' && 
  currentProfile.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
setIsSuperAdmin(isAdmin)

// 如果不是超级管理员，拒绝访问
if (!isAdmin) {
  setAccessDenied(true)
  setLoading(false)
  return
}

// 在 UI 中显示权限不足
if (currentUserRole !== 'admin') {
  return (
    <EmptyState
      icon={Shield}
      title="权限不足"
      description="只有管理员可以访问用户管理页面"
    />
  )
}
```

**效果**:
- 超级管理员：可以访问，显示所有用户
- 普通用户：显示"权限不足"提示

## 权限检查流程

### 服务端检查（Server Component）
```typescript
// 1. 获取当前用户
const { data: { user } } = await supabase.auth.getUser()

// 2. 获取用户 profile
const { data: profile } = await supabase
  .from('profiles')
  .select('role, family_id')
  .eq('id', user?.id)
  .maybeSingle()

// 3. 判断是否是超级管理员
const isSuperAdmin = profile?.role === 'admin' && 
  profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

// 4. 根据权限过滤数据
if (!isSuperAdmin) {
  query = query.eq('author_id', user?.id)
}
```

### 客户端检查（Client Component）
```typescript
// 1. 在 useEffect 中检查用户权限
useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', user.id)
        .maybeSingle()
      
      const isAdmin = profile?.role === 'admin' && 
        profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
      setIsSuperAdmin(isAdmin)
    }
  }
  checkUser()
}, [])

// 2. 在数据加载时应用权限过滤
useEffect(() => {
  if (currentUserId !== null) {
    loadData()
  }
}, [currentUserId, isSuperAdmin])
```

## 安全考虑

### 1. 前端权限控制
- ✅ 隐藏不应该看到的菜单项
- ✅ 在页面级别检查权限
- ✅ 显示友好的权限不足提示

### 2. 后端权限控制（重要！）
- ⚠️ 前端权限控制只是 UI 层面的
- ⚠️ 必须在 Supabase RLS 策略中也实现权限控制
- ⚠️ 否则用户可以通过 API 直接访问数据

### 3. RLS 策略建议
```sql
-- posts 表的 RLS 策略
-- 超级管理员可以查看所有文章，普通用户只能查看自己的文章
CREATE POLICY "Users can view own posts or super admin can view all"
ON posts FOR SELECT
USING (
  auth.uid() = author_id 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- comments 表的 RLS 策略
-- 超级管理员可以查看所有评论，普通用户只能查看自己文章的评论
CREATE POLICY "Users can view comments on own posts or super admin can view all"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = comments.post_id 
    AND posts.author_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);
```

## 测试场景

### 测试用例 1: 超级管理员登录
1. 使用超级管理员账号登录（ahkjxy@qq.com）
2. 应该看到所有 8 个菜单项
3. 后台首页应该显示所有用户的文章
4. 应该看到"待审核文章"和"待审核评论"板块
5. 文章列表应该显示所有用户的文章
6. 评论管理应该显示所有文章的评论

### 测试用例 2: 普通用户登录
1. 使用普通用户账号登录
2. 应该只看到 2 个菜单项："概览"和"文章"
3. 后台首页应该只显示自己的文章
4. 不应该看到"待审核文章"和"待审核评论"板块
5. 文章列表应该只显示自己的文章
6. 评论管理应该只显示自己文章的评论
7. 尝试访问 `/dashboard/users` 应该显示"权限不足"

### 测试用例 3: 直接 URL 访问
1. 普通用户登录后
2. 在浏览器地址栏输入 `/dashboard/users`
3. 应该显示"权限不足"提示
4. 不应该能看到任何用户数据

## 修改的文件

1. `blog-system/src/app/dashboard/page.tsx` - 后台首页权限过滤
2. `blog-system/src/app/dashboard/posts/page.tsx` - 文章列表权限过滤
3. `blog-system/src/app/dashboard/comments/page.tsx` - 评论管理权限过滤
4. `blog-system/src/app/dashboard/layout.tsx` - 侧边栏菜单权限控制
5. `blog-system/src/app/dashboard/users/page.tsx` - 用户管理页面权限检查

## 下一步建议

1. **实现 RLS 策略**: 在 Supabase 中添加 RLS 策略，确保后端也有权限控制
2. **测试所有页面**: 确保所有页面都正确实现了权限控制
3. **添加审计日志**: 记录管理员的操作，便于追踪
4. **角色管理**: 考虑添加更细粒度的角色和权限管理
5. **权限提示**: 在尝试访问无权限页面时，提供更友好的提示和引导
