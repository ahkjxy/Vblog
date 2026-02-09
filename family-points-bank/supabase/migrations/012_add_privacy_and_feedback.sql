-- ============================================
-- 隐私协议和反馈系统完整实现
-- ============================================

-- 1. 创建隐私协议同意记录表
CREATE TABLE IF NOT EXISTS privacy_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  UNIQUE(family_id, version)
);

-- 2. 创建反馈留言表（如果不存在）
CREATE TABLE IF NOT EXISTS feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 创建反馈回复表
CREATE TABLE IF NOT EXISTS feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback_messages(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_privacy_agreements_family ON privacy_agreements(family_id);
CREATE INDEX IF NOT EXISTS idx_privacy_agreements_version ON privacy_agreements(version);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_family ON feedback_messages(family_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_status ON feedback_messages(status);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_created ON feedback_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback ON feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_created ON feedback_replies(created_at);

-- 5. 启用 RLS
ALTER TABLE privacy_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_replies ENABLE ROW LEVEL SECURITY;

-- 6. 隐私协议 RLS 策略
-- 用户可以查看自己家庭的协议记录
CREATE POLICY "Users can view own family privacy agreements"
  ON privacy_agreements FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 用户可以创建自己家庭的协议记录
CREATE POLICY "Users can create own family privacy agreements"
  ON privacy_agreements FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 7. 反馈留言 RLS 策略
-- 用户可以查看自己家庭的反馈或超级管理员可以查看所有
CREATE POLICY "Users can view feedback"
  ON feedback_messages FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 用户可以创建自己家庭的反馈
CREATE POLICY "Users can create own family feedback"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND family_id = feedback_messages.family_id
    )
  );

-- 用户可以更新自己家庭的反馈或超级管理员可以更新所有
CREATE POLICY "Users can update feedback"
  ON feedback_messages FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 8. 反馈回复 RLS 策略
-- 用户可以查看相关反馈的回复
CREATE POLICY "Users can view replies"
  ON feedback_replies FOR SELECT
  USING (
    feedback_id IN (
      SELECT id FROM feedback_messages
      WHERE family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 用户可以创建回复
CREATE POLICY "Users can create replies"
  ON feedback_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND family_id = feedback_replies.family_id
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 9. 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedback_messages_updated_at
  BEFORE UPDATE ON feedback_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_replies_updated_at
  BEFORE UPDATE ON feedback_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. 创建函数：检查是否已同意隐私协议
CREATE OR REPLACE FUNCTION check_privacy_agreement(
  p_family_id UUID,
  p_version VARCHAR DEFAULT '1.0.0'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM privacy_agreements
    WHERE family_id = p_family_id
    AND version = p_version
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 创建函数：获取反馈统计（超级管理员）
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE (
  total_feedback BIGINT,
  pending_count BIGINT,
  in_progress_count BIGINT,
  resolved_count BIGINT,
  closed_count BIGINT,
  high_priority_count BIGINT,
  urgent_priority_count BIGINT
) AS $$
BEGIN
  -- 检查是否是超级管理员
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only super admin can access feedback stats';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_feedback,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_count,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT as closed_count,
    COUNT(*) FILTER (WHERE priority = 'high')::BIGINT as high_priority_count,
    COUNT(*) FILTER (WHERE priority = 'urgent')::BIGINT as urgent_priority_count
  FROM feedback_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 创建函数：获取反馈详情（包含回复）
CREATE OR REPLACE FUNCTION get_feedback_with_replies(p_feedback_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'feedback', row_to_json(fm.*),
    'replies', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', fr.id,
            'message', fr.message,
            'is_admin_reply', fr.is_admin_reply,
            'created_at', fr.created_at,
            'profile', (
              SELECT json_build_object(
                'id', p.id,
                'name', p.name,
                'avatar_url', p.avatar_url
              )
              FROM profiles p
              WHERE p.id = fr.profile_id
            )
          )
          ORDER BY fr.created_at ASC
        )
        FROM feedback_replies fr
        WHERE fr.feedback_id = p_feedback_id
      ),
      '[]'::json
    )
  ) INTO result
  FROM feedback_messages fm
  WHERE fm.id = p_feedback_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 创建视图：反馈列表（带用户信息）
CREATE OR REPLACE VIEW feedback_list_view AS
SELECT
  fm.id,
  fm.family_id,
  fm.profile_id,
  fm.subject,
  fm.message,
  fm.category,
  fm.status,
  fm.priority,
  fm.created_at,
  fm.updated_at,
  p.name as profile_name,
  p.avatar_url as profile_avatar,
  f.name as family_name,
  (
    SELECT COUNT(*)
    FROM feedback_replies fr
    WHERE fr.feedback_id = fm.id
  ) as reply_count,
  (
    SELECT MAX(fr.created_at)
    FROM feedback_replies fr
    WHERE fr.feedback_id = fm.id
  ) as last_reply_at
FROM feedback_messages fm
LEFT JOIN profiles p ON fm.profile_id = p.id
LEFT JOIN families f ON fm.family_id = f.id;

-- 14. 授予权限
GRANT SELECT ON feedback_list_view TO authenticated;

-- 完成
COMMENT ON TABLE privacy_agreements IS '隐私协议同意记录表';
COMMENT ON TABLE feedback_messages IS '用户反馈留言表';
COMMENT ON TABLE feedback_replies IS '反馈回复表';
COMMENT ON FUNCTION check_privacy_agreement IS '检查家庭是否已同意隐私协议';
COMMENT ON FUNCTION get_feedback_stats IS '获取反馈统计信息（超级管理员）';
COMMENT ON FUNCTION get_feedback_with_replies IS '获取反馈详情及所有回复';
