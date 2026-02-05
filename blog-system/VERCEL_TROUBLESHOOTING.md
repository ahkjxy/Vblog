# Vercel 部署故障排查指南

## 问题：Invalid API key (401 错误)

### 症状
```
{
  "message": "Invalid API key",
  "hint": "Double check your Supabase `anon` or `service_role` API key."
}
```

### 原因分析
1. Vercel 环境变量未正确配置
2. 环境变量名称拼写错误
3. API 密钥值复制时包含了额外的空格或换行符
4. Supabase 项目密钥已过期或被重置

---

## 解决方案

### 步骤 1: 验证 Supabase 密钥是否有效

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目: `oeenrjhdamiadvucrjdq`
3. 进入 Settings → API
4. 检查以下信息：
   - **Project URL**: `https://oeenrjhdamiadvucrjdq.supabase.co`
   - **anon public key**: 以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头
   - **service_role key**: 以 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` 开头

### 步骤 2: 在 Vercel 中配置环境变量

1. 登录 Vercel Dashboard: https://vercel.com
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下三个环境变量：

#### 变量 1: NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://oeenrjhdamiadvucrjdq.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 变量 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [从 Supabase Dashboard 复制 anon public key]
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 变量 3: SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [从 Supabase Dashboard 复制 service_role key]
Environments: ✅ Production ✅ Preview ✅ Development
```

**⚠️ 重要提示**:
- 复制密钥时确保没有多余的空格或换行符
- 变量名称必须完全匹配（区分大小写）
- 确保所有三个环境都勾选了

### 步骤 3: 重新部署

配置完环境变量后：
1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **⋯** 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache** (可选)
6. 点击 **Redeploy** 按钮

### 步骤 4: 验证部署

部署完成后，测试以下功能：

1. **访问首页**: 应该能正常加载
2. **访问博客列表**: `/blog` - 应该能看到文章列表
3. **尝试登录**: `/auth/login` - 输入凭据测试

---

## 快速检查清单

使用此清单确保所有配置正确：

- [ ] Supabase 项目状态正常（访问 Dashboard 确认）
- [ ] 从 Supabase Dashboard 获取了最新的 API 密钥
- [ ] 在 Vercel 中添加了 `NEXT_PUBLIC_SUPABASE_URL`
- [ ] 在 Vercel 中添加了 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 在 Vercel 中添加了 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 所有环境变量都选择了 Production、Preview、Development
- [ ] 环境变量值没有多余的空格或换行符
- [ ] 已重新部署项目
- [ ] 清除了浏览器缓存并刷新页面

---

## 使用浏览器开发者工具调试

### 检查环境变量是否正确加载

1. 打开浏览器开发者工具 (F12)
2. 进入 **Console** 标签
3. 输入以下命令：

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Anon Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
```

**预期结果**:
```
Supabase URL: https://oeenrjhdamiadvucrjdq.supabase.co
Anon Key exists: true
Anon Key length: 200+ (具体长度)
```

如果显示 `undefined`，说明环境变量未正确配置。

### 检查网络请求

1. 进入 **Network** 标签
2. 刷新页面
3. 查找 Supabase API 请求
4. 检查请求头中的 `apikey` 字段
5. 确认 `Authorization` 头是否包含正确的 Bearer token

---

## 本地测试

在推送到 Vercel 之前，先在本地测试：

```bash
cd blog-system

# 确保 .env.local 文件存在且配置正确
cat .env.local

# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 在浏览器中访问 http://localhost:3000
```

如果本地运行正常但 Vercel 部署失败，问题一定在环境变量配置上。

---

## 获取新的 API 密钥

如果怀疑密钥已泄露或失效，可以重置：

1. 登录 Supabase Dashboard
2. 进入 Settings → API
3. 点击 **Reset API keys** (谨慎操作！)
4. 复制新的密钥
5. 更新 Vercel 环境变量
6. 更新本地 `.env.local` 文件
7. 重新部署

**⚠️ 警告**: 重置密钥会使所有使用旧密钥的应用失效！

---

## 联系支持

如果以上步骤都无法解决问题：

1. **Vercel 支持**: https://vercel.com/support
2. **Supabase 支持**: https://supabase.com/support
3. **项目维护者**: ahkjxy@qq.com

提供以下信息以便快速诊断：
- Vercel 部署 URL
- 错误截图
- 浏览器控制台日志
- Network 标签中的失败请求详情
