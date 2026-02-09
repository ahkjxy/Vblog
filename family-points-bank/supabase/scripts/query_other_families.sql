-- 查询所有 family_id 不是 79ed05a1-e0e5-4d8c-9a79-d8756c488171 的数据

-- 1. Families (家庭表)
SELECT * FROM families WHERE id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 2. Profiles (成员表)
SELECT * FROM profiles WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 3. Tasks (任务表)
SELECT * FROM tasks WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 4. Rewards (奖励表)
SELECT * FROM rewards WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 5. Transactions (流水表)
SELECT * FROM transactions WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 6. Family Members (家庭成员关联表)
SELECT * FROM family_members WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

-- 7. Messages (消息通知表)
-- 7. Messages (消息记录表)
SELECT * FROM messages WHERE family_id != '79ed05a1-e0e5-4d8c-9a79-d8756c488171';
