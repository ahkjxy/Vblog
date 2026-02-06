# 审核系统快速设置指南

## 问题说明

1. **已发布的文章显示"待审核"**：因为数据库还没有添加审核字段
2. **家庭系统报错**：`column posts.review_status does not exist` - 字段不存在

## 解决方案

### 方法一：快速设置（推荐）

在 Supabase SQL Editor 中运行：

```sql
-- 运行这个脚本
blog-system/supabase/quick-setup-review.sql
```

这个脚本会：
- ✅ 添加审核相关字段
- ✅ 将所有已发布的文章自动设为"已通过"
- ✅ 显示统计信息

### 方法二：完整迁移

如果需要完整的 RLS 策略和审核函数，运行：

```sql
-- 运行完整迁移脚本
blog-system/supabase/migration-add-review-system.sql
```

## 执行步骤

1. **打开 Supabase Dashboard**
   - 进入你的项目
   - 点击左侧 "SQL Editor"

2. **运行快速设置脚本**
   - 新建查询
   - 复制 `quick-setup-review.sql` 的内容
   - 点击 "Run" 执行

3. **验证结果**
   - 查看输出的统计信息
   - 确认已发布的文章都是"已通过"状态

4. **刷新应用**
   - 刷新博客后台页面
   - 刷新家庭系统页面
   - 确认不再报错

## 预期结果

执行后你会看到：

```
✓ 已添加 review_status 字段
✓ 已添加 reviewed_by 字段
✓ 已添加 reviewed_at 字段
✓ 已添加索引

========================================
审核状态统计：
  已通过: X 篇
  待审核: Y 篇
  总文章: Z 篇
========================================
```

## 验证

### 1. 检查字段是否添加成功

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND column_name IN ('review_status', 'reviewed_by', 'reviewed_at');
```

应该返回 3 行。

### 2. 检查文章审核状态

```sql
SELECT 
  title,
  status,
  review_status,
  published_at
FROM posts
ORDER BY created_at DESC;
```

已发布的文章应该显示 `review_status = 'approved'`。

### 3. 测试前台显示

访问博客前台，应该能看到已发布的文章。

### 4. 测试家庭系统

访问家庭积分系统，Dashboard 应该显示博客文章，不再报错。

## 常见问题

### Q: 执行脚本后还是报错？
**A**: 
1. 确认脚本执行成功，没有错误
2. 清除浏览器缓存
3. 重启开发服务器（如果是本地开发）

### Q: 已发布的文章还是"待审核"？
**A**: 
1. 检查脚本是否执行了 UPDATE 语句
2. 手动运行：
```sql
UPDATE posts 
SET review_status = 'approved', reviewed_at = NOW()
WHERE status = 'published';
```

### Q: 家庭系统还是报错？
**A**: 
1. 确认字段已添加
2. 检查 Supabase 连接是否正确
3. 查看浏览器控制台的详细错误信息

## 审核状态说明

| 状态 | 值 | 说明 |
|------|------|------|
| 待审核 | pending | 新创建的文章默认状态 |
| 已通过 | approved | 超管审核通过，前台可见 |
| 已拒绝 | rejected | 超管拒绝，前台不可见 |

## 后续使用

### 家庭用户发布文章
1. 创建文章
2. 点击"发布"
3. 状态变为"已发布 + 待审核"
4. 等待超管审核

### 超级管理员审核
1. 进入"文章管理"
2. 看到"待审核"标签的文章
3. 点击"审核"按钮
4. 选择"通过"或"拒绝"

### 前台展示
- 只显示"已发布 + 已通过"的文章
- 家庭系统也只显示已通过的文章

## 相关文件

- `blog-system/supabase/quick-setup-review.sql` - 快速设置脚本
- `blog-system/supabase/migration-add-review-system.sql` - 完整迁移脚本
- `blog-system/REVIEW_SYSTEM.md` - 详细文档
- `family-points-bank/components/BlogPosts.tsx` - 家庭系统博客组件
