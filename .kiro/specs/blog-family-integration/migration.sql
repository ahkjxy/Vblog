-- ============================================================================
-- Blog System 迁移到 Family Points Bank 数据库
-- ============================================================================
-- 此脚本将 blog-system 的所有表结构迁移到 family-points-bank 的 Supabase 数据库
-- 执行前请确保已备份数据库
-- ============================================================================

-- ============================================================================
-- 第一部分：扩展 profiles 表
-- ============================================================================

-- 扩展 profiles 表以支持 blog-system
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author'));

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

COMMENT ON COLUMN profiles.bio IS 'Blog 用户个人简介';
COMMENT ON COLUMN profiles.role IS 'Blog 用户角色: admin-管理员, editor-编辑, author-作者';

-- ============================================================================
-- 第二部分：创建 Blog 相关表
-- ============================================================================

-- Posts 表（文章）
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB,
  excerpt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE posts IS 'Blog 文章表';
COMMENT ON COLUMN posts.slug IS 'URL 友好的文章标识符';
COMMENT ON COLUMN posts.content IS 'TipTap JSON 格式的文章内容';
COMMENT ON COLUMN posts.status IS '文章状态: draft-草稿, published-已发布, archived-已归档';

-- Categories 表（分类）
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Blog 文章分类表';

-- Tags 表（标签）
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tags IS 'Blog 文章标签表';

-- Post Categories 关联表
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

COMMENT ON TABLE post_categories IS 'Blog 文章与分类的多对多关联表';

-- Post Tags 关联表
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

COMMENT ON TABLE post_tags IS 'Blog 文章与标签的多对多关联表';

-- Comments 表（评论）
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE comments IS 'Blog 文章评论表';
COMMENT ON COLUMN comments.status IS '评论状态: pending-待审核, approved-已批准, rejected-已拒绝';

-- Settings 表（系统设置）
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE settings IS 'Blog 系统设置表';

-- ============================================================================
-- 第三部分：创建索引
-- ============================================================================

-- Posts 表索引
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);

-- Comments 表索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 关联表索引
CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Categories 和 Tags 索引
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- ============================================================================
-- 第四部分：启用行级安全 (RLS)
-- ============================================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 第五部分：创建 RLS 策略
-- ============================================================================

-- Posts 表策略
-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Authors can view own drafts" ON posts;
DROP POLICY IF EXISTS "Editors and admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Authors can insert posts" ON posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

-- 所有人可以查看已发布的文章
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published');

-- 作者可以查看自己的草稿
CREATE POLICY "Authors can view own drafts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

-- 编辑和管理员可以查看所有文章
CREATE POLICY "Editors and admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- 作者可以创建文章
CREATE POLICY "Authors can insert posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('author', 'editor', 'admin')
    )
  );

-- 作者可以更新自己的文章，编辑和管理员可以更新所有文章
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- 只有管理员可以删除文章
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories 表策略
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Editors can manage categories" ON categories;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Tags 表策略
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Editors can manage tags" ON tags;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage tags"
  ON tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Post Categories 关联表策略
DROP POLICY IF EXISTS "Post categories are viewable by everyone" ON post_categories;
DROP POLICY IF EXISTS "Authors can manage post categories" ON post_categories;

CREATE POLICY "Post categories are viewable by everyone"
  ON post_categories FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage post categories"
  ON post_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND author_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Post Tags 关联表策略
DROP POLICY IF EXISTS "Post tags are viewable by everyone" ON post_tags;
DROP POLICY IF EXISTS "Authors can manage post tags" ON post_tags;

CREATE POLICY "Post tags are viewable by everyone"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage post tags"
  ON post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND author_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- Comments 表策略
DROP POLICY IF EXISTS "Approved comments are viewable" ON comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- 已批准的评论在已发布的文章上可见
CREATE POLICY "Approved comments are viewable"
  ON comments FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND status = 'published'
    )
  );

-- 已认证用户可以评论
CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的评论，管理员可以更新所有评论
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 用户可以删除自己的评论，管理员可以删除所有评论
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Settings 表策略
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

CREATE POLICY "Settings are viewable by everyone"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 第六部分：创建触发器和函数
-- ============================================================================

-- 更新 updated_at 时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 posts 表创建触发器
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 comments 表创建触发器
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 settings 表创建触发器
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建函数：自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'author'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为 auth.users 表创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 第七部分：Storage 配置（需要在 Supabase Dashboard 中手动执行）
-- ============================================================================

-- 注意：以下 Storage 配置需要在 Supabase Dashboard 的 Storage 页面手动创建
-- 或使用 Supabase CLI 执行

-- 1. 创建 blog-media bucket
--    - Bucket name: blog-media
--    - Public: true
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

-- 2. Storage RLS 策略（在 SQL Editor 中执行）

-- 所有人可以读取 blog-media
CREATE POLICY "Public can view blog media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

-- 已认证用户可以上传到 blog-media
CREATE POLICY "Authenticated users can upload blog media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-media' AND
    auth.role() = 'authenticated'
  );

-- 用户只能删除自己上传的文件
CREATE POLICY "Users can delete own blog media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 第八部分：插入初始数据（可选）
-- ============================================================================

-- 插入默认分类
INSERT INTO categories (name, slug, description) VALUES
  ('家庭管理', 'family-management', '关于家庭日常管理的文章'),
  ('亲子教育', 'parenting', '亲子教育和儿童成长相关内容'),
  ('积分系统', 'points-system', '元气银行积分系统使用指南'),
  ('产品更新', 'product-updates', '产品功能更新和公告')
ON CONFLICT (slug) DO NOTHING;

-- 插入默认标签
INSERT INTO tags (name, slug) VALUES
  ('教程', 'tutorial'),
  ('技巧', 'tips'),
  ('更新', 'update'),
  ('指南', 'guide')
ON CONFLICT (slug) DO NOTHING;

-- 插入默认设置
INSERT INTO settings (key, value) VALUES
  ('site_title', '"元气银行博客"'),
  ('site_description', '"分享家庭管理智慧，记录成长点滴"'),
  ('comments_enabled', 'true'),
  ('comments_require_approval', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 迁移完成
-- ============================================================================

-- 验证表创建
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('posts', 'categories', 'tags', 'post_categories', 'post_tags', 'comments', 'settings');
  
  IF table_count = 7 THEN
    RAISE NOTICE '✅ Blog 系统迁移成功！所有 7 个表已创建。';
  ELSE
    RAISE WARNING '⚠️ 只创建了 % 个表，请检查错误日志。', table_count;
  END IF;
END $$;

-- 显示表统计
SELECT 
  'posts' as table_name, 
  COUNT(*) as row_count 
FROM posts
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;
