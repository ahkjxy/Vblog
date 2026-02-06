# 最终修复指南

## 问题总结

1. **文章不显示**：RLS 策略问题
2. **超级管理员判断错误**：混淆了家庭角色和博客角色
3. **字段不存在**：review_status 字段未添加

## 角色说明

### 家庭系统角色（family_members 表）
- `role = 'admin'` → **家长**
- `role = 'child'` → **孩子**

### 博客系统角色（profiles 表）
- `role = 'admin'` → 可以是家长，也可以是博客管理员
- `role = 'editor'` → 编辑
- `role = 'author'` → 作者

### 超级管理员定义
**超级管理员** = 超级管理家庭的家长
- `family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'`
- `role = 'admin'` （在 profiles 表中，表示家长）

## 执行步骤

### 步骤 1: 检查当前状态

在 Supabase SQL Editor 中运行：

```sql
-- 查看超级管理员家庭成员
SELECT id, name, role, family_id
FROM profiles
WHERE family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 查看当前用户
SELECT auth.uid(), p.name, p.role, p.family_id
FROM profiles p
WHERE p.id = auth.uid();
```

### 步骤 2: 运行一键修复脚本

```sql
-- 运行这个脚本
blog-system/supabase/ONE_CLICK_FIX.sql
```

这个脚本会：
1. ✅ 添加 review_status 等字段
2. ✅ 将所有已发布文章设为"已通过"
3. ✅ 删除旧的 RLS 策略
4. ✅ 创建新的简化 RLS 策略
5. ✅ 启用 RLS

### 步骤 3: 验证

1. **检查字段**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND column_name IN ('review_status', 'reviewed_by', 'reviewed_at');
```

2. **检查文章**
```sql
SELECT id, title, status, review_status
FROM posts
ORDER BY created_at DESC
LIMIT 5;
```

3. **检查策略**
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'posts';
```

### 步骤 4: 刷新浏览器

- 刷新博客后台
- 刷新博客前台
- 刷新家庭积分系统

## 当前 RLS 策略

### SELECT（查看）
1. **公开访问**：所有人可以查看已发布的文章
2. **自己的文章**：认证用户可以查看自己的文章
3. **超级管理员**：可以查看所有文章

### INSERT（创建）
- 认证用户可以创建文章

### UPDATE（更新）
1. **自己的文章**：用户可以更新自己的文章
2. **超级管理员**：可以更新所有文章

### DELETE（删除）
1. **自己的文章**：用户可以删除自己的文章
2. **超级管理员**：可以删除所有文章

## 超级管理员权限

超级管理员（超管家庭的家长）可以：
- ✅ 查看所有文章
- ✅ 编辑所有文章
- ✅ 删除所有文章
- ✅ 审核文章（通过/拒绝）
- ✅ 管理所有用户

## 普通家庭用户权限

普通家庭用户可以：
- ✅ 创建文章
- ✅ 编辑自己的文章
- ✅ 删除自己的文章
- ✅ 查看自己的文章
- ❌ 不能查看其他家庭的文章
- ❌ 不能审核文章

## 前台展示规则

前台（博客页面）显示：
- ✅ 状态为 `published`（已发布）
- ✅ 审核状态为 `approved`（已通过）

的文章。

## 常见问题

### Q: 文章还是不显示？
**A**: 
1. 确认已运行 ONE_CLICK_FIX.sql
2. 检查文章的 status 和 review_status
3. 清除浏览器缓存
4. 检查浏览器控制台错误

### Q: 我是超管但看不到所有文章？
**A**: 
1. 确认你的 family_id 是 `79ed05a1-e0e5-4d8c-9a79-d8756c488171`
2. 确认你的 role 是 `admin`（家长）
3. 运行 check-super-admin.sql 检查

### Q: 审核功能在哪里？
**A**: 
1. 只有超级管理员能看到
2. 在文章列表页面，待审核的文章会显示"审核"按钮
3. 点击后进入审核页面

## 相关文件

### SQL 脚本
- `ONE_CLICK_FIX.sql` - 一键修复（推荐）
- `check-super-admin.sql` - 检查超管状态
- `debug-permissions.sql` - 调试权限问题
- `fix-rls-policies.sql` - 修复 RLS 策略

### 前端文件
- `src/app/dashboard/posts/page.tsx` - 文章列表（已支持可选审核列）
- `src/app/dashboard/posts/[id]/review/page.tsx` - 审核页面
- `src/app/(frontend)/blog/page.tsx` - 前台博客列表
- `family-points-bank/components/BlogPosts.tsx` - 家庭系统博客组件

## 测试清单

- [ ] 超级管理员能看到所有文章
- [ ] 超级管理员能看到"审核"按钮
- [ ] 普通用户只能看到自己的文章
- [ ] 前台只显示已审核通过的文章
- [ ] 家庭系统能显示博客文章
- [ ] 创建新文章后默认为"待审核"
- [ ] 审核通过后前台能看到文章
