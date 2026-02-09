-- ============================================
-- 最终修复反馈系统 RLS 策略
-- ============================================

-- 1. 完全删除所有相关策略
DROP POLICY IF EXISTS "Users can view own family privacy agreements" ON privacy_agreements;
DROP POLICY IF EXISTS "Users can create own family privacy agreements" ON privacy_agreements;
DROP POLICY IF EXISTS "Users can view own family feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Super admin can view all feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users can view feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users can create own family feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users can update own family feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Super admin can update all feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users can update feedback" ON feedback_messages;
DROP POLICY IF EXISTS "Users can view own feedback replies" ON feedback_replies;
DROP POLICY IF EXISTS "Super admin can view all replies" ON feedback_replies;
DROP POLICY IF EXISTS "Users can view replies" ON feedback_replies;
DROP POLICY IF EXISTS "Users can create own feedback replies" ON feedback_replies;
DROP POLICY IF EXISTS "Super admin can create any replies" ON feedback_replies;
DROP POLICY IF EXISTS "Users can create replies" ON feedback_replies;

-- 2. 隐私协议 RLS 策略
CREATE POLICY "privacy_select"
  ON privacy_agreements FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "privacy_insert"
  ON privacy_agreements FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 3. 反馈留言 RLS 策略
-- SELECT: 用户可以查看自己家庭的反馈或超级管理员可以查看所有
CREATE POLICY "feedback_select"
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

-- INSERT: 用户可以创建自己家庭的反馈
CREATE POLICY "feedback_insert"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- UPDATE: 用户可以更新自己家庭的反馈或超级管理员可以更新所有
CREATE POLICY "feedback_update"
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
  )
  WITH CHECK (
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

-- 4. 反馈回复 RLS 策略
-- SELECT: 用户可以查看相关反馈的回复
CREATE POLICY "replies_select"
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

-- INSERT: 用户可以创建回复
CREATE POLICY "replies_insert"
  ON feedback_replies FOR INSERT
  WITH CHECK (
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

-- 5. 验证策略
DO $$
BEGIN
  -- 检查策略是否创建成功
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_messages' 
    AND policyname = 'feedback_insert'
  ) THEN
    RAISE EXCEPTION 'Failed to create feedback_insert policy';
  END IF;
  
  RAISE NOTICE 'All RLS policies created successfully';
END $$;

-- 完成
COMMENT ON POLICY "privacy_select" ON privacy_agreements IS '用户可以查看自己家庭的隐私协议记录';
COMMENT ON POLICY "privacy_insert" ON privacy_agreements IS '用户可以创建自己家庭的隐私协议记录';
COMMENT ON POLICY "feedback_select" ON feedback_messages IS '用户可以查看自己家庭的反馈，超级管理员可以查看所有';
COMMENT ON POLICY "feedback_insert" ON feedback_messages IS '用户可以创建自己家庭的反馈';
COMMENT ON POLICY "feedback_update" ON feedback_messages IS '用户可以更新自己家庭的反馈，超级管理员可以更新所有';
COMMENT ON POLICY "replies_select" ON feedback_replies IS '用户可以查看相关反馈的回复';
COMMENT ON POLICY "replies_insert" ON feedback_replies IS '用户可以创建回复';
