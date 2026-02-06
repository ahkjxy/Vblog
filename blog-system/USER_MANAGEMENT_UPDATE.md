# 用户管理页面更新

## 更新内容

### 1. 恢复家庭分组显示 ✅
- 按家庭分组显示用户
- 超级管理员家庭显示在最前面
- 每个家庭显示成员数量
- 家庭头部有渐变背景（超管家庭是紫粉色，其他是蓝色）

### 2. 添加邮箱显示 ✅
- 新增"邮箱"列
- 通过服务端 API 获取用户邮箱
- 如果邮箱获取失败，显示用户 ID 前缀

### 3. 简化显示 ✅
- 只显示 admin 角色的用户（家长）
- 不显示 child 角色（孩子）
- 移除了复杂的角色显示逻辑
- 统一显示"家长"或"超级管理员"

### 4. 优化搜索 ✅
- 支持搜索用户名
- 支持搜索邮箱
- 支持搜索家庭名称

### 5. 保留核心功能 ✅
- 批量选择和删除
- 单个用户操作（更改角色、删除）
- 权限控制（不能删除自己）
- 家庭分组的全选/取消全选

## 技术实现

### 服务端 API
创建了 `/api/users/emails` 路由来获取用户邮箱：
- 使用 `SUPABASE_SERVICE_ROLE_KEY` 访问 auth.admin API
- 验证当前用户是超级管理员权限
- 返回 user_id -> email 的映射

### 服务端 Supabase 客户端
创建了 `src/lib/supabase/server.ts`：
- 使用 `@supabase/ssr` 的 `createServerClient`
- 使用 service role key 获取管理员权限
- 处理 cookies 的读写

### 前端更新
- 从 API 获取邮箱映射
- 合并到用户数据中
- 按家庭分组显示
- 添加错误处理

## 文件变更

### 新增文件
- `blog-system/src/lib/supabase/server.ts` - 服务端 Supabase 客户端
- `blog-system/src/app/api/users/emails/route.ts` - 获取邮箱的 API 路由

### 修改文件
- `blog-system/src/app/dashboard/users/page.tsx` - 用户管理页面主要逻辑

## 使用说明

### 查看用户列表
1. 以超级管理员身份登录（ahkjxy@qq.com）
2. 访问 `/dashboard/users`
3. 可以看到按家庭分组的用户列表

### 搜索用户
- 在搜索框输入用户名、邮箱或家庭名称
- 实时过滤结果

### 批量操作
- 勾选多个用户
- 点击"批量删除"按钮
- 确认后删除选中的用户

### 单个操作
- 点击"盾牌"图标更改用户角色
- 点击"垃圾桶"图标删除用户
- 不能删除自己

## 注意事项

### 邮箱显示
- 邮箱通过服务端 API 获取
- 需要 `SUPABASE_SERVICE_ROLE_KEY` 环境变量
- 如果 API 调用失败，会显示用户 ID 前缀

### 权限要求
- 只有超级管理员可以访问用户管理页面
- 超级管理员的判断条件：
  - role = 'admin'
  - family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

### 显示规则
- 只显示 role='admin' 的用户（家长）
- 不显示 role='child' 的用户（孩子）
- 孩子成员在家庭积分系统中管理

## 环境变量

确保 `.env.local` 中配置了：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 故障排除

### 邮箱不显示
1. 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否配置
2. 检查浏览器控制台是否有 API 错误
3. 检查服务端日志（Vercel 或本地终端）

### 家庭不显示
1. 确认用户有 family_id
2. 确认 families 表中有对应记录
3. 运行 `VERIFY_FIX_COMPLETE.sql` 检查数据

### 权限错误
1. 确认当前用户是超级管理员
2. 检查 family_id 是否正确
3. 检查 role 是否为 'admin'

## 下一步

如果需要进一步优化：
1. 添加用户编辑功能（修改名字、简介等）
2. 添加用户详情页面
3. 添加用户活动日志
4. 添加导出用户列表功能
