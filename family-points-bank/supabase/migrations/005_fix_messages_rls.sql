-- 修复消息表结构和 RLS 策略 compatibility 迁移脚本

BEGIN;

-- 1. 尝试将 IDs 转换为 UUID 类型
-- 注意：如果现有数据包含非 UUID 格式的字符串，这将失败。
-- 如果是这种情况，我们可能需要清空表或采取更复杂的迁移。
-- 假设现有数据是干净的或表是空的。

ALTER TABLE public.messages 
  ALTER COLUMN family_id TYPE UUID USING family_id::uuid,
  ALTER COLUMN sender_id TYPE UUID USING sender_id::uuid;

-- 2. 修复或重建 RLS 策略
-- 原有的策略引用了不存在的 families 表列或逻辑错误。
-- 我们将其替换为标准的基于 family_members 的检查。

DROP POLICY IF EXISTS "Allow family members to read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow family members to insert messages" ON public.messages;

-- 新的读取策略：允许用户读取其所属家庭的消息
CREATE POLICY "Allow family members to read messages"
ON public.messages
FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
  )
);

-- 新的插入策略：允许用户向其所属家庭发送消息
-- 同时验证 sender_id 是否属于该用户管理的 profile（可选，这里简化为家庭成员检查）
CREATE POLICY "Allow family members to insert messages"
ON public.messages
FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
  )
);

-- 3. 确保必要的默认值
-- 如果 id 和 created_at 还没有默认值，这里进行加固
ALTER TABLE public.messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.messages ALTER COLUMN created_at SET DEFAULT now();

COMMIT;
