-- 1. 修改 posts 表，添加打赏统计字段
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS tips_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tips_total INTEGER DEFAULT 0;

-- 2. 创建打赏记录表
CREATE TABLE IF NOT EXISTS post_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0 AND amount <= 100),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_post_tips_post_id ON post_tips(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tips_from_user ON post_tips(from_user_id);
CREATE INDEX IF NOT EXISTS idx_post_tips_to_user ON post_tips(to_user_id);
CREATE INDEX IF NOT EXISTS idx_post_tips_created_at ON post_tips(created_at DESC);

-- 4. 启用 RLS
ALTER TABLE post_tips ENABLE ROW LEVEL SECURITY;

-- 5. RLS 策略
DROP POLICY IF EXISTS "Anyone can view tips" ON post_tips;
CREATE POLICY "Anyone can view tips"
  ON post_tips FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create tips" ON post_tips;
CREATE POLICY "Users can create tips"
  ON post_tips FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- 6. 创建打赏函数（原子操作）
CREATE OR REPLACE FUNCTION create_post_tip(
  p_post_id UUID,
  p_amount INTEGER,
  p_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_user_id UUID;
  v_to_user_id UUID;
  v_from_balance INTEGER;
  v_tip_id UUID;
  v_result JSON;
BEGIN
  -- 获取当前用户 ID
  v_from_user_id := auth.uid();
  
  IF v_from_user_id IS NULL THEN
    RAISE EXCEPTION '未登录';
  END IF;
  
  -- 验证金额
  IF p_amount <= 0 OR p_amount > 100 THEN
    RAISE EXCEPTION '打赏金额必须在 1-100 之间';
  END IF;
  
  -- 获取文章作者
  SELECT author_id INTO v_to_user_id
  FROM posts
  WHERE id = p_post_id AND status = 'published';
  
  IF v_to_user_id IS NULL THEN
    RAISE EXCEPTION '文章不存在或未发布';
  END IF;
  
  -- 不能给自己打赏
  IF v_from_user_id = v_to_user_id THEN
    RAISE EXCEPTION '不能给自己打赏';
  END IF;
  
  -- 检查打赏者余额
  SELECT balance INTO v_from_balance
  FROM profiles
  WHERE id = v_from_user_id
  FOR UPDATE;
  
  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION '积分余额不足';
  END IF;
  
  -- 扣除打赏者积分
  UPDATE profiles
  SET balance = balance - p_amount
  WHERE id = v_from_user_id;
  
  -- 增加作者积分
  UPDATE profiles
  SET balance = balance + p_amount
  WHERE id = v_to_user_id;
  
  -- 创建打赏记录
  INSERT INTO post_tips (post_id, from_user_id, to_user_id, amount, message)
  VALUES (p_post_id, v_from_user_id, v_to_user_id, p_amount, p_message)
  RETURNING id INTO v_tip_id;
  
  -- 更新文章打赏统计
  UPDATE posts
  SET 
    tips_count = tips_count + 1,
    tips_total = tips_total + p_amount
  WHERE id = p_post_id;
  
  -- 返回结果
  SELECT json_build_object(
    'success', true,
    'tip_id', v_tip_id,
    'message', '打赏成功'
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- 7. 创建获取打赏排行榜函数
CREATE OR REPLACE FUNCTION get_post_tips_leaderboard(
  p_post_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  total_amount INTEGER,
  tip_count INTEGER,
  latest_message TEXT,
  latest_tip_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.from_user_id,
    p.name,
    p.avatar_url,
    SUM(pt.amount)::INTEGER as total_amount,
    COUNT(*)::INTEGER as tip_count,
    (ARRAY_AGG(pt.message ORDER BY pt.created_at DESC))[1] as latest_message,
    MAX(pt.created_at) as latest_tip_at
  FROM post_tips pt
  JOIN profiles p ON p.id = pt.from_user_id
  WHERE pt.post_id = p_post_id
  GROUP BY pt.from_user_id, p.name, p.avatar_url
  ORDER BY total_amount DESC, latest_tip_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON TABLE post_tips IS '文章打赏记录表';
COMMENT ON FUNCTION create_post_tip IS '创建打赏记录（原子操作）';
COMMENT ON FUNCTION get_post_tips_leaderboard IS '获取文章打赏排行榜';
