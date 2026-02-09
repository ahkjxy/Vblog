-- =====================================================
-- 快速创建删除家庭数据函数
-- 直接在 Supabase SQL Editor 中执行此文件
-- =====================================================

-- 先删除旧函数（如果存在）
DROP FUNCTION IF EXISTS delete_family_data(UUID);
DROP FUNCTION IF EXISTS get_family_data_stats(UUID);

-- 创建删除家庭数据的函数
CREATE OR REPLACE FUNCTION delete_family_data(target_family_id UUID)
RETURNS JSON AS $$
DECLARE
  deleted_counts JSON;
  current_user_family_id UUID;
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
  SELECT family_id INTO current_user_family_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- 验证权限：必须是家长（admin）才能删除家庭数据
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND family_id = target_family_id
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only family admin can delete family data';
  END IF;
  
  -- 验证是否是自己的家庭
  IF current_user_family_id != target_family_id THEN
    RAISE EXCEPTION 'You can only delete your own family data';
  END IF;
  
  -- 开始删除数据（按依赖关系顺序）
  
  -- 1. 删除 feedback_replies（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback_replies') THEN
    DELETE FROM feedback_replies 
    WHERE feedback_id IN (
      SELECT id FROM feedback_messages WHERE family_id = target_family_id
    );
    GET DIAGNOSTICS feedback_replies_count = ROW_COUNT;
  END IF;
  
  -- 2. 删除 feedback_messages（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback_messages') THEN
    DELETE FROM feedback_messages WHERE family_id = target_family_id;
    GET DIAGNOSTICS feedback_count = ROW_COUNT;
  END IF;
  
  -- 3. 删除 messages（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DELETE FROM messages WHERE family_id = target_family_id;
    GET DIAGNOSTICS messages_count = ROW_COUNT;
  END IF;
  
  -- 4. 删除 badge_progress（如果表存在）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badge_progress') THEN
    DELETE FROM badge_progress 
    WHERE profile_id IN (
      SELECT id FROM profiles WHERE family_id = target_family_id
    );
    GET DIAGNOSTICS badges_count = ROW_COUNT;
  END IF;
  
  -- 5. 删除 transactions
  DELETE FROM transactions WHERE family_id = target_family_id;
  GET DIAGNOSTICS transactions_count = ROW_COUNT;
  
  -- 6. 删除 tasks
  DELETE FROM tasks WHERE family_id = target_family_id;
  GET DIAGNOSTICS tasks_count = ROW_COUNT;
  
  -- 7. 删除 rewards
  DELETE FROM rewards WHERE family_id = target_family_id;
  GET DIAGNOSTICS rewards_count = ROW_COUNT;
  
  -- 8. 删除 profiles
  DELETE FROM profiles WHERE family_id = target_family_id;
  GET DIAGNOSTICS profiles_count = ROW_COUNT;
  
  -- 9. 最后删除 family 记录
  DELETE FROM families WHERE id = target_family_id;
  
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

-- 创建查看家庭数据统计的函数
CREATE OR REPLACE FUNCTION get_family_data_stats(target_family_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
  messages_count INT := 0;
  feedback_messages_count INT := 0;
  feedback_replies_count INT := 0;
  badges_count INT := 0;
BEGIN
  -- 检查表是否存在并统计
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    SELECT COUNT(*) INTO messages_count FROM messages WHERE family_id = target_family_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback_messages') THEN
    SELECT COUNT(*) INTO feedback_messages_count FROM feedback_messages WHERE family_id = target_family_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback_replies') THEN
    SELECT COUNT(*) INTO feedback_replies_count 
    FROM feedback_replies 
    WHERE feedback_id IN (SELECT id FROM feedback_messages WHERE family_id = target_family_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badge_progress') THEN
    SELECT COUNT(*) INTO badges_count 
    FROM badge_progress 
    WHERE profile_id IN (SELECT id FROM profiles WHERE family_id = target_family_id);
  END IF;
  
  SELECT json_build_object(
    'family_id', target_family_id,
    'profiles_count', (SELECT COUNT(*) FROM profiles WHERE family_id = target_family_id),
    'transactions_count', (SELECT COUNT(*) FROM transactions WHERE family_id = target_family_id),
    'tasks_count', (SELECT COUNT(*) FROM tasks WHERE family_id = target_family_id),
    'rewards_count', (SELECT COUNT(*) FROM rewards WHERE family_id = target_family_id),
    'messages_count', messages_count,
    'feedback_messages_count', feedback_messages_count,
    'feedback_replies_count', feedback_replies_count,
    'badges_count', badges_count
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证函数已创建
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_family_data') 
    THEN '✅ delete_family_data function created'
    ELSE '❌ delete_family_data function NOT created'
  END as delete_function_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_family_data_stats') 
    THEN '✅ get_family_data_stats function created'
    ELSE '❌ get_family_data_stats function NOT created'
  END as stats_function_status;

-- =====================================================
-- 使用示例
-- =====================================================

-- 1. 查看家庭数据统计（删除前）
-- SELECT get_family_data_stats('e3ff47c0-03fa-443f-823f-833c76398f0d');

-- 2. 删除家庭数据（需要管理员权限）
-- SELECT delete_family_data('e3ff47c0-03fa-443f-823f-833c76398f0d');
