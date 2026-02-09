-- ==========================================
-- ⚠️ 危险操作：清空除指定家庭 ID 外的所有数据
-- 保留的 Family ID: 79ed05a1-e0e5-4d8c-9a79-d8756c488171
-- ==========================================

BEGIN;

-- 1. 清理子表 (按依赖顺序反向清理)

-- 消息记录
DELETE FROM messages WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 交易流水 (Transactions)
DELETE FROM transactions WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 消息通知 (Messages)
DELETE FROM messages WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 任务 (Tasks)
DELETE FROM tasks WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 奖励 (Rewards)
DELETE FROM rewards WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 家庭成员关联 (Family Members)
DELETE FROM family_members WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 2. 清理核心表

-- 成员档案 (Profiles)
DELETE FROM profiles WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 家庭 (Families)
DELETE FROM families WHERE id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 3. 提交更改
COMMIT;

-- 4. 验证 (可选)
-- SELECT count(*) FROM families;
