-- 性能优化：添加数据库索引（简化版）
-- 分步执行此文件以提升查询性能

-- ============================================
-- 第一步：Posts 表索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_review_status ON posts(review_status);

-- ============================================
-- 第二步：Post Categories 表索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_composite ON post_categories(category_id, post_id);

-- ============================================
-- 第三步：Post Tags 表索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- ============================================
-- 第四步：Comments 表索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================
-- 第五步：Categories 和 Tags 表索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ============================================
-- 第六步：Profiles 表索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON profiles(family_id);

-- ============================================
-- 第七步：分析表以更新统计信息
-- ============================================
ANALYZE posts;
ANALYZE post_categories;
ANALYZE post_tags;
ANALYZE comments;
ANALYZE categories;
ANALYZE tags;
ANALYZE profiles;
