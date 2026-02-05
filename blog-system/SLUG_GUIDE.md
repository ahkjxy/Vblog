# Slug 使用指南

## 什么是 Slug？

Slug 是文章的 URL 友好标识符，用于创建可读的网址。

例如：
- ❌ 不好: `/blog/123` 或 `/blog/-1`
- ✅ 好: `/blog/my-first-post` 或 `/blog/nextjs-tutorial`

## Slug 生成规则

### 自动生成

当你创建新文章时，系统会自动从标题生成 slug：

1. **英文标题**: 
   - 输入: "My First Blog Post"
   - Slug: "my-first-blog-post"

2. **中文标题**:
   - 输入: "我的第一篇博客"
   - Slug: "post-1234567890" (使用时间戳)

3. **混合标题**:
   - 输入: "Next.js 教程 Tutorial"
   - Slug: "nextjs-tutorial"

### 手动编辑

在创建或编辑文章时，你可以：

1. 使用自动生成的 slug
2. 手动输入自定义 slug
3. 修改自动生成的 slug

**Slug 规则**:
- 只能包含小写字母、数字和连字符 (-)
- 不能以连字符开头或结尾
- 长度至少 3 个字符
- 在整个博客中必须唯一

## 最佳实践

### ✅ 推荐的 Slug

```
how-to-use-nextjs
react-hooks-tutorial
2024-year-in-review
understanding-typescript
```

### ❌ 避免的 Slug

```
-1                    # 太短，无意义
my--post             # 多个连字符
post-                # 以连字符结尾
My-Post              # 包含大写字母
我的文章              # 包含中文字符
```

## 修复现有的无效 Slug

如果你的数据库中有无效的 slug，在 Supabase SQL Editor 中运行：

```sql
-- 查看所有无效的 slug
SELECT id, title, slug 
FROM posts 
WHERE slug IS NULL 
   OR slug = '' 
   OR LENGTH(slug) < 3
   OR slug ~ '^[-0-9]+$';

-- 修复所有无效的 slug
UPDATE posts
SET slug = 'post-' || EXTRACT(EPOCH FROM created_at)::bigint
WHERE slug IS NULL 
   OR slug = '' 
   OR LENGTH(slug) < 3
   OR slug ~ '^[-0-9]+$';
```

然后在后台编辑页面手动修改为更友好的 slug。

## 处理重复 Slug

系统会自动处理重复的 slug：

1. 如果 slug 已存在，会自动添加数字后缀
2. 例如: `my-post` → `my-post-1` → `my-post-2`

## 中文标题建议

对于中文标题的文章，建议：

1. **手动输入英文 slug**:
   ```
   标题: "Next.js 完整教程"
   Slug: "nextjs-complete-guide"
   ```

2. **使用拼音**:
   ```
   标题: "前端开发指南"
   Slug: "qianduan-kaifa-zhinan"
   ```

3. **使用英文翻译**:
   ```
   标题: "如何学习编程"
   Slug: "how-to-learn-programming"
   ```

4. **使用主题关键词**:
   ```
   标题: "2024年技术趋势"
   Slug: "tech-trends-2024"
   ```

## SEO 优化建议

好的 slug 对 SEO 很重要：

1. **包含关键词**: 使用文章主题相关的关键词
2. **保持简短**: 3-5 个单词最佳
3. **使用连字符**: 用 `-` 分隔单词，不要用下划线
4. **避免停用词**: 如 "a", "the", "and" 等
5. **描述性强**: 让用户一眼看出文章内容

### 示例

```
❌ 不好: "post-about-how-to-use-the-new-features"
✅ 好: "new-features-guide"

❌ 不好: "article_1"
✅ 好: "getting-started-react"

❌ 不好: "untitled-post-123"
✅ 好: "react-performance-tips"
```
