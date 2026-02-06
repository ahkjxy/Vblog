# 用户管理页面增强

## 完成的功能

### 1. 显示用户所在家庭
- ✅ 在用户表格中添加了"家庭"列
- ✅ 显示用户所属的家庭名称
- ✅ 标记超级管理员家庭（显示"超管家庭"徽章）

### 2. 保护超级管理员家庭用户
- ✅ 超级管理员家庭的用户不能被删除
- ✅ 删除按钮对超管家庭用户显示为禁用状态
- ✅ 尝试删除时会显示错误提示

### 3. 分层显示家庭和角色
- ✅ 角色列现在分层显示：
  1. **家庭名称**（灰色小字）
  2. **家庭角色**（如果有）：
     - 家长（紫色徽章）
     - 孩子（橙色徽章）
  3. **博客角色**（如果有）：
     - 管理员（红色徽章）
     - 编辑（蓝色徽章）
     - 作者（绿色徽章）

### 4. 角色管理优化
- ✅ 角色更改对话框只允许修改博客角色
- ✅ 添加了提示信息，说明家庭角色由家庭积分系统管理
- ✅ 自动识别用户当前的博客角色

## 数据结构

### User 接口
```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'author' | 'child'  // 原始角色字段
  avatar_url: string | null
  avatar_color: string | null
  bio: string | null
  family_id: string | null
  created_at: string
  family?: {
    id: string
    name: string
  }
  family_role?: 'admin' | 'child'  // 家庭中的角色
  blog_role?: 'admin' | 'editor' | 'author'  // 博客系统的角色
  is_super_admin_family?: boolean  // 是否属于超管家庭
}
```

## 角色区分逻辑

```typescript
// 判断是否是博客系统的角色
const isBlogRole = ['admin', 'editor', 'author'].includes(user.role)

// 分配角色
family_role: !isBlogRole ? user.role as 'admin' | 'child' : undefined
blog_role: isBlogRole ? user.role as 'admin' | 'editor' | 'author' : undefined
```

## 视觉设计

### 家庭角色徽章
- **家长**: 紫色背景 (`bg-purple-100 text-purple-800`)
- **孩子**: 橙色背景 (`bg-orange-100 text-orange-800`)

### 博客角色徽章
- **管理员**: 红色背景 (`bg-red-100 text-red-800`)
- **编辑**: 蓝色背景 (`bg-blue-100 text-blue-800`)
- **作者**: 绿色背景 (`bg-green-100 text-green-800`)

### 超管家庭徽章
- 渐变背景：紫色到粉色 (`bg-gradient-to-r from-purple-100 to-pink-100`)
- 紫色文字 (`text-purple-700`)

## 使用说明

### 查看用户信息
1. 进入"用户管理"页面
2. 在表格中可以看到：
   - 用户头像和名称
   - 邮箱地址
   - 所属家庭（带超管标记）
   - 分层显示的角色信息
   - 注册时间

### 更改用户角色
1. 点击用户行的"盾牌"图标
2. 在对话框中选择新的博客角色
3. 点击"确认更改"

**注意**: 只能更改博客系统的角色，家庭角色需要在家庭积分系统中管理。

### 删除用户
1. 点击用户行的"垃圾桶"图标
2. 确认删除操作

**限制**: 超级管理员家庭的用户不能被删除，删除按钮会显示为禁用状态。

## 技术细节

### 数据查询
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select(`
    *,
    families:family_id (
      id,
      name
    )
  `)
  .order('created_at', { ascending: false })
```

### 超管家庭识别
```typescript
// 获取当前用户的家庭ID（超管的家庭ID）
const { data: currentProfile } = await supabase
  .from('profiles')
  .select('role, family_id')
  .eq('id', currentUser.id)
  .maybeSingle()

const superAdminFamilyId = currentProfile?.family_id

// 标记用户是否属于超管家庭
is_super_admin_family: user.family_id === superAdminFamilyId
```

## 相关文件
- `blog-system/src/app/dashboard/users/page.tsx` - 用户管理页面主文件
- `blog-system/src/types/database.types.ts` - 数据库类型定义
