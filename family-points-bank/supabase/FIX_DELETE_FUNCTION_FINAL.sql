-- =====================================================
-- 修复删除家庭数据函数 - 最终版本
-- 任何家庭的家长都可以删除自己的家庭
-- =====================================================

-- 删除旧函数
DROP FUNCTION IF EXISTS delete_family_data(UUID);

-- 重新创建函数
CREATE OR REPLACE FUNCTION delete_family_data(target_family_id UUID)
RETURNS JSON AS $$
DECLARE
  deleted_counts JSON;
  current_user_family_id UUID;
  current_user_role TEXT;
  profiles_count INT := 0;
  transactions_count INT := 0;
  tasks_count INT := 0;
  rewards_count INT := 0;
  messages_count INT := 0;
  feedback_count INT := 0;
  feedback_replies_count INT := 0;
  badges_count INT := 0;
BEGIN
  -- 获取当前用户的家庭 ID 和角色
  SELECT family_id, role INTO current_user_family_id, current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- 调试信息
  RAISE NOTICE 'Current user family_id: %, role: %', current_user_family_id, current_user_role;
  RAISE NOTICE 'Target family_id: %', target_family_id;
  
  -- 验证用户是否存在
  IF current_user_family_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found or has no family';
  END IF;
  
  -- 验证是否是自己的家庭
  IF current_user_family_id != target_family_id THEN
    RAISE EXCEPTION 'You can only delete your own family data. Your family_id: %, Target family_id: %', 
      current_user_family_id, target_family_id;
  END IF;
  
  -- 验证是否是家长（admin）
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only family admin can delete family data. Your role: %', current_user_role;
  END IF;
  
  RAISE NOTICE '✅ Permission check passed. Starting deletion...';
  
  -- 开始删除数据（按依赖关系顺序）
  
  -- 1. 删除 feedback_replies（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback_replies') THEN
    DELETE FROM feedback_replies 
    WHERE feedback_id IN (
      SELECT id FROM feedback_messages WHERE family_id = target_family_id
    );
    GET DIAGNOSTICS feedback_replies_count = ROW_COUNT;
    RAISE NOTICE '✅ Deleted feedback_replies: %', feedback_replies_count;
  END IF;
  
  -- 2. 删除 feedback_messages（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback_messages') THEN
    DELETE FROM feedback_messages WHERE family_id = target_family_id;
    GET DIAGNOSTICS feedback_count = ROW_COUNT;
    RAISE NOTICE '✅ Deleted feedback_messages: %', feedback_count;
  END IF;
  
  -- 3. 删除 messages（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DELETE FROM messages WHERE family_id = target_family_id;
    GET DIAGNOSTICS messages_count = ROW_COUNT;
    RAISE NOTICE '✅ Deleted messages: %', messages_count;
  END IF;
  
  -- 4. 删除 badge_progress（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badge_progress') THEN
    DELETE FROM badge_progress 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE family_id = target_family_id
    );
    GET DIAGNOSTICS badges_count = ROW_COUNT;
    RAISE NOTICE '✅ Deleted badge_progress: %', badges_count;
  END IF;
  
  -- 5. 删除 transactions
  DELETE FROM transactions WHERE family_id = target_family_id;
  GET DIAGNOSTICS transactions_count = ROW_COUNT;
  RAISE NOTICE '✅ Deleted transactions: %', transactions_count;
  
  -- 6. 删除 tasks
  DELETE FROM tasks WHERE family_id = target_family_id;
  GET DIAGNOSTICS tasks_count = ROW_COUNT;
  RAISE NOTICE '✅ Deleted tasks: %', tasks_count;
  
  -- 7. 删除 rewards
  DELETE FROM rewards WHERE family_id = target_family_id;
  GET DIAGNOSTICS rewards_count = ROW_COUNT;
  RAISE NOTICE '✅ Deleted rewards: %', rewards_count;
  
  -- 8. 删除 profiles
  DELETE FROM profiles WHERE family_id = target_family_id;
  GET DIAGNOSTICS profiles_count = ROW_COUNT;
  RAISE NOTICE '✅ Deleted profiles: %', profiles_count;
  
  -- 9. 最后删除 family 记录
  DELETE FROM families WHERE id = target_family_id;
  RAISE NOTICE '✅ Deleted family record';
  
  -- 构建返回的统计信息
  deleted_counts := json_build_object(
    'success', true,
    'family_id', target_family_id,
    'deleted', json_build_object(
      'profiles', profiles_count,
      'transactions', transactions_count,
      'tasks', tasks_count,
      'rewards', rewards_count,
      'messages', messages_count,
      'feedback_messages', feedback_count,
      'feedback_replies', feedback_replies_count,
      'badges', badges_count
    ),
    'message', 'Family data deleted successfully'
  );
  
  RETURN deleted_counts;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete family data: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加函数注释
COMMENT ON FUNCTION delete_family_data(UUID) IS '删除指定家庭的所有数据，仅家长可执行';

-- 验证函数已创建
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_family_data') 
    THEN '✅ delete_family_data function created successfully'
    ELSE '❌ Failed to create delete_family_data function'
  END as status;

-- =====================================================
-- 测试调用（使用你的家庭 ID）
-- =====================================================

-- SELECT delete_family_data('e3ff47c0-03fa-443f-823f-833c76398f0d');
