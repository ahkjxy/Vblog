-- ============================================
-- 修复徽章函数的问题
-- 1. 修复 grant_eligible_badges 函数，添加 p_family_id 参数
-- 2. 修复 get_available_badges 函数，正确处理 timestamp 字段（BIGINT 毫秒时间戳）
-- 3. 添加对特殊徽章的支持（first_redeem, generous 等）
-- 4. 修复 profiles 表字段名：使用 balance 而不是 points
-- ============================================

BEGIN;

-- ============================================
-- 1. 修复 get_available_badges 函数
-- ============================================
CREATE OR REPLACE FUNCTION get_available_badges(p_profile_id UUID)
RETURNS TABLE (
  condition TEXT,
  badge_type TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  progress INTEGER,
  requirement INTEGER
) AS $$
DECLARE
  v_family_id UUID;
  v_total_earned INTEGER;
  v_task_count INTEGER;
  v_learning_count INTEGER;
  v_chores_count INTEGER;
  v_streak_days INTEGER;
  v_transfer_count INTEGER;
  v_redeem_count INTEGER;
  v_current_balance INTEGER;
BEGIN
  -- 获取家庭ID
  SELECT family_id INTO v_family_id FROM profiles WHERE id = p_profile_id;
  
  -- 计算各项统计
  SELECT 
    COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.points ELSE 0 END), 0),
    COUNT(CASE WHEN t.type = 'earn' THEN 1 END),
    COUNT(CASE WHEN t.type = 'earn' AND t.title LIKE '%学习%' THEN 1 END),
    COUNT(CASE WHEN t.type = 'earn' AND t.title LIKE '%家务%' THEN 1 END),
    COUNT(CASE WHEN t.type = 'transfer' THEN 1 END),
    COUNT(CASE WHEN t.type = 'redeem' THEN 1 END)
  INTO v_total_earned, v_task_count, v_learning_count, v_chores_count, v_transfer_count, v_redeem_count
  FROM transactions t
  WHERE t.profile_id = p_profile_id;
  
  -- 获取当前余额（使用 balance 字段）
  SELECT COALESCE(balance, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;
  
  -- 计算连续天数（使用 timestamp 字段，假设是 BIGINT 毫秒时间戳）
  BEGIN
    WITH daily_tasks AS (
      SELECT DISTINCT 
        DATE(to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0)) as task_date
      FROM transactions
      WHERE profile_id = p_profile_id 
      AND type = 'earn'
      AND timestamp IS NOT NULL
      ORDER BY task_date DESC
    ),
    streak AS (
      SELECT 
        task_date,
        task_date - (ROW_NUMBER() OVER (ORDER BY task_date DESC))::INTEGER * INTERVAL '1 day' as grp
      FROM daily_tasks
    )
    SELECT COALESCE(COUNT(*), 0) INTO v_streak_days
    FROM streak
    WHERE grp = (SELECT grp FROM streak ORDER BY task_date DESC LIMIT 1);
  EXCEPTION
    WHEN OTHERS THEN
      -- 如果转换失败，设置为 0
      v_streak_days := 0;
  END;
  
  -- 返回可获得的徽章（已达成条件但未领取的）
  RETURN QUERY
  SELECT 
    bd.condition,
    bd.type as badge_type,
    bd.title,
    bd.description,
    bd.icon,
    CASE bd.requirement_type
      WHEN 'points' THEN v_total_earned
      WHEN 'tasks' THEN 
        CASE bd.condition
          WHEN 'learning_50' THEN v_learning_count
          WHEN 'learning_100' THEN v_learning_count
          WHEN 'chores_50' THEN v_chores_count
          WHEN 'chores_100' THEN v_chores_count
          ELSE v_task_count
        END
      WHEN 'days' THEN v_streak_days
      WHEN 'custom' THEN
        CASE bd.condition
          WHEN 'generous' THEN v_transfer_count
          WHEN 'first_redeem' THEN v_redeem_count
          WHEN 'saver' THEN v_current_balance
          ELSE 0
        END
      ELSE 0
    END as progress,
    bd.requirement_value as requirement
  FROM badge_definitions bd
  WHERE NOT EXISTS (
    SELECT 1 FROM badges b 
    WHERE b.profile_id = p_profile_id 
    AND b.condition = bd.condition
  )
  AND (
    (bd.requirement_type = 'points' AND v_total_earned >= bd.requirement_value) OR
    (bd.requirement_type = 'tasks' AND 
      CASE bd.condition
        WHEN 'learning_50' THEN v_learning_count >= bd.requirement_value
        WHEN 'learning_100' THEN v_learning_count >= bd.requirement_value
        WHEN 'chores_50' THEN v_chores_count >= bd.requirement_value
        WHEN 'chores_100' THEN v_chores_count >= bd.requirement_value
        ELSE v_task_count >= bd.requirement_value
      END
    ) OR
    (bd.requirement_type = 'days' AND v_streak_days >= bd.requirement_value) OR
    (bd.requirement_type = 'custom' AND
      CASE bd.condition
        WHEN 'generous' THEN v_transfer_count >= bd.requirement_value
        WHEN 'first_redeem' THEN v_redeem_count >= bd.requirement_value
        WHEN 'saver' THEN v_current_balance >= bd.requirement_value
        ELSE FALSE
      END
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. 修复 grant_eligible_badges 函数
-- ============================================
CREATE OR REPLACE FUNCTION grant_eligible_badges(p_profile_id UUID, p_family_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_family_id UUID;
  v_count INTEGER := 0;
  badge_record RECORD;
BEGIN
  -- 使用传入的 family_id 或从 profiles 表获取
  IF p_family_id IS NOT NULL THEN
    v_family_id := p_family_id;
  ELSE
    SELECT family_id INTO v_family_id FROM profiles WHERE id = p_profile_id;
  END IF;
  
  FOR badge_record IN 
    SELECT * FROM get_available_badges(p_profile_id)
  LOOP
    INSERT INTO badges (profile_id, family_id, type, title, description, icon, condition)
    VALUES (
      p_profile_id,
      v_family_id,
      badge_record.badge_type,
      badge_record.title,
      badge_record.description,
      badge_record.icon,
      badge_record.condition
    )
    ON CONFLICT (profile_id, condition) DO NOTHING;
    
    -- 只有在实际插入时才计数
    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. 更新 get_all_badges_progress 函数
-- ============================================
CREATE OR REPLACE FUNCTION get_all_badges_progress(p_profile_id UUID)
RETURNS TABLE (
  condition TEXT,
  badge_type TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  progress INTEGER,
  requirement INTEGER,
  is_earned BOOLEAN,
  earned_at TIMESTAMPTZ
) AS $$
DECLARE
  v_family_id UUID;
  v_total_earned INTEGER;
  v_task_count INTEGER;
  v_learning_count INTEGER;
  v_chores_count INTEGER;
  v_streak_days INTEGER;
  v_transfer_count INTEGER;
  v_redeem_count INTEGER;
  v_current_balance INTEGER;
BEGIN
  -- 获取家庭ID
  SELECT family_id INTO v_family_id FROM profiles WHERE id = p_profile_id;
  
  -- 计算各项统计
  SELECT 
    COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.points ELSE 0 END), 0),
    COUNT(CASE WHEN t.type = 'earn' THEN 1 END),
    COUNT(CASE WHEN t.type = 'earn' AND t.title LIKE '%学习%' THEN 1 END),
    COUNT(CASE WHEN t.type = 'earn' AND t.title LIKE '%家务%' THEN 1 END),
    COUNT(CASE WHEN t.type = 'transfer' THEN 1 END),
    COUNT(CASE WHEN t.type = 'redeem' THEN 1 END)
  INTO v_total_earned, v_task_count, v_learning_count, v_chores_count, v_transfer_count, v_redeem_count
  FROM transactions t
  WHERE t.profile_id = p_profile_id;
  
  -- 获取当前余额（使用 balance 字段）
  SELECT COALESCE(balance, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;
  
  -- 计算连续天数（使用 timestamp 字段，假设是 BIGINT 毫秒时间戳）
  BEGIN
    WITH daily_tasks AS (
      SELECT DISTINCT 
        DATE(to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0)) as task_date
      FROM transactions
      WHERE profile_id = p_profile_id 
      AND type = 'earn'
      AND timestamp IS NOT NULL
      ORDER BY task_date DESC
    ),
    streak AS (
      SELECT 
        task_date,
        task_date - (ROW_NUMBER() OVER (ORDER BY task_date DESC))::INTEGER * INTERVAL '1 day' as grp
      FROM daily_tasks
    )
    SELECT COALESCE(COUNT(*), 0) INTO v_streak_days
    FROM streak
    WHERE grp = (SELECT grp FROM streak ORDER BY task_date DESC LIMIT 1);
  EXCEPTION
    WHEN OTHERS THEN
      -- 如果转换失败，设置为 0
      v_streak_days := 0;
  END;
  
  -- 返回所有徽章及其进度
  RETURN QUERY
  SELECT 
    bd.condition,
    bd.type as badge_type,
    bd.title,
    bd.description,
    bd.icon,
    CASE bd.requirement_type
      WHEN 'points' THEN v_total_earned
      WHEN 'tasks' THEN 
        CASE bd.condition
          WHEN 'learning_50' THEN v_learning_count
          WHEN 'learning_100' THEN v_learning_count
          WHEN 'chores_50' THEN v_chores_count
          WHEN 'chores_100' THEN v_chores_count
          ELSE v_task_count
        END
      WHEN 'days' THEN v_streak_days
      WHEN 'custom' THEN
        CASE bd.condition
          WHEN 'generous' THEN v_transfer_count
          WHEN 'first_redeem' THEN v_redeem_count
          WHEN 'saver' THEN v_current_balance
          ELSE 0
        END
      ELSE 0
    END as progress,
    bd.requirement_value as requirement,
    EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.profile_id = p_profile_id 
      AND b.condition = bd.condition
    ) as is_earned,
    (
      SELECT b.earned_at FROM badges b 
      WHERE b.profile_id = p_profile_id 
      AND b.condition = bd.condition
      LIMIT 1
    ) as earned_at
  FROM badge_definitions bd
  ORDER BY 
    CASE bd.requirement_type
      WHEN 'days' THEN 1
      WHEN 'tasks' THEN 2
      WHEN 'points' THEN 3
      ELSE 4
    END,
    bd.requirement_value;
END;
$$ LANGUAGE plpgsql;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION get_available_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_eligible_badges(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_badges_progress(UUID) TO authenticated;

-- 添加注释
COMMENT ON FUNCTION get_available_badges IS '获取成员可获得但未获得的徽章列表（已修复 timestamp 处理和特殊徽章，使用 balance 字段）';
COMMENT ON FUNCTION grant_eligible_badges IS '批量授予成员符合条件的徽章（已添加 p_family_id 参数）';
COMMENT ON FUNCTION get_all_badges_progress IS '获取所有徽章及其进度（已修复 timestamp 处理和特殊徽章，使用 balance 字段）';

COMMIT;

-- ============================================
-- 验证函数创建成功
-- ============================================
SELECT 
  routine_name, 
  routine_type,
  CASE 
    WHEN routine_name = 'get_available_badges' THEN '✅ 已修复 (使用 balance 字段)'
    WHEN routine_name = 'grant_eligible_badges' THEN '✅ 已添加 p_family_id 参数'
    WHEN routine_name = 'get_all_badges_progress' THEN '✅ 已修复 (使用 balance 字段)'
    ELSE '✅'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_available_badges', 'grant_eligible_badges', 'get_all_badges_progress')
ORDER BY routine_name;
