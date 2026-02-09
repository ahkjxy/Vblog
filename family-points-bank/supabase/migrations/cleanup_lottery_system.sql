-- ============================================
-- 清理抽奖系统 - 删除所有抽奖相关的表和函数
-- 执行此脚本将完全移除抽奖功能
-- ============================================

BEGIN;

-- 1. 删除抽奖相关函数
DROP FUNCTION IF EXISTS notify_lottery_win(UUID, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS lottery_from_badge(TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS lottery_from_exchange(TEXT, UUID);
DROP FUNCTION IF EXISTS get_lottery_points();
DROP FUNCTION IF EXISTS get_lottery_stats(TEXT);
DROP FUNCTION IF EXISTS get_pending_badge_lotteries(TEXT);
DROP FUNCTION IF EXISTS check_daily_lottery_limit(TEXT);
DROP FUNCTION IF EXISTS cleanup_old_daily_limits();

-- 2. 删除抽奖记录表
DROP TABLE IF EXISTS lottery_records CASCADE;

-- 3. 删除每日限制表
DROP TABLE IF EXISTS daily_lottery_limits CASCADE;

-- 4. 清理 messages 表中的抽奖系统消息（可选）
-- 如果你想保留历史消息，可以注释掉这一行
DELETE FROM messages WHERE content LIKE '[系统] %抽取%' OR content LIKE '[系统] %转盘%';

COMMIT;

-- ============================================
-- 执行完成后的验证
-- ============================================

-- 验证表已删除
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('lottery_records', 'daily_lottery_limits');
-- 应该返回空结果

-- 验证函数已删除
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%lottery%';
-- 应该返回空结果
