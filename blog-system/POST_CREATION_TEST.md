# 文章发布功能测试指南

## 测试目的
验证修复服务端认证配置后，文章发布功能是否正常工作。

## 前置条件
✅ 已修复 `src/lib/supabase/server.ts`（使用 ANON_KEY 而不是 SERVICE_ROLE_KEY）
✅ 用户已登录系统

## 测试步骤

### 1. 登录测试
1. 访问 `/auth/login`
2. 使用有效账号登录
3. 验证是否成功跳转到 Dashboard

### 2. 访问新建文章页面
1. 点击侧边栏"文章"菜单
2. 点击"新建文章"按钮
3. 验证页面是否正常加载

### 3. 填写文章信息
1. **标题**: 输入测试标题（如"测试文章"）
2. **Slug**: 自动生成或手动输入
3. **分类**: 选择至少一个分类
4. **标签**: 可选
5. **摘要**: 可以留空自动生成
6. **内容**: 输入 Markdown 格式的内容

### 4. 发布文章
1. 选择状态：
   - **草稿**: 保存但不发布
   - **发布**: 立即发布
2. 点击"发布文章"或"保存草稿"按钮
3. 观察是否出现错误

## 预期结果

### ✅ 成功场景
- 没有红色错误提示
- 自动跳转到文章列表页
- 新文章出现在列表中
- 文章作者显示为当前登录用户

### ❌ 失败场景（修复前）
- 显示红色错误框：`未登录`
- 文章无法保存
- 停留在新建页面

## 常见错误及解决方案

### 错误 1: "未登录"
**原因**: 服务端使用了 SERVICE_ROLE_KEY，无法读取用户认证状态

**解决方案**: 
```typescript
// src/lib/supabase/server.ts
return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ 使用 ANON_KEY
  { ... }
)
```

### 错误 2: "Slug already exists"
**原因**: URL 别名重复

**解决方案**: 
- 代码已自动处理，会添加数字后缀（如 `test-1`, `test-2`）
- 或手动修改 Slug

### 错误 3: 分类/标签加载失败
**原因**: 数据库中没有分类或标签

**解决方案**:
1. 访问 `/dashboard/categories` 创建分类
2. 访问 `/dashboard/tags` 创建标签

## 权限说明

### 普通用户
- 可以创建文章
- 文章状态为 `review_status: 'pending'`
- 需要超级管理员审核后才能显示

### 超级管理员
- 可以创建文章
- 文章自动审核通过 `review_status: 'approved'`
- 立即显示在前台

## 调试技巧

### 1. 检查浏览器控制台
打开开发者工具（F12），查看：
- Network 标签：查看 API 请求是否成功
- Console 标签：查看是否有 JavaScript 错误

### 2. 检查认证状态
访问 `/auth-test` 页面，查看：
- 当前登录状态
- 用户 ID 和邮箱
- Cookie 信息

### 3. 检查数据库
在 Supabase Dashboard 中：
1. 进入 Table Editor
2. 查看 `posts` 表
3. 验证新文章是否已插入
4. 检查 `author_id` 字段是否正确

## 测试清单

- [ ] 登录成功
- [ ] 访问新建文章页面
- [ ] 填写文章信息
- [ ] 保存草稿成功
- [ ] 发布文章成功
- [ ] 文章列表显示新文章
- [ ] 文章作者信息正确
- [ ] 前台可以查看已发布文章
- [ ] 跨域登录状态同步正常

## 成功标准

✅ 所有测试项通过
✅ 没有"未登录"错误
✅ 文章成功保存到数据库
✅ 作者信息正确关联

## 如果仍然出现问题

1. **清除浏览器缓存和 Cookie**
2. **重新登录**
3. **检查环境变量**:
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. **重启开发服务器**:
   ```bash
   npm run dev
   ```
5. **查看 AUTH_FIX_SUMMARY.md** 了解详细修复说明

## 联系支持

如果问题持续存在，请提供：
- 错误截图
- 浏览器控制台日志
- 用户 ID
- 操作步骤
