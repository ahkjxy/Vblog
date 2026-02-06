-- 快速设置审核系统
-- 这个脚本会：
-- 1. 添加审核字段（如果不存在）
-- 2. 将所有已发布的文章设为"已通过"
-- 3. 将所有草稿设为"待审核"

-- ============================================
-- 第一步：添加字段
-- ============================================

DO $$ 
BEGIN
  -- 添加 review_status 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE posts 
    ADD COLUMN review_status VARCHAR(20) DEFAULT 'pending' 
      CHECK (review_status IN ('pending', 'approved', 'rejected'));
    
    RAISE NOTICE '✓ 已添加 review_status 字段';
  ELSE
    RAISE NOTICE '✓ review_status 字段已存在';
  END IF;

  -- 添加 reviewed_by 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
    RAISE NOTICE '✓ 已添加 reviewed_by 字段';
  ELSE
    RAISE NOTICE '✓ reviewed_by 字段已存在';
  END IF;

  -- 添加 reviewed_at 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✓ 已添加 reviewed_at 字段';
  ELSE
    RAISE NOTICE '✓ reviewed_at 字段已存在';
  END IF;
END $$;

-- ============================================
-- 第二步：添加索引
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'posts' AND indexname = 'idx_posts_review_status'
  ) THEN
    CREATE INDEX idx_posts_review_status ON posts(review_status);
    RAISE NOTICE '✓ 已添加索引';
  ELSE
    RAISE NOTICE '✓ 索引已存在';
  END IF;
END $$;

-- ============================================
-- 第三步：更新现有文章的审核状态
-- ============================================

-- 将所有已发布的文章设为"已通过"
UPDATE posts 
SET review_status = 'approved',
    reviewed_at = NOW()
WHERE status = 'published' 
  AND (review_status IS NULL OR review_status = 'pending');

-- 显示更新结果
DO $$
DECLARE
  approved_count INTEGER;
  pending_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO approved_count FROM posts WHERE review_status = 'approved';
  SELECT COUNT(*) INTO pending_count FROM posts WHERE review_status = 'pending';
  SELECT COUNT(*) INTO total_count FROM posts;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '审核状态统计：';
  RAISE NOTICE '  已通过: % 篇', approved_count;
  RAISE NOTICE '  待审核: % 篇', pending_count;
  RAISE NOTICE '  总文章: % 篇', total_count;
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 第四步：查看文章审核状态
-- ============================================

SELECT 
  id,
  title,
  status,
  review_status,
  author_id,
  published_at,
  reviewed_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;
