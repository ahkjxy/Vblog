-- ============================================
-- 添加获取所有徽章进度的函数
-- 用于在前端显示所有徽章（包括已获得和未获得的）
-- ============================================

BEGIN;

-- 创建函数：获取所有徽章及其进度（包括已获得和未获得的）
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
      WHEN 'tasks' THEN v_task_count
      WHEN 'days' THEN v_streak_days
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
GRANT EXECUTE ON FUNCTION get_all_badges_progress(UUID) TO authenticated;

-- 添加注释
COMMENT ON FUNCTION get_all_badges_progress IS '获取所有徽章及其进度（包括已获得和未获得的）';

COMMIT;

-- ============================================
-- 验证函数创建成功
-- ============================================
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_all_badges_progress';
