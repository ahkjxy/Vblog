# APK 下载问题修复

## 问题
APK 文件（11MB）无法从 Vercel 下载，访问 `https://www.familybank.chat/download/family-bank.apk` 返回 HTML 而不是 APK 文件。

## 原因
1. Vercel 的 `rewrites` 配置会将所有请求重定向到 `index.html`
2. 大文件在 Vercel 上可能有限制

## 解决方案

### 当前配置（方案1）
使用正则表达式排除 `/download/` 路径：
```json
{
  "rewrites": [
    {
      "source": "/((?!download/).*)",
      "destination": "/index.html"
    }
  ]
}
```

这个配置会：
- 排除所有以 `/download/` 开头的路径
- 其他路径重定向到 `index.html`（用于 SPA 路由）

### 备选方案（如果方案1不行）

#### 方案2：使用 GitHub Releases
1. 在 GitHub 仓库创建 Release
2. 上传 APK 文件到 Release
3. 使用 GitHub 的下载链接：
   ```
   https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0/family-bank.apk
   ```

#### 方案3：使用 Vercel Blob Storage
```bash
npm install @vercel/blob
```

然后创建 API 路由来提供下载：
```typescript
// api/download.ts
import { put } from '@vercel/blob';

export async function GET() {
  // 从 Blob 存储获取文件
}
```

#### 方案4：使用其他 CDN
- Cloudflare R2
- AWS S3
- 阿里云 OSS
- 腾讯云 COS

## 测试
部署后测试：
```bash
curl -I https://www.familybank.chat/download/family-bank.apk
```

应该返回：
```
Content-Type: application/vnd.android.package-archive
Content-Disposition: attachment; filename="family-bank.apk"
```

## 当前状态
- ✅ 配置已更新
- ⏳ 等待部署测试
- 📝 如果不行，建议使用 GitHub Releases

## 部署步骤
1. 提交更改到 Git
2. 推送到 GitHub
3. Vercel 自动部署
4. 测试下载链接
