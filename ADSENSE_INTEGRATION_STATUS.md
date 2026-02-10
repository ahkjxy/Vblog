# Google AdSense 集成状态

## 概述

两个系统都已成功集成 Google AdSense 验证代码。

## 集成详情

### 1. 博客系统 (blog-system)

**域名**: `blog.familybank.chat`

**集成位置**:
- ✅ `src/app/layout.tsx` - 通过 `<AdsenseScript />` 组件加载
- ✅ `src/components/ads/AdsenseScript.tsx` - AdSense 脚本组件
- ✅ `public/ads.txt` - AdSense 验证文件

**广告位配置**:
- 首页：2 个横幅广告
- 文章列表页：横幅广告 + 信息流广告
- 文章详情页：文章内广告 + 侧边栏广告

**环境变量** (`.env.local`):
```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-8769672462868982
NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=3948281301
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=3192866749
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=4306647603
NEXT_PUBLIC_ADSENSE_FEED_SLOT=1680484268
```

### 2. 家庭积分银行 (family-points-bank)

**域名**: `www.familybank.chat` 或 `familybank.chat`

**集成位置**:
- ✅ `index.html` - 在 `<head>` 中直接添加 AdSense 脚本
- ✅ `public/ads.txt` - AdSense 验证文件

**AdSense 脚本**:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8769672462868982" crossorigin="anonymous"></script>
```

## AdSense 账号信息

**Publisher ID**: `ca-pub-8769672462868982`

**关联域名**:
1. `blog.familybank.chat` - 博客系统
2. `familybank.chat` 或 `www.familybank.chat` - 家庭积分银行

## ads.txt 文件内容

两个系统的 `public/ads.txt` 文件内容相同：

```txt
google.com, pub-8769672462868982, DIRECT, f08c47fec0942fa0
```

**访问地址**:
- https://blog.familybank.chat/ads.txt
- https://www.familybank.chat/ads.txt

## 验证步骤

### 1. 检查脚本是否加载

**博客系统**:
```bash
curl https://blog.familybank.chat | grep "adsbygoogle"
```

**家庭积分银行**:
```bash
curl https://www.familybank.chat | grep "adsbygoogle"
```

### 2. 检查 ads.txt 文件

**博客系统**:
```bash
curl https://blog.familybank.chat/ads.txt
```

**家庭积分银行**:
```bash
curl https://www.familybank.chat/ads.txt
```

### 3. 在浏览器中验证

1. 访问网站
2. 右键 → 查看网页源代码
3. 搜索 `ca-pub-8769672462868982`
4. 应该能找到 AdSense 脚本

## Google AdSense 后台配置

### 网站验证

在 AdSense 后台添加两个网站：

1. **blog.familybank.chat**
   - 类型：博客/内容网站
   - 验证方法：自动（通过脚本标签）

2. **familybank.chat** 或 **www.familybank.chat**
   - 类型：Web 应用
   - 验证方法：自动（通过脚本标签）

### 验证时间

- **脚本检测**: 几分钟到几小时
- **DNS 传播**: 24-48 小时（如果刚配置域名）
- **完整审核**: 1-2 周

## 常见问题

### Q: 为什么需要在两个系统都添加？

**A**: 因为是两个不同的域名/子域名：
- `blog.familybank.chat` - 博客系统
- `www.familybank.chat` - 家庭积分银行

Google AdSense 需要验证每个域名。

### Q: 可以使用同一个 Publisher ID 吗？

**A**: 可以！同一个 AdSense 账号可以管理多个网站，都使用相同的 Publisher ID。

### Q: ads.txt 文件必须吗？

**A**: 不是必须的，但强烈推荐：
- 防止广告欺诈
- 提高广告填充率
- 增加广告收入
- Google 官方推荐

### Q: 验证失败怎么办？

**A**: 检查以下几点：
1. 域名是否正确配置并可访问
2. AdSense 脚本是否正确加载
3. ads.txt 文件是否可访问
4. DNS 是否已完全传播
5. 网站内容是否符合 AdSense 政策

## 下一步

### 1. 等待验证通过

- 在 AdSense 后台查看验证状态
- 通常需要几小时到几天

### 2. 创建广告单元

验证通过后，在 AdSense 后台创建广告单元：
- 展示广告
- 信息流广告
- 文章内广告
- 搜索广告

### 3. 部署广告

- 博客系统已配置好广告位
- 家庭积分银行可以根据需要添加广告组件

### 4. 监控表现

- 查看广告展示量
- 监控点击率
- 优化广告位置

## 技术支持

如果遇到问题：

1. 查看 `ADSENSE_VERIFICATION.md` 详细排查指南
2. 使用 `blog-system/check-adsense.sh` 诊断工具
3. 联系 Google AdSense 支持

## 更新日志

- **2026-02-10**: 
  - ✅ 博客系统集成 AdSense（完整广告系统）
  - ✅ 家庭积分银行添加验证脚本
  - ✅ 两个系统都添加 ads.txt 文件
