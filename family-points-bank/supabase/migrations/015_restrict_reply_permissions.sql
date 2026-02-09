-- ============================================
-- 限制回复权限：只有超级管理员可以回复
-- ============================================

-- 1. 删除现有的回复策略
DROP POLICY IF EXISTS "replies_select" ON feedback_replies;
DROP POLICY IF EXISTS "replies_insert" ON feedback_replies;
DROP POLICY IF EXISTS "replies_update" ON feedback_replies;
DROP POLICY IF EXISTS "replies_delete" ON feedback_replies;

-- 2. SELECT: 用户可以查看自己反馈的回复（只看管理员回复）
CREATE POLICY "replies_select"
  ON feedback_replies FOR SELECT
  USING (
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

-- 3. INSERT: 只有超级管理员可以创建回复
CREATE POLICY "replies_insert"
  ON feedback_replies FOR INSERT
  WITH CHECK (
    -- 只有超级管理员可以回复
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 4. UPDATE: 只有超级管理员可以更新回复
CREATE POLICY "replies_update"
  ON feedback_replies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 5. DELETE: 只有超级管理员可以删除回复
CREATE POLICY "replies_delete"
  ON feedback_replies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND family_id = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'::uuid
    )
  );

-- 6. 验证策略
DO $$
BEGIN
  RAISE NOTICE '=== 回复权限策略已更新 ===';
  RAISE NOTICE '✅ 只有超级管理员 (79ed05a1-e0e5-4d8c-9a79-d8756c488171) 可以回复';
  RAISE NOTICE '✅ 普通用户只能查看管理员的回复';
  RAISE NOTICE '✅ 普通用户不能创建、更新或删除回复';
END $$;

-- 完成
COMMENT ON POLICY "replies_select" ON feedback_replies IS '用户可以查看自己反馈的回复，超级管理员可以查看所有';
COMMENT ON POLICY "replies_insert" ON feedback_replies IS '只有超级管理员可以创建回复';
COMMENT ON POLICY "replies_update" ON feedback_replies IS '只有超级管理员可以更新回复';
COMMENT ON POLICY "replies_delete" ON feedback_replies IS '只有超级管理员可以删除回复';
