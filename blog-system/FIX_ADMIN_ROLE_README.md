# 修复王侦原显示"作者"的问题

## 问题
王侦原在用户管理页面显示为"作者"，应该显示为"超级管理员"。

## 原因
数据库中 `profiles` 表的 `role` 字段可能不是 `'admin'`。

## 解决方案

### 方法 1：使用诊断脚本（推荐）

在 Supabase SQL Editor 中运行：

```sql
-- 文件：blog-system/supabase/DIAGNOSE_AND_FIX.sql
```

这个脚本会：
1. 显示当前状态
2. 强制更新 role 为 'admin'
3. 验证更新结果
4. 检查其他可能的问题
5. 显示下一步操作

### 方法 2：直接更新

如果你只想快速修复，运行：

```sql
-- 文件：blog-system/supabase/FORCE_UPDATE_ADMIN.sql
```

### 方法 3：手动 SQL

直接在 SQL Editor 中运行：

```sql
-- 更新王侦原的 role
UPDATE profiles
SET role = 'admin'
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';

-- 验证
SELECT name, role, family_id
FROM profiles
WHERE id = '79bba44c-f61d-4197-9e6b-4781a19d962b';
```

## 更新后的操作

1. **刷新浏览器**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **清除缓存**（如果刷新后还是显示"作者"）
   - Chrome: 设置 → 隐私和安全 → 清除浏览数据
   - 选择"缓存的图片和文件"
   - 时间范围选"全部时间"

3. **重新登录**
   - 退出登录
   - 重新登录

4. **验证**
   - 进入用户管理页面
   - 查看王侦原的角色
   - 应该显示"超级管理员"（渐变紫粉色徽章）

## 预期结果

### 用户管理页面
- **王侦原**：显示"超级管理员"（渐变紫粉色徽章）
- **其他孩子**：显示"孩子"（橙色徽章）

### 文章管理
- 王侦原能看到所有文章
- 能看到"审核"按钮
- 能审核文章

## 如果还是显示"作者"

### 检查 1：确认数据库更新成功

```sql
SELECT id, name, role, family_id
FROM profiles
WHERE name = '王侦原';
```

应该返回：
- role: `admin`
- family_id: `79ed05a1-e0e5-4d8c-9a79-d8756c488171`

### 检查 2：确认没有缓存问题

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 勾选"Disable cache"
4. 刷新页面

### 检查 3：确认 Session 正确

1. 退出登录
2. 清除所有 Cookie
3. 重新登录
4. 检查角色显示

### 检查 4：查看控制台错误

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 查看是否有错误信息
4. 截图发送给开发者

## 技术细节

### 超级管理员判断逻辑

```typescript
// 前端代码
const isSuperAdmin = 
  profile?.role === 'admin' && 
  profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
```

```sql
-- SQL 策略
profiles.role = 'admin' AND 
profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
```

### 角色显示逻辑

在 `blog-system/src/app/dashboard/users/page.tsx` 中：

```typescript
const getRoleBadge = (role: string, type: 'blog' | 'family' = 'blog', isSuperAdmin = false) => {
  if (type === 'family') {
    const labels = {
      admin: isSuperAdmin ? '超级管理员' : '家长',
      child: '孩子',
    }
    // ...
  }
  // ...
}
```

## 相关文件

- `DIAGNOSE_AND_FIX.sql` - 诊断和修复脚本
- `FORCE_UPDATE_ADMIN.sql` - 强制更新脚本
- `check-wangliaoyuan-role.sql` - 检查角色脚本
- `src/app/dashboard/users/page.tsx` - 用户管理页面
- `src/components/layout/Header.tsx` - 头部组件

## 联系支持

如果以上方法都无法解决问题，请提供：
1. 数据库查询结果截图
2. 浏览器控制台错误截图
3. 用户管理页面截图
