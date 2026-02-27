-- 1. 添加定时发布字段
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false;

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(is_scheduled, scheduled_at) 
WHERE is_scheduled = true AND status = 'draft';

-- 3. 创建自动发布函数
CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_published_count INTEGER := 0;
BEGIN
  -- 更新所有到期的定时文章
  UPDATE posts
  SET 
    status = 'published',
    published_at = scheduled_at,
    is_scheduled = false
  WHERE 
    is_scheduled = true 
    AND status = 'draft'
    AND scheduled_at <= NOW()
    AND scheduled_at IS NOT NULL;
  
  GET DIAGNOSTICS v_published_count = ROW_COUNT;
  
  RETURN v_published_count;
END;
$$;

-- 4. 创建定时任务（使用 pg_cron 扩展，如果可用）
-- 注意：需要在 Supabase Dashboard 中启用 pg_cron 扩展
-- 每分钟检查一次是否有需要发布的文章
-- SELECT cron.schedule(
--   'auto-publish-posts',
--   '* * * * *',
--   $$SELECT auto_publish_scheduled_posts()$$
-- );

-- 5. 创建触发器函数 - 设置定时发布时自动设置状态
CREATE OR REPLACE FUNCTION set_scheduled_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 如果设置了 scheduled_at 且在未来
  IF NEW.scheduled_at IS NOT NULL AND NEW.scheduled_at > NOW() THEN
    NEW.is_scheduled := true;
    NEW.status := 'draft';
    NEW.published_at := NULL;
  -- 如果 scheduled_at 已过期或被清除
  ELSIF NEW.scheduled_at IS NULL OR NEW.scheduled_at <= NOW() THEN
    NEW.is_scheduled := false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. 创建触发器
DROP TRIGGER IF EXISTS trigger_set_scheduled_status ON posts;
CREATE TRIGGER trigger_set_scheduled_status
  BEFORE INSERT OR UPDATE OF scheduled_at
  ON posts
  FOR EACH ROW
  EXECUTE FUNCTION set_scheduled_status();

-- 7. 创建获取定时文章列表的函数
CREATE OR REPLACE FUNCTION get_scheduled_posts(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  scheduled_at TIMESTAMPTZ,
  author_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.scheduled_at,
    pr.name as author_name,
    p.created_at
  FROM posts p
  JOIN profiles pr ON pr.id = p.author_id
  WHERE 
    p.is_scheduled = true 
    AND p.status = 'draft'
    AND p.scheduled_at > NOW()
    AND (p_user_id IS NULL OR p.author_id = p_user_id)
  ORDER BY p.scheduled_at ASC
  LIMIT p_limit;
END;
$$;

COMMENT ON COLUMN posts.scheduled_at IS '定时发布时间';
COMMENT ON COLUMN posts.is_scheduled IS '是否为定时发布';
COMMENT ON FUNCTION auto_publish_scheduled_posts IS '自动发布到期的定时文章';
COMMENT ON FUNCTION get_scheduled_posts IS '获取定时发布文章列表';
