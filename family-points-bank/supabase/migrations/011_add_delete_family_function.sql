-- =====================================================
-- 删除家庭数据函数 (Delete Family Data Function)
-- =====================================================
-- 功能说明：
-- 1. 删除指定家庭的所有数据
-- 2. 包括：profiles、transactions、tasks、rewards、messages、feedback 等
-- 3. 需要管理员权限才能执行
-- 4. 使用级联删除确保数据完整性
-- =====================================================

-- 创建删除家庭数据的函数
CREATE OR REPLACE FUNCTION delete_family_data(target_family_id UUID)
RETURNS JSON AS $$
DECLARE
  deleted_counts JSON;
  current_user_family_id UUID;
  profiles_count INT;
  transactions_count INT;
  tasks_count INT;
  rewards_count INT;
  messages_count INT;
  feedback_count INT;
  badges_count INT;
BEGIN
  -- 获取当前用户的家庭 ID
  SELECT family_id INTO current_user_family_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- 验证权限：只能删除自己家庭的数据
  IF current_user_family_id != target_family_id THEN
    RAISE EXCEPTION 'You can only delete your own family data';
  END IF;
  
  -- 验证是否是管理员
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND family_id = target_family_id
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admin can delete family data';
  END IF;
  
  -- 开始删除数据（按依赖关系顺序）
  
  -- 1. 删除 feedback（如果存在）
  DELETE FROM feedback WHERE family_id = target_family_id;
  GET DIAGNOSTICS feedback_count = ROW_COUNT;
  
  -- 2. 删除 messages（如果存在）
  DELETE FROM messages WHERE family_id = target_family_id;
  GET DIAGNOSTICS messages_count = ROW_COUNT;
  
  -- 3. 删除 badge_progress（如果存在）
  DELETE FROM badge_progress 
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE family_id = target_family_id
  );
  GET DIAGNOSTICS badges_count = ROW_COUNT;
  
  -- 4. 删除 transactions
  DELETE FROM transactions WHERE family_id = target_family_id;
  GET DIAGNOSTICS transactions_count = ROW_COUNT;
  
  -- 5. 删除 tasks
  DELETE FROM tasks WHERE family_id = target_family_id;
  GET DIAGNOSTICS tasks_count = ROW_COUNT;
  
  -- 6. 删除 rewards
  DELETE FROM rewards WHERE family_id = target_family_id;
  GET DIAGNOSTICS rewards_count = ROW_COUNT;
  
  -- 7. 删除 profiles
  DELETE FROM profiles WHERE family_id = target_family_id;
  GET DIAGNOSTICS profiles_count = ROW_COUNT;
  
  -- 8. 最后删除 family 记录
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
      'feedback', feedback_count,
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
COMMENT ON FUNCTION delete_family_data(UUID) IS '删除指定家庭的所有数据，仅管理员可执行';

-- =====================================================
-- 测试查询（不执行删除）
-- =====================================================

-- 查看某个家庭的数据统计
CREATE OR REPLACE FUNCTION get_family_data_stats(target_family_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'family_id', target_family_id,
    'profiles_count', (SELECT COUNT(*) FROM profiles WHERE family_id = target_family_id),
    'transactions_count', (SELECT COUNT(*) FROM transactions WHERE family_id = target_family_id),
    'tasks_count', (SELECT COUNT(*) FROM tasks WHERE family_id = target_family_id),
    'rewards_count', (SELECT COUNT(*) FROM rewards WHERE family_id = target_family_id),
    'messages_count', (SELECT COUNT(*) FROM messages WHERE family_id = target_family_id),
    'feedback_count', (SELECT COUNT(*) FROM feedback WHERE family_id = target_family_id),
    'badges_count', (
      SELECT COUNT(*) FROM badge_progress 
      WHERE profile_id IN (SELECT id FROM profiles WHERE family_id = target_family_id)
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 使用示例
-- =====================================================

-- 1. 查看家庭数据统计（删除前）
-- SELECT get_family_data_stats('your-family-id-here');

-- 2. 删除家庭数据（需要管理员权限）
-- SELECT delete_family_data('your-family-id-here');

-- =====================================================
-- 完成
-- =====================================================

SELECT 'Delete family data function created successfully!' as message;
