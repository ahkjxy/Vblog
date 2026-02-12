-- 性能优化：添加数据库索引
-- 执行此文件以提升查询性能

-- Posts 表索引
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_review_status ON posts(review_status);

-- Post Categories 表索引
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_composite ON post_categories(category_id, post_id);

-- Post Tags 表索引
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Comments 表索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- Categories 表索引
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Tags 表索引
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Profiles 表索引
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON profiles(family_id);

-- 创建 RPC 函数：获取分类及文章数（优化版）
CREATE OR REPLACE FUNCTION get_categories_with_count()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  post_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    COUNT(DISTINCT p.id) as post_count
  FROM categories c
  LEFT JOIN post_categories pc ON c.id = pc.category_id
  LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'published'
  GROUP BY c.id, c.name, c.slug, c.description
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- 创建 RPC 函数：获取热门文章
CREATE OR REPLACE FUNCTION get_hot_posts(limit_count INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  view_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.view_count
  FROM posts p
  WHERE p.status = 'published'
  ORDER BY p.view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 创建 RPC 函数：获取最新文章
CREATE OR REPLACE FUNCTION get_recent_posts(limit_count INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.published_at
  FROM posts p
  WHERE p.status = 'published'
  ORDER BY p.published_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 分析表以更新统计信息
ANALYZE posts;
ANALYZE post_categories;
ANALYZE post_tags;
ANALYZE comments;
ANALYZE categories;
ANALYZE tags;
ANALYZE profiles;
