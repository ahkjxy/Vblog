-- 添加文章审核系统
-- 1. 添加审核状态字段
-- 2. 添加审核者和审核时间字段
-- 3. 更新 RLS 策略

-- 检查并添加审核相关字段到 posts 表
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
    
    -- 添加索引
    CREATE INDEX idx_posts_review_status ON posts(review_status);
  END IF;

  -- 添加 reviewed_by 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
  END IF;

  -- 添加 reviewed_at 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 添加 family_id 字段到 profiles 表（如果还没有）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'family_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN family_id UUID;
  END IF;
END $$;

-- 更新现有文章的审核状态
-- 已发布的文章默认设为已审核
UPDATE posts 
SET review_status = 'approved' 
WHERE status = 'published' AND review_status = 'pending';

-- 删除旧的 RLS 策略
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete all posts" ON posts;

-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SELECT 策略
-- ============================================

-- 1. 前台：所有人可以查看已发布且已审核通过的文章
CREATE POLICY "Public can view approved published posts"
ON posts FOR SELECT
USING (
  status = 'published' 
  AND review_status = 'approved'
);

-- 2. 后台：用户可以查看自己家庭的所有文章
CREATE POLICY "Users can view own family posts"
ON posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.family_id = p2.family_id
    WHERE p1.id = auth.uid()
    AND p2.id = posts.author_id
    AND p1.family_id IS NOT NULL
  )
);

-- 3. 后台：超级管理员可以查看所有文章
CREATE POLICY "Super admins can view all posts"
ON posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- ============================================
-- INSERT 策略
-- ============================================

-- 用户可以创建文章（默认为待审核状态）
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND review_status = 'pending'
);

-- ============================================
-- UPDATE 策略
-- ============================================

-- 1. 用户可以更新自己家庭的文章（但不能修改审核状态）
CREATE POLICY "Users can update own family posts"
ON posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.family_id = p2.family_id
    WHERE p1.id = auth.uid()
    AND p2.id = posts.author_id
    AND p1.family_id IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.family_id = p2.family_id
    WHERE p1.id = auth.uid()
    AND p2.id = posts.author_id
    AND p1.family_id IS NOT NULL
  )
);

-- 2. 超级管理员可以更新所有文章（包括审核状态）
CREATE POLICY "Super admins can update all posts"
ON posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- ============================================
-- DELETE 策略
-- ============================================

-- 1. 用户可以删除自己家庭的文章
CREATE POLICY "Users can delete own family posts"
ON posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p1.family_id = p2.family_id
    WHERE p1.id = auth.uid()
    AND p2.id = posts.author_id
    AND p1.family_id IS NOT NULL
  )
);

-- 2. 超级管理员可以删除所有文章
CREATE POLICY "Super admins can delete all posts"
ON posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  )
);

-- ============================================
-- 创建审核函数
-- ============================================

-- 审核文章的函数（只有超级管理员可以调用）
CREATE OR REPLACE FUNCTION approve_post(
  post_id UUID,
  approve BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_user_family_id UUID;
  v_super_admin_family_id UUID := '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
BEGIN
  -- 检查当前用户是否是超级管理员
  SELECT family_id INTO v_user_family_id
  FROM profiles
  WHERE id = auth.uid() AND role = 'admin';
  
  IF v_user_family_id IS NULL OR v_user_family_id != v_super_admin_family_id THEN
    RAISE EXCEPTION '只有超级管理员可以审核文章';
  END IF;
  
  -- 更新文章审核状态
  UPDATE posts
  SET 
    review_status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建视图：获取待审核文章数量
CREATE OR REPLACE VIEW pending_posts_count AS
SELECT COUNT(*) as count
FROM posts
WHERE review_status = 'pending';

-- 授予权限
GRANT SELECT ON pending_posts_count TO authenticated;

COMMENT ON TABLE posts IS '文章表，包含审核系统';
COMMENT ON COLUMN posts.review_status IS '审核状态：pending-待审核, approved-已通过, rejected-已拒绝';
COMMENT ON COLUMN posts.reviewed_by IS '审核者ID';
COMMENT ON COLUMN posts.reviewed_at IS '审核时间';
