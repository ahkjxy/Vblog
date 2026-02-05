# ✅ 部署检查清单

## Supabase 配置

- [ ] 在 SQL Editor 中运行 `supabase/schema.sql`
- [ ] 创建 `media` Storage bucket（设置为 public）
- [ ] 获取 Service Role Key 并更新 `.env.local`
- [ ] 验证所有表已创建（profiles, posts, categories, tags, comments, settings）
- [ ] 验证 RLS 策略已启用

## 本地开发

- [ ] 安装依赖: `npm install`
- [ ] 配置 `.env.local` 文件
- [ ] 启动开发服务器: `npm run dev`
- [ ] 访问 http://localhost:3000 确认首页加载

## 用户设置

- [ ] 注册第一个用户账户
- [ ] 在 Supabase profiles 表中将用户 role 设置为 `admin`
- [ ] 登录并访问 Dashboard
- [ ] 测试创建文章功能

## 功能测试

- [ ] 创建一篇草稿文章
- [ ] 上传图片到文章
- [ ] 发布文章
- [ ] 在首页查看已发布文章
- [ ] 访问文章详情页
- [ ] 创建分类
- [ ] 创建标签
- [ ] 测试文章编辑功能

## 可选配置

- [ ] 配置 Google OAuth
- [ ] 配置 GitHub OAuth
- [ ] 自定义网站标题和描述
- [ ] 添加网站 Logo
- [ ] 配置自定义域名

## 生产部署

- [ ] 推送代码到 GitHub
- [ ] 在 Vercel 导入项目
- [ ] 配置生产环境变量
- [ ] 更新 `NEXT_PUBLIC_SITE_URL` 为生产域名
- [ ] 测试生产环境功能
- [ ] 配置自定义域名（可选）

## 安全检查

- [ ] 确认 Service Role Key 未提交到 Git
- [ ] 验证 RLS 策略正常工作
- [ ] 测试未授权用户无法访问 Dashboard
- [ ] 测试用户只能编辑自己的文章
- [ ] 验证图片上传大小限制

## 性能优化

- [ ] 启用图片优化
- [ ] 配置 CDN（Vercel 自动提供）
- [ ] 添加 sitemap.xml
- [ ] 添加 robots.txt
- [ ] 配置 SEO meta 标签

## 监控和分析

- [ ] 配置 Google Analytics（可选）
- [ ] 设置错误监控（可选）
- [ ] 配置 Supabase 邮件通知

---

**当前进度**: 代码已完成，等待 Supabase 配置

**下一步**: 在 Supabase 中运行 SQL schema
