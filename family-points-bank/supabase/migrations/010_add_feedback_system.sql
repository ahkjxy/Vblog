-- =====================================================
-- 用户反馈系统 (User Feedback System)
-- =====================================================
-- 功能说明：
-- 1. 普通家庭可以向管理员家庭 (79ed05a1-e0e5-4d8c-9a79-d8756c488171) 提交反馈
-- 2. 管理员家庭可以查看所有反馈并回复
-- 3. 支持反馈状态管理（待处理、已回复、已关闭）
-- =====================================================

-- 创建反馈表
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 反馈内容
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- general, bug, feature, question
  
  -- 状态管理
  status TEXT NOT NULL DEFAULT 'pending', -- pending, replied, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  
  -- 管理员回复
  admin_reply TEXT,
  admin_replied_at TIMESTAMPTZ,
  admin_replied_by UUID REFERENCES profiles(id),
  
  -- 元数据
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT feedback_category_check CHECK (category IN ('general', 'bug', 'feature', 'question', 'privacy', 'other')),
  CONSTRAINT feedback_status_check CHECK (status IN ('pending', 'replied', 'closed')),
  CONSTRAINT feedback_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_feedback_family_id ON feedback(family_id);
CREATE INDEX IF NOT EXISTS idx_feedback_profile_id ON feedback(profile_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- =====================================================
-- RLS 策略 (Row Level Security Policies)
-- =====================================================

-- 启用 RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 1. 用户可以查看自己家庭的反馈
CREATE POLICY "Users can view their own family feedback"
  ON feedback
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 2. 管理员家庭可以查看所有反馈
CREATE POLICY "Admin family can view all feedback"
  ON feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    )
  );

-- 3. 用户可以创建反馈
CREATE POLICY "Users can create feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    AND family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 4. 用户可以更新自己的反馈（仅在未回复状态）
CREATE POLICY "Users can update their own pending feedback"
  ON feedback
  FOR UPDATE
  USING (
    profile_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    profile_id = auth.uid()
    AND status = 'pending'
  );

-- 5. 管理员家庭可以更新所有反馈（添加回复、更改状态）
CREATE POLICY "Admin family can update all feedback"
  ON feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    )
  );

-- 6. 用户可以删除自己的待处理反馈
CREATE POLICY "Users can delete their own pending feedback"
  ON feedback
  FOR DELETE
  USING (
    profile_id = auth.uid()
    AND status = 'pending'
  );

-- 7. 管理员家庭可以删除任何反馈
CREATE POLICY "Admin family can delete any feedback"
  ON feedback
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
    )
  );

-- =====================================================
-- 辅助函数
-- =====================================================

-- 获取反馈统计信息（管理员使用）
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE (
  total_feedback BIGINT,
  pending_count BIGINT,
  replied_count BIGINT,
  closed_count BIGINT,
  high_priority_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_feedback,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'replied')::BIGINT as replied_count,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT as closed_count,
    COUNT(*) FILTER (WHERE priority IN ('high', 'urgent'))::BIGINT as high_priority_count
  FROM feedback;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 标记反馈为已读（管理员使用）
CREATE OR REPLACE FUNCTION mark_feedback_as_replied(
  feedback_id UUID,
  reply_text TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- 获取当前用户 ID
  current_user_id := auth.uid();
  
  -- 检查是否是管理员家庭成员
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = current_user_id
    AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  ) THEN
    RAISE EXCEPTION 'Only admin family members can reply to feedback';
  END IF;
  
  -- 更新反馈
  UPDATE feedback
  SET
    status = 'replied',
    admin_reply = reply_text,
    admin_replied_at = NOW(),
    admin_replied_by = current_user_id
  WHERE id = feedback_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 示例数据（可选）
-- =====================================================

-- 插入一些示例反馈分类说明
COMMENT ON COLUMN feedback.category IS '反馈分类: general(一般), bug(错误), feature(功能建议), question(问题), privacy(隐私), other(其他)';
COMMENT ON COLUMN feedback.status IS '反馈状态: pending(待处理), replied(已回复), closed(已关闭)';
COMMENT ON COLUMN feedback.priority IS '优先级: low(低), normal(普通), high(高), urgent(紧急)';

-- =====================================================
-- 完成
-- =====================================================

-- 验证表创建
SELECT 
  'Feedback system migration completed successfully!' as message,
  COUNT(*) as feedback_count
FROM feedback;
