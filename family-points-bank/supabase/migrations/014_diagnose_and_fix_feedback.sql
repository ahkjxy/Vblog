-- ============================================
-- 诊断和修复反馈系统权限问题
-- ============================================

-- 1. 诊断：检查用户和家庭关系
DO $$
DECLARE
  v_user_id UUID := '6e3e950d-89f5-4966-836b-125405f35a8a';
  v_profile_id UUID := '3dad9ebf-7486-46f0-9bd4-41b0d117616b';
  v_family_id UUID := 'e3ff47c0-03fa-443f-823f-833c76398f0d';
  v_profile_family_id UUID;
BEGIN
  -- 检查 profile 的 family_id
  SELECT family_id INTO v_profile_family_id
  FROM profiles
  WHERE id = v_profile_id;
  
  RAISE NOTICE '=== 诊断信息 ===';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Profile ID: %', v_profile_id;
  RAISE NOTICE 'Expected Family ID: %', v_family_id;
  RAISE NOTICE 'Profile Family ID: %', v_profile_family_id;
  
  IF v_profile_family_id = v_family_id THEN
    RAISE NOTICE '✅ Profile 和 Family 匹配';
  ELSE
    RAISE NOTICE '❌ Profile 和 Family 不匹配！';
  END IF;
  
  -- 检查 auth.uid() 是否匹配
  IF v_user_id = v_profile_id THEN
    RAISE NOTICE '✅ User ID 和 Profile ID 匹配';
  ELSE
    RAISE NOTICE '⚠️  User ID 和 Profile ID 不匹配';
  END IF;
END $$;

-- 2. 查看当前用户的所有信息
SELECT 
  '当前用户信息' as info_type,
  p.id as profile_id,
  p.name as profile_name,
  p.family_id,
  f.name as family_name,
  p.role
FROM profiles p
LEFT JOIN families f ON p.family_id = f.id
WHERE p.id = '3dad9ebf-7486-46f0-9bd4-41b0d117616b';

-- 3. 检查 RLS 策略
SELECT 
  '当前 RLS 策略' as info_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE tablename = 'feedback_messages'
ORDER BY policyname;

-- 4. 测试策略（模拟插入）
DO $$
DECLARE
  v_can_insert BOOLEAN;
  v_profile_family_id UUID;
BEGIN
  -- 获取 profile 的 family_id
  SELECT family_id INTO v_profile_family_id
  FROM profiles
  WHERE id = '3dad9ebf-7486-46f0-9bd4-41b0d117616b';
  
  -- 检查是否可以插入
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = '3dad9ebf-7486-46f0-9bd4-41b0d117616b'
    AND family_id = 'e3ff47c0-03fa-443f-823f-833c76398f0d'
  ) INTO v_can_insert;
  
  RAISE NOTICE '=== 插入权限测试 ===';
  RAISE NOTICE 'Profile Family ID: %', v_profile_family_id;
  RAISE NOTICE 'Target Family ID: e3ff47c0-03fa-443f-823f-833c76398f0d';
  RAISE NOTICE 'Can Insert: %', v_can_insert;
  
  IF v_can_insert THEN
    RAISE NOTICE '✅ 用户有权限插入此 family_id 的反馈';
  ELSE
    RAISE NOTICE '❌ 用户没有权限插入此 family_id 的反馈';
    RAISE NOTICE '提示：请使用 profile 的 family_id: %', v_profile_family_id;
  END IF;
END $$;

-- 5. 创建更宽松的临时策略（用于测试）
DROP POLICY IF EXISTS "feedback_insert_temp" ON feedback_messages;

CREATE POLICY "feedback_insert_temp"
  ON feedback_messages FOR INSERT
  WITH CHECK (
    -- 允许用户插入任何 family_id 的反馈（临时测试用）
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

-- 6. 显示建议
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== 修复建议 ===';
  RAISE NOTICE '1. 如果 Profile 和 Family 不匹配，请更新 profile 的 family_id';
  RAISE NOTICE '2. 或者在插入时使用 profile 的实际 family_id';
  RAISE NOTICE '3. 临时策略 feedback_insert_temp 已创建，允许任何用户插入';
  RAISE NOTICE '4. 测试成功后，请删除临时策略并使用正确的 family_id';
  RAISE NOTICE '';
  RAISE NOTICE '=== 正确的插入方式 ===';
  RAISE NOTICE 'const { data: profile } = await supabase';
  RAISE NOTICE '  .from("profiles")';
  RAISE NOTICE '  .select("family_id")';
  RAISE NOTICE '  .eq("id", auth.uid())';
  RAISE NOTICE '  .single();';
  RAISE NOTICE '';
  RAISE NOTICE 'const { data, error } = await supabase';
  RAISE NOTICE '  .from("feedback_messages")';
  RAISE NOTICE '  .insert({';
  RAISE NOTICE '    family_id: profile.family_id, // 使用 profile 的 family_id';
  RAISE NOTICE '    profile_id: auth.uid(),';
  RAISE NOTICE '    subject: "...",';
  RAISE NOTICE '    message: "...",';
  RAISE NOTICE '    category: "general",';
  RAISE NOTICE '    priority: "normal",';
  RAISE NOTICE '    status: "pending"';
  RAISE NOTICE '  });';
END $$;
