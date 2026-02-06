-- ============================================
-- 修复 "lottery_from_exchange" 函数重载歧义
-- ============================================
-- 之前可能存在 TEXT 和 UUID 两个版本的 profile_id 参数，导致调用时歧义。
-- 此脚本将统一使用 TEXT 版本（兼容性最好，避免前端传参问题），并删除所有旧版本。
-- 修复：移除了无效的 points_won 检查约束
-- ============================================

BEGIN;

-- 0. 尝试移除可能存在的错误约束 (如果表已存在)
-- 这一步是为了防止之前可能创建了不合理的约束 'lottery_records_points_won_check'
DO $$ BEGIN
  ALTER TABLE lottery_records DROP CONSTRAINT IF EXISTS lottery_records_points_won_check;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 1. 删除所有可能存在的重载版本
DROP FUNCTION IF EXISTS lottery_from_exchange(TEXT, UUID);
DROP FUNCTION IF EXISTS lottery_from_exchange(UUID, UUID);

DROP FUNCTION IF EXISTS lottery_from_badge(TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS lottery_from_badge(UUID, TEXT, UUID);

-- 2. 重新创建 lottery_from_exchange (统一使用 TEXT)
-- 为什么选 TEXT? 因为前端有时传来的是 string，Postgres 自动转换有时会有坑，显式 TEXT 接收再内部转 UUID 更稳健。
-- 且 006 迁移中使用的是 TEXT，我们保持一致但清理掉 UUID 版本。

CREATE OR REPLACE FUNCTION lottery_from_exchange(p_profile_id TEXT, p_family_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_points INTEGER; v_daily_count INTEGER;
BEGIN
  -- 检查余额 (profiles.id 是 UUID，必须强转比较)
  IF (SELECT balance FROM profiles WHERE id = p_profile_id::uuid) < 10 THEN 
    RAISE EXCEPTION '元气值不足'; 
  END IF;

  -- 检查今日限制 (使用了 TEXT 比较)
  SELECT COUNT(*)::INTEGER INTO v_daily_count 
  FROM lottery_records 
  WHERE profile_id = p_profile_id 
  AND source = 'exchange' 
  AND (timezone('Asia/Shanghai', created_at))::DATE = (timezone('Asia/Shanghai', NOW()))::DATE;
  
  IF v_daily_count >= 3 THEN 
    RAISE EXCEPTION '今日兑换次数超限'; 
  END IF;

  -- 扣除积分 (transactions.profile_id 是 UUID，必须强转)
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp) 
  VALUES (p_profile_id::uuid, p_family_id, 'exchange', -10, '开启转盘', NOW());
  
  UPDATE profiles SET balance = balance - 10 WHERE id = p_profile_id::uuid;

  -- 抽奖
  v_points := get_lottery_points();
  
  -- 记录抽奖 (lottery_records 保持传入 TEXT)
  INSERT INTO lottery_records (profile_id, family_id, source, badge_id, points_won) 
  VALUES (p_profile_id, p_family_id, 'exchange', NULL, v_points);
  
  -- 发放奖励 (transactions 必须 UUID)
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp) 
  VALUES (p_profile_id::uuid, p_family_id, 'lottery', v_points, '转盘中奖', NOW());
  
  UPDATE profiles SET balance = balance + v_points WHERE id = p_profile_id::uuid;

  -- 发送通知
  PERFORM notify_lottery_win(p_family_id, p_profile_id, v_points, 'exchange');
  
  RETURN v_points;
END; $$;

-- 3. 重新创建 lottery_from_badge (统一使用 TEXT)
CREATE OR REPLACE FUNCTION lottery_from_badge(p_profile_id TEXT, p_badge_id TEXT, p_family_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_points INTEGER;
BEGIN
  -- 检查是否已领 (lottery_records 使用 TEXT 比较)
  IF EXISTS (SELECT 1 FROM lottery_records WHERE profile_id = p_profile_id AND badge_id = p_badge_id AND source = 'badge') THEN
    RAISE EXCEPTION '该徽章已经领取过奖项';
  END IF;

  v_points := get_lottery_points();

  -- 记录与发放
  INSERT INTO lottery_records (profile_id, family_id, source, badge_id, points_won) 
  VALUES (p_profile_id, p_family_id, 'badge', p_badge_id, v_points);
  
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp) 
  VALUES (p_profile_id::uuid, p_family_id, 'lottery', v_points, '徽章特别奖励', NOW());
  
  UPDATE profiles SET balance = balance + v_points WHERE id = p_profile_id::uuid;
  
  PERFORM notify_lottery_win(p_family_id, p_profile_id, v_points, 'badge');
  
  RETURN v_points;
END; $$;

-- 权限
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

COMMIT;
