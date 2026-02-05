-- Migration: Add missing RLS policies for post_categories and post_tags
-- Run this if you already have the tables created but missing these policies

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Post categories are viewable by everyone" ON post_categories;
DROP POLICY IF EXISTS "Authors can manage post categories" ON post_categories;
DROP POLICY IF EXISTS "Post tags are viewable by everyone" ON post_tags;
DROP POLICY IF EXISTS "Authors can manage post tags" ON post_tags;

-- Post categories policies
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

-- Post tags policies
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
