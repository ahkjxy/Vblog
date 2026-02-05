-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content JSONB,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Post categories junction table
CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Post tags junction table
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Settings table
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view own drafts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Editors and admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Authors can insert posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('author', 'editor', 'admin')
    )
  );

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
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

-- Tags policies
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

-- Comments policies
CREATE POLICY "Approved comments are viewable"
  ON comments FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND status = 'published'
    )
  );

CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
