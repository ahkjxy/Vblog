# 需求文档

## 简介

本文档定义了一个基于 Supabase 的现代化全栈博客系统的需求。该系统使用 Next.js 14、TypeScript 和 Tailwind CSS 构建前端，使用 Supabase（PostgreSQL、Auth、Storage、Edge Functions）作为后端基础设施。系统支持多用户协作、内容管理、评论互动和媒体管理等核心功能。

## 术语表

- **System**: 整个博客系统，包括前端和后端组件
- **User**: 使用系统的任何人，包括访客、作者、编辑和管理员
- **Admin**: 具有完全系统访问权限的管理员用户
- **Editor**: 可以管理所有文章和评论的编辑用户
- **Author**: 可以创建和管理自己文章的作者用户
- **Post**: 博客文章，包含标题、内容、元数据等
- **Category**: 文章分类，用于组织内容
- **Tag**: 文章标签，用于内容标记和检索
- **Comment**: 用户对文章的评论
- **Draft**: 草稿状态的文章，未公开发布
- **Published**: 已发布状态的文章，公开可见
- **Archived**: 归档状态的文章，不在主列表显示
- **RLS**: 行级安全策略（Row Level Security），Supabase 的数据访问控制机制
- **Storage**: Supabase 存储服务，用于管理媒体文件
- **Rich_Text_Editor**: 富文本编辑器（TipTap），用于文章内容编辑

## 需求

### 需求 1：用户认证和授权

**用户故事：** 作为用户，我希望能够通过多种方式登录系统，以便安全地访问和管理内容。

#### 验收标准

1. WHEN 用户选择 GitHub 或 Google 登录 THEN THE System SHALL 通过 Supabase Auth 完成 OAuth 认证流程
2. WHEN 用户成功认证 THEN THE System SHALL 在 profiles 表中创建或更新用户配置文件
3. WHEN 用户访问受保护的资源 THEN THE System SHALL 验证用户的认证状态和角色权限
4. THE System SHALL 为每个用户分配一个角色（admin、editor 或 author）
5. WHEN 用户登出 THEN THE System SHALL 清除认证会话并重定向到首页

### 需求 2：用户资料管理

**用户故事：** 作为已认证用户，我希望能够管理我的个人资料，以便展示我的身份信息。

#### 验收标准

1. WHEN 用户更新头像 THEN THE System SHALL 上传图片到 Supabase Storage 并更新 profiles 表
2. WHEN 用户更新简介或其他资料 THEN THE System SHALL 验证输入并保存到 profiles 表
3. THE System SHALL 在用户资料页面显示用户的头像、用户名、简介和发布的文章列表
4. WHEN 用户上传头像 THEN THE System SHALL 验证文件类型（仅允许图片格式）和大小（最大 5MB）

### 需求 3：文章创建和编辑

**用户故事：** 作为作者，我希望能够创建和编辑文章，以便发布内容到博客。

#### 验收标准

1. WHEN 作者创建新文章 THEN THE System SHALL 使用 Rich_Text_Editor 提供富文本编辑功能
2. WHEN 作者保存文章 THEN THE System SHALL 验证必填字段（标题、内容）并存储到 posts 表
3. WHEN 作者上传封面图片 THEN THE System SHALL 上传到 Storage 并关联到文章
4. THE System SHALL 支持文章状态设置（Draft、Published、Archived）
5. WHEN 作者编辑已发布文章 THEN THE System SHALL 保留原始发布时间并更新修改时间
6. WHEN 作者输入文章内容 THEN THE System SHALL 自动生成摘要（前 200 字符）如果未手动提供
7. THE System SHALL 允许作者设置 SEO 元数据（meta title、meta description、slug）

### 需求 4：文章权限控制

**用户故事：** 作为系统管理员，我希望通过 RLS 策略控制文章访问权限，以确保数据安全。

#### 验收标准

1. WHEN 访客查询文章 THEN THE System SHALL 仅返回状态为 Published 的文章
2. WHEN Author 查询文章 THEN THE System SHALL 返回该作者创建的所有文章
3. WHEN Editor 或 Admin 查询文章 THEN THE System SHALL 返回所有文章
4. WHEN Author 尝试更新文章 THEN THE System SHALL 仅允许更新自己创建的文章
5. WHEN Editor 或 Admin 尝试更新文章 THEN THE System SHALL 允许更新任何文章
6. WHEN Author 尝试删除文章 THEN THE System SHALL 仅允许删除自己创建的文章
7. WHEN Admin 尝试删除文章 THEN THE System SHALL 允许删除任何文章

### 需求 5：文章浏览和搜索

**用户故事：** 作为访客，我希望能够浏览和搜索文章，以便找到感兴趣的内容。

#### 验收标准

1. WHEN 访客访问首页 THEN THE System SHALL 显示已发布文章列表，按发布时间倒序排列
2. WHEN 访客查看文章详情 THEN THE System SHALL 增加该文章的浏览量计数
3. WHEN 访客输入搜索关键词 THEN THE System SHALL 使用全文搜索返回匹配的文章
4. THE System SHALL 支持按分类筛选文章
5. THE System SHALL 支持按标签筛选文章
6. WHEN 显示文章列表 THEN THE System SHALL 包含分页功能（每页 10 篇文章）
7. WHEN 访客访问不存在的文章 THEN THE System SHALL 返回 404 错误页面

### 需求 6：分类管理

**用户故事：** 作为管理员，我希望能够管理文章分类，以便组织博客内容。

#### 验收标准

1. WHEN Admin 创建分类 THEN THE System SHALL 验证分类名称唯一性并存储到 categories 表
2. WHEN Admin 更新分类 THEN THE System SHALL 更新 categories 表并保持与文章的关联
3. WHEN Admin 删除分类 THEN THE System SHALL 检查是否有文章使用该分类
4. IF 分类被文章使用 THEN THE System SHALL 阻止删除并提示错误信息
5. THE System SHALL 允许为分类设置名称、slug 和描述
6. WHEN 访客按分类浏览 THEN THE System SHALL 显示该分类下的所有已发布文章

### 需求 7：标签管理

**用户故事：** 作为作者，我希望能够为文章添加标签，以便更好地标记和检索内容。

#### 验收标准

1. WHEN 作者为文章添加标签 THEN THE System SHALL 在 tags 表中创建标签（如果不存在）并建立关联
2. WHEN 作者移除文章标签 THEN THE System SHALL 删除 post_tags 表中的关联记录
3. THE System SHALL 支持一篇文章关联多个标签
4. THE System SHALL 支持一个标签关联多篇文章
5. WHEN Admin 删除标签 THEN THE System SHALL 删除所有相关的 post_tags 关联记录
6. WHEN 访客按标签浏览 THEN THE System SHALL 显示该标签下的所有已发布文章
7. THE System SHALL 在文章详情页显示所有关联的标签

### 需求 8：评论系统

**用户故事：** 作为已认证用户，我希望能够对文章发表评论，以便与作者和其他读者互动。

#### 验收标准

1. WHEN 已认证用户提交评论 THEN THE System SHALL 验证内容非空并存储到 comments 表
2. WHEN 用户回复评论 THEN THE System SHALL 创建嵌套评论并设置 parent_id 引用
3. THE System SHALL 为新评论设置状态为"待审核"
4. WHEN Editor 或 Admin 审核评论 THEN THE System SHALL 允许将状态更改为"已批准"或"垃圾评论"
5. WHEN 显示文章评论 THEN THE System SHALL 仅显示状态为"已批准"的评论
6. WHEN 用户删除自己的评论 THEN THE System SHALL 标记评论为已删除或物理删除
7. WHEN Admin 删除任何评论 THEN THE System SHALL 允许删除操作
8. THE System SHALL 按时间顺序显示评论，嵌套评论显示在父评论下方

### 需求 9：媒体管理

**用户故事：** 作为作者，我希望能够上传和管理媒体文件，以便在文章中使用图片。

#### 验收标准

1. WHEN 用户上传图片 THEN THE System SHALL 验证文件类型（jpg、png、gif、webp）和大小（最大 10MB）
2. WHEN 图片上传成功 THEN THE System SHALL 存储到 Supabase Storage 并返回公开 URL
3. THE System SHALL 在 Rich_Text_Editor 中提供图片插入功能
4. WHEN 用户访问媒体库 THEN THE System SHALL 显示该用户上传的所有媒体文件
5. WHEN 用户删除媒体文件 THEN THE System SHALL 从 Storage 中删除文件
6. THE System SHALL 为上传的图片生成缩略图（用于媒体库显示）
7. THE System SHALL 使用 Supabase Storage 的 RLS 策略控制媒体文件访问权限

### 需求 10：管理后台仪表盘

**用户故事：** 作为管理员，我希望能够查看系统统计数据，以便了解博客运营状况。

#### 验收标准

1. WHEN Admin 访问仪表盘 THEN THE System SHALL 显示文章总数、评论总数、用户总数
2. THE System SHALL 显示最近 7 天的文章发布趋势图表
3. THE System SHALL 显示最受欢迎的文章列表（按浏览量排序）
4. THE System SHALL 显示待审核评论数量
5. THE System SHALL 显示最近发布的文章列表（最多 5 篇）
6. WHEN 统计数据更新 THEN THE System SHALL 使用 Supabase 实时订阅自动刷新仪表盘

### 需求 11：管理后台文章管理

**用户故事：** 作为编辑，我希望能够在管理后台管理所有文章，以便高效地进行内容管理。

#### 验收标准

1. WHEN Editor 访问文章管理页面 THEN THE System SHALL 显示所有文章列表（包括草稿和已发布）
2. THE System SHALL 支持按状态、作者、分类筛选文章
3. THE System SHALL 支持批量操作（批量删除、批量更改状态）
4. WHEN Editor 点击编辑按钮 THEN THE System SHALL 导航到文章编辑页面
5. THE System SHALL 在列表中显示文章标题、作者、状态、发布时间、浏览量
6. THE System SHALL 支持文章列表的排序（按时间、浏览量等）

### 需求 12：系统设置

**用户故事：** 作为管理员，我希望能够配置系统设置，以便自定义博客行为。

#### 验收标准

1. WHEN Admin 更新系统设置 THEN THE System SHALL 验证输入并存储到 settings 表
2. THE System SHALL 支持配置博客标题、副标题、描述
3. THE System SHALL 支持配置每页显示文章数量
4. THE System SHALL 支持配置评论是否需要审核
5. THE System SHALL 支持配置允许的文件上传类型和大小限制
6. WHEN 系统设置更新 THEN THE System SHALL 立即应用新配置（无需重启）

### 需求 13：前端响应式设计

**用户故事：** 作为移动设备用户，我希望博客在不同设备上都能良好显示，以便随时随地阅读内容。

#### 验收标准

1. THE System SHALL 在桌面设备（>1024px）上使用多列布局
2. THE System SHALL 在平板设备（768px-1024px）上使用自适应布局
3. THE System SHALL 在移动设备（<768px）上使用单列布局
4. WHEN 用户在移动设备上访问 THEN THE System SHALL 显示汉堡菜单导航
5. THE System SHALL 确保所有交互元素在触摸屏上易于点击（最小 44x44px）
6. THE System SHALL 优化图片加载（使用 Next.js Image 组件）

### 需求 14：SEO 优化

**用户故事：** 作为博客所有者，我希望博客对搜索引擎友好，以便提高内容的可发现性。

#### 验收标准

1. THE System SHALL 为每篇文章生成唯一的 SEO 友好 URL（使用 slug）
2. THE System SHALL 在文章页面设置正确的 meta 标签（title、description、og:image）
3. THE System SHALL 生成 sitemap.xml 文件
4. THE System SHALL 生成 robots.txt 文件
5. THE System SHALL 使用语义化 HTML 标签（article、header、nav 等）
6. THE System SHALL 为图片设置 alt 属性
7. THE System SHALL 使用 Next.js 的服务端渲染（SSR）确保内容可被爬虫索引

### 需求 15：性能优化

**用户故事：** 作为用户，我希望博客加载速度快，以便获得良好的浏览体验。

#### 验收标准

1. THE System SHALL 使用 Next.js 静态生成（SSG）预渲染文章列表和详情页
2. THE System SHALL 使用增量静态再生成（ISR）在文章更新时重新生成页面
3. THE System SHALL 实现代码分割，按需加载组件
4. THE System SHALL 使用 Next.js Image 组件优化图片加载
5. THE System SHALL 实现图片懒加载
6. THE System SHALL 压缩和缓存静态资源
7. WHEN 首页加载 THEN THE System SHALL 在 3 秒内完成首次内容绘制（FCP）

### 需求 16：实时数据更新

**用户故事：** 作为管理员，我希望在管理后台看到实时数据更新，以便及时了解系统变化。

#### 验收标准

1. WHEN 新评论提交 THEN THE System SHALL 使用 Supabase 实时订阅通知管理员
2. WHEN 新文章发布 THEN THE System SHALL 实时更新仪表盘统计数据
3. WHEN 文章浏览量变化 THEN THE System SHALL 实时更新文章列表中的浏览量显示
4. THE System SHALL 在管理后台建立 WebSocket 连接以接收实时更新
5. WHEN 连接断开 THEN THE System SHALL 自动重连并恢复订阅

### 需求 17：数据验证和约束

**用户故事：** 作为系统架构师，我希望在数据库层面实施数据验证，以确保数据完整性。

#### 验收标准

1. THE System SHALL 在 posts 表中设置 title 字段为非空且最大长度 200 字符
2. THE System SHALL 在 posts 表中设置 slug 字段为唯一且非空
3. THE System SHALL 在 categories 表中设置 name 字段为唯一且非空
4. THE System SHALL 在 comments 表中设置 content 字段为非空
5. THE System SHALL 使用外键约束确保数据引用完整性
6. THE System SHALL 在 posts 表中设置 status 字段仅允许 'draft'、'published'、'archived' 值
7. THE System SHALL 在 comments 表中设置 status 字段仅允许 'pending'、'approved'、'spam' 值

### 需求 18：错误处理

**用户故事：** 作为用户，我希望在发生错误时看到友好的错误提示，以便了解问题并采取行动。

#### 验收标准

1. WHEN 数据库操作失败 THEN THE System SHALL 记录错误日志并向用户显示友好的错误消息
2. WHEN 文件上传失败 THEN THE System SHALL 显示具体的失败原因（文件过大、格式不支持等）
3. WHEN 用户访问未授权资源 THEN THE System SHALL 返回 403 错误页面
4. WHEN 用户访问不存在的页面 THEN THE System SHALL 返回 404 错误页面
5. WHEN 服务器错误发生 THEN THE System SHALL 返回 500 错误页面并记录详细错误信息
6. THE System SHALL 在表单验证失败时显示字段级错误提示
7. WHEN API 请求失败 THEN THE System SHALL 实现重试机制（最多 3 次）

### 需求 19：类型安全

**用户故事：** 作为开发者，我希望整个代码库使用 TypeScript，以便在编译时捕获类型错误。

#### 验收标准

1. THE System SHALL 为所有 Supabase 数据库表生成 TypeScript 类型定义
2. THE System SHALL 为所有 API 响应定义 TypeScript 接口
3. THE System SHALL 为所有 React 组件的 props 定义 TypeScript 类型
4. THE System SHALL 启用严格的 TypeScript 配置（strict mode）
5. THE System SHALL 在构建时进行类型检查，类型错误应导致构建失败
6. THE System SHALL 避免使用 any 类型（除非绝对必要）

### 需求 20：数据库架构和 RLS 策略

**用户故事：** 作为系统架构师，我希望设计安全的数据库架构，以便保护用户数据。

#### 验收标准

1. THE System SHALL 创建 profiles 表存储用户配置（id、username、avatar_url、bio、role）
2. THE System SHALL 创建 posts 表存储文章（id、title、content、slug、status、author_id、cover_image、views、published_at、created_at、updated_at）
3. THE System SHALL 创建 categories 表存储分类（id、name、slug、description）
4. THE System SHALL 创建 tags 表存储标签（id、name、slug）
5. THE System SHALL 创建 post_categories 表存储文章-分类关联（post_id、category_id）
6. THE System SHALL 创建 post_tags 表存储文章-标签关联（post_id、tag_id）
7. THE System SHALL 创建 comments 表存储评论（id、post_id、user_id、parent_id、content、status、created_at）
8. THE System SHALL 创建 settings 表存储系统设置（key、value）
9. THE System SHALL 为所有表启用 RLS 策略
10. THE System SHALL 实现基于角色的 RLS 策略以控制数据访问

