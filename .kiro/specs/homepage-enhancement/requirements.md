# 首页增强功能需求文档

## 项目概述

当前博客系统首页主要展示文章列表，内容相对单一。本需求旨在为首页添加更多丰富的板块，提升用户体验和内容展示的多样性，使首页更加生动、有吸引力。

## 核心需求

### 1. 作者介绍板块

**用户故事**: 作为访客，我想在首页看到博客作者的介绍，以便了解内容创作者的背景和专业领域。

#### 验收标准

1.1 THE 首页 SHALL 显示一个作者介绍板块
1.2 THE 作者介绍板块 SHALL 包含作者头像、姓名、简介和社交媒体链接
1.3 THE 作者介绍板块 SHALL 显示作者的文章数量和总阅读量
1.4 WHEN 用户点击作者头像或姓名 THEN 系统 SHALL 跳转到作者的个人页面或文章列表
1.5 THE 作者介绍板块 SHALL 使用与整站一致的紫粉渐变设计风格
1.6 THE 作者介绍板块 SHALL 在移动端自适应显示

### 2. 推荐阅读板块

**用户故事**: 作为访客，我想看到编辑精选或热门推荐的文章，以便快速找到高质量内容。

#### 验收标准

2.1 THE 首页 SHALL 显示一个推荐阅读板块
2.2 THE 推荐阅读板块 SHALL 展示 3-4 篇精选文章
2.3 THE 推荐阅读 SHALL 基于以下条件之一选择文章：
   - 管理员手动标记为"推荐"的文章
   - 阅读量最高的文章
   - 评论数最多的文章
2.4 THE 推荐文章卡片 SHALL 显示文章标题、摘要、作者、发布时间和阅读量
2.5 THE 推荐文章卡片 SHALL 使用不同的渐变色彩区分
2.6 WHEN 用户点击推荐文章 THEN 系统 SHALL 跳转到文章详情页

### 3. 时间线板块

**用户故事**: 作为访客，我想看到博客的更新时间线，以便了解最近的内容更新动态。

#### 验收标准

3.1 THE 首页 SHALL 显示一个时间线板块
3.2 THE 时间线 SHALL 按时间倒序显示最近 5-7 条更新记录
3.3 THE 时间线记录 SHALL 包括以下类型：
   - 新文章发布
   - 文章更新
   - 新分类添加
3.4 THE 时间线记录 SHALL 显示图标、标题、时间和简短描述
3.5 THE 时间线 SHALL 使用垂直线连接各个记录点
3.6 WHEN 用户点击时间线记录 THEN 系统 SHALL 跳转到相应的内容页面

### 4. 订阅通知板块

**用户故事**: 作为访客，我想订阅博客更新通知，以便及时获取新内容。

#### 验收标准

4.1 THE 首页 SHALL 显示一个订阅通知板块
4.2 THE 订阅板块 SHALL 包含邮箱输入框和订阅按钮
4.3 WHEN 用户输入邮箱并点击订阅 THEN 系统 SHALL 验证邮箱格式
4.4 WHEN 邮箱格式有效 THEN 系统 SHALL 保存订阅信息到数据库
4.5 WHEN 订阅成功 THEN 系统 SHALL 显示成功提示消息
4.6 THE 订阅板块 SHALL 显示当前订阅用户数量
4.7 THE 订阅板块 SHALL 包含隐私政策说明链接
4.8 THE 订阅板块 SHALL 使用吸引人的渐变背景和图标

### 5. 相关链接/友情链接板块

**用户故事**: 作为访客，我想看到相关的外部资源链接，以便探索更多相关内容。

#### 验收标准

5.1 THE 首页 SHALL 显示一个友情链接板块
5.2 THE 友情链接板块 SHALL 展示 6-8 个外部链接
5.3 THE 友情链接 SHALL 包含链接名称、描述和图标/Logo
5.4 THE 友情链接 SHALL 从数据库的 settings 表或专门的 links 表读取
5.5 WHEN 用户点击友情链接 THEN 系统 SHALL 在新标签页打开外部链接
5.6 THE 友情链接卡片 SHALL 使用卡片式布局，支持响应式网格
5.7 THE 友情链接 SHALL 支持管理员在后台添加、编辑和删除

### 6. 博客统计可视化板块

**用户故事**: 作为访客，我想看到博客的统计数据可视化，以便了解博客的活跃度和内容规模。

#### 验收标准

6.1 THE 首页 SHALL 显示一个统计可视化板块（增强现有统计板块）
6.2 THE 统计板块 SHALL 显示以下数据：
   - 总文章数
   - 总分类数
   - 总标签数
   - 总评论数
   - 总阅读量
   - 总订阅数
6.3 THE 统计数据 SHALL 使用图标和数字的组合展示
6.4 THE 统计卡片 SHALL 使用不同的渐变色彩
6.5 THE 统计数据 SHALL 支持动画效果（数字滚动动画）
6.6 THE 统计板块 SHALL 在移动端使用 2 列网格布局

### 7. 最新动态/公告板块

**用户故事**: 作为访客，我想看到博客的最新公告或重要通知，以便了解博客的最新动态。

#### 验收标准

7.1 THE 首页 SHALL 显示一个公告板块
7.2 THE 公告板块 SHALL 展示最新的 1-2 条公告
7.3 THE 公告 SHALL 包含标题、内容、发布时间和重要程度标识
7.4 THE 公告 SHALL 从数据库的 announcements 表读取
7.5 WHEN 有重要公告时 THEN 系统 SHALL 使用醒目的样式突出显示
7.6 THE 公告板块 SHALL 支持展开/收起功能
7.7 THE 公告 SHALL 支持管理员在后台创建、编辑和删除

### 8. 热门话题/趋势板块

**用户故事**: 作为访客，我想看到当前的热门话题和趋势，以便了解大家关注的内容。

#### 验收标准

8.1 THE 首页 SHALL 显示一个热门话题板块
8.2 THE 热门话题 SHALL 基于以下数据计算：
   - 最近 7 天阅读量最高的标签
   - 最近 7 天评论最多的文章主题
8.3 THE 热门话题 SHALL 显示话题名称和热度指标
8.4 THE 热门话题 SHALL 使用标签云或卡片式布局
8.5 WHEN 用户点击热门话题 THEN 系统 SHALL 显示相关文章列表
8.6 THE 热门话题 SHALL 每天自动更新

### 9. 快速导航板块

**用户故事**: 作为访客，我想快速访问博客的主要功能区域，以便提高浏览效率。

#### 验收标准

9.1 THE 首页 SHALL 显示一个快速导航板块
9.2 THE 快速导航 SHALL 包含以下入口：
   - 所有文章
   - 分类浏览
   - 标签浏览
   - 关于我们
   - 联系我们
   - 支持中心
9.3 THE 快速导航卡片 SHALL 包含图标、标题和简短描述
9.4 THE 快速导航卡片 SHALL 使用网格布局，支持响应式
9.5 THE 快速导航卡片 SHALL 使用悬浮效果和渐变色彩
9.6 WHEN 用户点击导航卡片 THEN 系统 SHALL 跳转到对应页面

### 10. 内容推荐算法

**用户故事**: 作为系统，我需要智能推荐内容，以便为用户提供个性化的阅读体验。

#### 验收标准

10.1 THE 系统 SHALL 实现内容推荐算法
10.2 THE 推荐算法 SHALL 考虑以下因素：
   - 文章阅读量
   - 文章评论数
   - 文章发布时间（新鲜度）
   - 文章分类和标签相关性
10.3 THE 推荐算法 SHALL 为不同板块提供不同的推荐策略
10.4 THE 推荐结果 SHALL 每小时更新一次
10.5 THE 推荐算法 SHALL 避免重复推荐相同内容

## 数据库扩展需求

### 1. 订阅表 (subscribers)

```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  verification_token TEXT,
  verified BOOLEAN DEFAULT FALSE
);
```

### 2. 公告表 (announcements)

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 友情链接表 (links)

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. 文章推荐标记

```sql
-- 在 posts 表添加字段
ALTER TABLE posts ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN featured_at TIMESTAMPTZ;
```

## 性能要求

1. THE 首页加载时间 SHALL 不超过 2 秒
2. THE 首页 SHALL 使用服务端渲染 (SSR) 提高首屏加载速度
3. THE 首页 SHALL 实现数据缓存，减少数据库查询
4. THE 首页图片 SHALL 使用懒加载技术
5. THE 首页 SHALL 支持渐进式加载，优先显示关键内容

## 设计要求

1. THE 所有新板块 SHALL 使用统一的紫粉渐变设计风格
2. THE 板块间距 SHALL 保持一致（py-20）
3. THE 卡片圆角 SHALL 使用 rounded-2xl 或 rounded-3xl
4. THE 悬浮效果 SHALL 包含阴影和轻微上移动画
5. THE 所有板块 SHALL 支持移动端响应式布局
6. THE 图标 SHALL 使用 Lucide Icons 保持一致性

## 可访问性要求

1. THE 所有交互元素 SHALL 支持键盘导航
2. THE 所有图片 SHALL 包含 alt 属性
3. THE 颜色对比度 SHALL 符合 WCAG 2.1 AA 标准
4. THE 表单 SHALL 包含清晰的标签和错误提示
5. THE 页面 SHALL 支持屏幕阅读器

## 优先级

**高优先级**:
- 推荐阅读板块（需求 2）
- 订阅通知板块（需求 4）
- 作者介绍板块（需求 1）

**中优先级**:
- 快速导航板块（需求 9）
- 时间线板块（需求 3）
- 热门话题板块（需求 8）

**低优先级**:
- 友情链接板块（需求 5）
- 公告板块（需求 7）
- 统计可视化增强（需求 6）

## 成功标准

1. ✅ 首页内容丰富度提升 50% 以上
2. ✅ 用户在首页的停留时间增加 30% 以上
3. ✅ 首页跳出率降低 20% 以上
4. ✅ 订阅转化率达到 5% 以上
5. ✅ 移动端用户体验评分达到 90 分以上
6. ✅ 首页加载性能评分（Lighthouse）达到 90 分以上
