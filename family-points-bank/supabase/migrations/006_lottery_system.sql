-- ============================================
-- 抽奖与徽章核心逻辑迁移 (终极修复版 V19)
-- 预期目标: 
-- 1. 为抽奖中奖公告添加 "[系统]" 前缀，解决前端无法识别为系统消息的问题。
-- 2. 彻底解决 "显示为某个人发送" 的视觉残留，确保背景/样式与系统日志完全统一。
-- ============================================

BEGIN;

-- 1. 更新中奖公告函数 (增加 [系统] 前缀)
CREATE OR REPLACE FUNCTION notify_lottery_win(p_family_id UUID, p_profile_id TEXT, p_points INTEGER, p_source TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_name TEXT;
  v_announcement TEXT;
BEGIN
  -- 获取得奖者姓名
  SELECT name INTO v_user_name FROM profiles WHERE id::text = p_profile_id;
  
  -- 构建系统公告内容 (必须包含 [系统] 前缀以便前端识别)
  IF p_source = 'badge' THEN
    v_announcement := '[系统] 🎉 恭喜「' || v_user_name || '」凭借徽章成就，抽取并获得了 ' || p_points || ' 元气能量！';
  ELSE
    v_announcement := '[系统] 🍀 「' || v_user_name || '」参与幸运大转盘，赢得了 ' || p_points || ' 元气能量！';
  END IF;
  
  -- 发送消息 (使用当前用户 ID 满足 UUID 约束)
  INSERT INTO messages (family_id, sender_id, sender_name, content)
  VALUES (p_family_id, p_profile_id::uuid, '系统通知', v_announcement);
END;
$$;

-- 2. 确保核心抽奖函数完备 (保持 V18 逻辑不变，仅为防丢失)
CREATE OR REPLACE FUNCTION lottery_from_badge(p_profile_id TEXT, p_badge_id TEXT, p_family_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_points INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM lottery_records WHERE profile_id = p_profile_id AND badge_id = p_badge_id AND source = 'badge') THEN
    RAISE EXCEPTION '该徽章已经领取过奖项';
  END IF;
  v_points := get_lottery_points();
  INSERT INTO lottery_records (profile_id, family_id, source, badge_id, points_won) VALUES (p_profile_id, p_family_id, 'badge', p_badge_id, v_points);
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp) VALUES (p_profile_id::uuid, p_family_id, 'lottery', v_points, '徽章特别奖励', NOW());
  UPDATE profiles SET balance = balance + v_points WHERE id::text = p_profile_id;
  PERFORM notify_lottery_win(p_family_id, p_profile_id, v_points, 'badge');
  RETURN v_points;
END; $$;

CREATE OR REPLACE FUNCTION lottery_from_exchange(p_profile_id TEXT, p_family_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_points INTEGER; v_daily_count INTEGER;
BEGIN
  IF (SELECT balance FROM profiles WHERE id::text = p_profile_id) < 10 THEN RAISE EXCEPTION '元气值不足'; END IF;
  SELECT COUNT(*)::INTEGER INTO v_daily_count FROM lottery_records WHERE profile_id = p_profile_id AND source = 'exchange' AND (timezone('Asia/Shanghai', created_at))::DATE = (timezone('Asia/Shanghai', NOW()))::DATE;
  IF v_daily_count >= 3 THEN RAISE EXCEPTION '今日兑换次数超限'; END IF;
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp) VALUES (p_profile_id::uuid, p_family_id, 'exchange', -10, '开启转盘', NOW());
  UPDATE profiles SET balance = balance - 10 WHERE id::text = p_profile_id;
  v_points := get_lottery_points();
  INSERT INTO lottery_records (profile_id, family_id, source, badge_id, points_won) VALUES (p_profile_id, p_family_id, 'exchange', NULL, v_points);
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp) VALUES (p_profile_id::uuid, p_family_id, 'lottery', v_points, '转盘中奖', NOW());
  UPDATE profiles SET balance = balance + v_points WHERE id::text = p_profile_id;
  PERFORM notify_lottery_win(p_family_id, p_profile_id, v_points, 'exchange');
  RETURN v_points;
END; $$;

-- 权限设置
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

COMMIT;