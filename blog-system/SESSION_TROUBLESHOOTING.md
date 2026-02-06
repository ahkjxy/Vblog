# Session 共享故障排查指南

## 问题：博客系统不显示登录状态

### 可能原因

1. **本地开发环境**
   - 跨域 cookie 只在生产环境（`.familybank.chat`）工作
   - 本地 localhost 无法使用跨域 cookie

2. **Cookie 未正确设置**
   - Domain 设置错误
   - SameSite 或 Secure 标志问题

3. **数据库查询问题**
   - `family_members` 表没有记录
   - `current_profile_id` 为空

## 检查步骤

### 1. 确认环境

**本地开发：**
```bash
# 本地开发时，跨域 cookie 不会工作
# 需要在每个系统单独登录
http://localhost:3000  # 博客系统
http://localhost:3001  # 家庭积分系统
```

**生产环境：**
```bash
# 生产环境才能测试跨域 session
https://blog.familybank.chat
https://www.familybank.chat
```

### 2. 检查 Cookie

打开浏览器开发者工具 → Application → Cookies

**应该看到：**
```
Name: sb-mfgfbwhznqpdjumtsrus-auth-token
Domain: .familybank.chat
Path: /
Secure: ✓
SameSite: Lax
```

**如果 Domain 是具体域名（如 blog.familybank.chat），说明跨域 cookie 没有生效。**

### 3. 检查数据库

```sql
-- 1. 检查用户的 auth.users 记录
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 2. 检查 family_members 记录
SELECT * FROM family_members WHERE user_id = 'your-user-id';

-- 3. 检查 current_profile_id 对应的 profile
SELECT * FROM profiles WHERE id = 'current-profile-id';

-- 4. 检查家长名称
SELECT p.name 
FROM profiles p
JOIN family_members fm ON p.family_id = fm.family_id
WHERE fm.user_id = 'your-user-id' 
  AND p.role = 'admin';
```

### 4. 检查网络请求

打开开发者工具 → Network → 筛选 "supabase"

**查看响应头：**
```
Set-Cookie: sb-...; domain=.familybank.chat; path=/; ...
```

## 解决方案

### 方案 1: 生产环境测试

跨域 cookie 只在生产环境工作，请部署后测试：

1. 部署博客系统到 `blog.familybank.chat`
2. 部署家庭系统到 `www.familybank.chat`
3. 在家庭系统登录
4. 访问博客系统，应该自动登录

### 方案 2: 本地开发单独登录

本地开发时，在每个系统单独登录：

```bash
# 博客系统
http://localhost:3000/auth/login

# 家庭积分系统
http://localhost:3001/login
```

### 方案 3: 检查数据库记录

如果登录了但不显示名字，检查数据：

```sql
-- 确保有 family_members 记录
INSERT INTO family_members (user_id, family_id, current_profile_id)
VALUES (
  'your-user-id',
  'your-family-id',
  'your-profile-id'
);

-- 确保 profile 有名字
UPDATE profiles 
SET name = '王僚原', avatar_color = '#FF4D94'
WHERE id = 'your-profile-id';
```

### 方案 4: 清除缓存重新登录

1. 清除浏览器 Cookie
2. 清除浏览器缓存
3. 重新登录家庭系统
4. 访问博客系统

## 数据优先级说明

博客系统显示用户信息的优先级：

```
1. 家长名称（如果在家庭中）
   ↓
2. 当前 profile 名称（家庭积分系统）
   ↓
3. 博客 profile 用户名
   ↓
4. 邮箱前缀
```

**示例：**

用户邮箱：`wangliaoyuan@example.com`

| 情况 | 显示名称 | 来源 |
|------|---------|------|
| 有家长 | 王僚原 | families → admin profile |
| 有 profile | 小明 | current_profile_id → profile |
| 仅博客 | wangliaoyuan | blog profile.username |
| 无数据 | wangliaoyuan | email 前缀 |

## 常见问题

### Q: 为什么显示邮箱而不是名字？

**A:** 可能原因：
1. 没有 `family_members` 记录
2. `current_profile_id` 为空
3. Profile 的 `name` 字段为空

**解决：** 在家庭积分系统中创建或选择一个 profile

### Q: 本地开发如何测试跨域 session？

**A:** 本地开发无法测试跨域 cookie。需要：
1. 使用 ngrok 或类似工具创建 HTTPS 隧道
2. 配置自定义域名指向 localhost
3. 或直接在生产环境测试

### Q: 显示的是家长名字，但我想显示当前 profile 名字

**A:** 修改 `Header.tsx` 中的逻辑：

```typescript
// 当前逻辑（优先显示家长）
const displayName = adminName || familyProfile?.name || ...

// 修改为（优先显示当前 profile）
const displayName = familyProfile?.name || adminName || ...
```

### Q: Cookie 的 domain 不是 .familybank.chat

**A:** 检查：
1. 确认在生产环境（不是 localhost）
2. 检查 `NODE_ENV` 是否为 `production`
3. 查看代码中的环境检测逻辑

## 调试技巧

### 1. 添加日志

在 `Header.tsx` 中添加：

```typescript
useEffect(() => {
  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    console.log('Auth User:', authUser)
    
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle()
    console.log('Family Member:', familyMember)
    
    // ... 其他查询
  }
  checkUser()
}, [])
```

### 2. 检查 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目
3. Table Editor → 查看数据
4. Authentication → Users → 查看用户

### 3. 测试 API

使用 Postman 或 curl 测试：

```bash
# 获取用户信息
curl -X GET 'https://mfgfbwhznqpdjumtsrus.supabase.co/rest/v1/family_members?user_id=eq.YOUR_USER_ID' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 成功标志

当一切正常时，你应该看到：

1. ✅ 博客系统右上角显示用户名（不是邮箱）
2. ✅ 显示彩色头像或图片头像
3. ✅ 点击头像显示下拉菜单
4. ✅ 可以访问 Dashboard
5. ✅ "进入 XX 的家庭" 显示正确的家长名字

## 相关文档

- [跨域 Session 配置](./CROSS_DOMAIN_SESSION.md)
- [家庭信息集成](./FAMILY_PROFILE_INTEGRATION.md)
- [部署指南](./VERCEL_DEPLOYMENT.md)
