-- 性能优化：RPC 函数（可选）
-- 这些函数可以进一步优化查询，但不是必需的

-- ============================================
-- 函数 1：获取分类及文章数
-- ============================================
CREATE OR REPLACE FUNCTION get_categories_with_count()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  post_count BIGINT
) 
LANGUAGE plpgsql
STABLE
AS $$
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
$$;

-- ============================================
-- 函数 2：获取热门文章
-- ============================================
CREATE OR REPLACE FUNCTION get_hot_posts(limit_count INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  view_count INT
) 
LANGUAGE plpgsql
STABLE
AS $$
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
$$;

-- ============================================
-- 函数 3：获取最新文章
-- ============================================
CREATE OR REPLACE FUNCTION get_recent_posts(limit_count INT DEFAULT 8)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  published_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
STABLE
AS $$
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
$$;
