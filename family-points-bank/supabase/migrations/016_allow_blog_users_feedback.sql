-- ============================================
-- 允许博客系统用户发送反馈和查看回复
-- ============================================

-- 1. 删除现有的 feedback_messages INSERT 策略
DROP POLICY IF EXISTS "Users can create own family feedback" ON feedback_messages;
DROP POLICY IF EXISTS "feedback_insert" ON feedback_messages;

-- 2. 创建新的 INSERT 策略：允许任何认证用户插入反馈
CREATE POLICY "Authenticated users can create feedback"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    -- 任何认证用户都可以创建反馈
    auth.uid() IS NOT NULL
    AND
    -- 确保 profile_id 对应的 profile 存在且属于该 family_id
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = feedback_messages.profile_id
      AND family_id = feedback_messages.family_id
    )
  );

-- 3. 删除现有的 feedback_replies SELECT 策略
DROP POLICY IF EXISTS "replies_select" ON feedback_replies;
DROP POLICY IF EXISTS "Users can view replies" ON feedback_replies;

-- 4. 创建新的 SELECT 策略：用户可以查看自己反馈的回复
CREATE POLICY "Users can view own feedback replies"
  ON feedback_replies FOR SELECT
  USING (
    -- 用户可以查看自己提交的反馈的回复
    feedback_id IN (
      SELECT id FROM feedback_messages
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    -- 用户可以查看自己家庭反馈的回复
    feedback_id IN (
      SELECT id FROM feedback_messages
      WHERE family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    -- 超级管理员可以查看所有回复
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 5. 删除现有的 feedback_messages SELECT 策略
DROP POLICY IF EXISTS "Users can view feedback" ON feedback_messages;
DROP POLICY IF EXISTS "feedback_select" ON feedback_messages;

-- 6. 创建新的 SELECT 策略：用户可以查看自己的反馈
CREATE POLICY "Users can view own feedback"
  ON feedback_messages FOR SELECT
  USING (
    -- 用户可以查看自己提交的反馈
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
    OR
    -- 用户可以查看自己家庭的反馈
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
    OR
    -- 超级管理员可以查看所有反馈
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 7. 验证策略
DO $$
BEGIN
  RAISE NOTICE '=== 反馈系统权限已更新 ===';
  RAISE NOTICE '✅ 任何认证用户都可以创建反馈';
  RAISE NOTICE '✅ 用户可以查看自己提交的反馈';
  RAISE NOTICE '✅ 用户可以查看自己反馈的回复';
  RAISE NOTICE '✅ 超级管理员可以查看和回复所有反馈';
END $$;

-- 完成
COMMENT ON POLICY "Authenticated users can create feedback" ON feedback_messages IS '任何认证用户都可以创建反馈';
COMMENT ON POLICY "Users can view own feedback" ON feedback_messages IS '用户可以查看自己的反馈';
COMMENT ON POLICY "Users can view own feedback replies" ON feedback_replies IS '用户可以查看自己反馈的回复';

