# 快速修复：非管理员发文错误

## 问题
用户发文时出现错误：
- `posts_author_id_fkey` 外键约束失败
- 用户没有 profile 记录

## 一键修复

在 Supabase SQL Editor 中执行：

```sql
\i blog-system/supabase/FIX_ALL_USER_ISSUES.sql
```

## 这个脚本做了什么？

1. ✅ 修复 `profiles.role` 约束，允许 4 种角色：
   - `admin` - 管理员
   - `child` - 孩子（家庭积分银行）
   - `author` - 作者（博客系统，默认）
   - `editor` - 编辑（博客系统）

2. ✅ 为所有没有 profile 的用户创建记录
   - 自动设置 `role='author'`
   - 生成随机头像
   - 加入默认家庭

3. ✅ 更新自动注册触发器
   - 新用户注册时自动创建 profile
   - 使用正确的字段名和数据结构

## 执行后

用户可以：
- ✅ 注册新账号（自动创建 profile）
- ✅ 发布文章（非管理员文章需要审核）
- ✅ 发表评论
- ✅ 查看自己的文章列表

## 验证

执行脚本后会显示：
- Role 约束定义
- 触发器状态
- 用户统计（总用户数、有 profile 的用户数）
- 最近 5 个用户的状态

## 详细文档

查看 `FIX_NEW_USER_POST_ERROR.md` 了解更多技术细节。
