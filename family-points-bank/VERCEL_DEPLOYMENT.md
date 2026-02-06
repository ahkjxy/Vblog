# Family Points Bank - Vercel 部署指南

## 项目类型

这是一个 **Vite + React** 项目（不是 Next.js），使用 SPA (Single Page Application) 架构。

## Vercel 配置

### vercel.json 说明

```json
{
  "buildCommand": "npm run build",        // 构建命令
  "outputDirectory": "dist",              // Vite 输出目录
  "rewrites": [                           // SPA 路由支持
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 部署步骤

### 方法 1: Vercel CLI (推荐)

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署到生产环境**
   ```bash
   cd family-points-bank
   vercel --prod
   ```

4. **配置域名**
   - 在 Vercel Dashboard 中添加自定义域名
   - 设置为 `www.familybank.chat`

### 方法 2: Vercel Dashboard

1. **导入项目**
   - 访问 [vercel.com/new](https://vercel.com/new)
   - 选择 Git 仓库
   - 选择 `family-points-bank` 目录

2. **配置构建设置**
   - Framework Preset: **Other** (不要选 Next.js)
   - Root Directory: `family-points-bank`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **环境变量**
   添加以下环境变量：
   ```
   VITE_SUPABASE_URL=https://mfgfbwhznqpdjumtsrus.supabase.co
   VITE_SUPABASE_ANON_KEY=你的密钥
   GEMINI_API_KEY=你的Gemini密钥（如果使用）
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成

5. **添加自定义域名**
   - Settings → Domains
   - 添加 `www.familybank.chat`

## 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://mfgfbwhznqpdjumtsrus.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key | Production, Preview, Development |
| `GEMINI_API_KEY` | 你的 Gemini API Key (可选) | Production, Preview, Development |

## 域名配置

### Vercel 设置

1. **添加域名**
   - Project Settings → Domains
   - 添加 `www.familybank.chat`
   - Vercel 会提供 DNS 配置信息

2. **DNS 配置**
   在你的域名提供商（如 Cloudflare）添加：
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   ```

### SSL 证书

Vercel 会自动配置 SSL 证书，通常需要几分钟。

## 验证部署

1. **检查构建日志**
   - 确保没有错误
   - 确认输出目录是 `dist`

2. **访问网站**
   - 访问 `https://www.familybank.chat`
   - 测试登录功能
   - 检查跨域 session（访问 blog.familybank.chat）

3. **检查 Cookie**
   - 打开开发者工具 → Application → Cookies
   - 确认 domain 是 `.familybank.chat`

## 常见问题

### Q: 显示 "No Next.js version detected"

**A:** 这是因为 `vercel.json` 配置错误。确保：
- 删除 `"framework": "nextjs"` 行
- 设置 `"outputDirectory": "dist"`（不是 `.next`）

### Q: 路由 404 错误

**A:** 需要配置 SPA rewrites：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Q: 环境变量不生效

**A:** 
- Vite 项目必须使用 `VITE_` 前缀
- 修改环境变量后需要重新部署
- 检查 Vercel Dashboard 中的环境变量配置

### Q: 构建失败

**A:** 检查：
1. Node.js 版本（推荐 18.x 或 20.x）
2. 依赖安装是否成功
3. 构建日志中的具体错误信息

## 性能优化

### 1. 启用 Gzip 压缩

Vercel 默认启用，无需配置。

### 2. 缓存策略

在 `vercel.json` 中已配置：
- Service Worker 不缓存
- 静态资源自动缓存

### 3. 预渲染

对于 SPA，可以考虑使用 Vite 的 SSG 插件，但当前配置已足够。

## 监控和日志

1. **访问日志**
   - Vercel Dashboard → Deployments → 选择部署 → Logs

2. **性能监控**
   - Vercel Analytics (需要启用)
   - 或使用 Google Analytics

3. **错误追踪**
   - 考虑集成 Sentry 或其他错误追踪服务

## 回滚

如果部署出现问题：

1. **通过 Dashboard**
   - Deployments → 选择之前的部署 → Promote to Production

2. **通过 CLI**
   ```bash
   vercel rollback
   ```

## 自动部署

连接 Git 仓库后，Vercel 会自动：
- 主分支推送 → 生产环境部署
- 其他分支推送 → 预览环境部署
- Pull Request → 预览环境部署

## 下一步

1. ✅ 修正 `vercel.json` 配置
2. 🚀 重新部署到 Vercel
3. 🔗 配置自定义域名 `www.familybank.chat`
4. 🧪 测试跨域 session 与 blog.familybank.chat
5. 📊 启用 Vercel Analytics（可选）

## 相关文档

- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel SPA 配置](https://vercel.com/docs/concepts/projects/project-configuration)
- [跨域 Session 配置](../CROSS_DOMAIN_SETUP.md)
