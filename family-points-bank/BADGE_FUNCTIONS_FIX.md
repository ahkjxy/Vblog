# 徽章功能修复说明

## 问题描述

用户反馈：已经完成的任务（如"兑换过东西"）对应的徽章仍然显示为未完成状态。

## 根本原因

经过分析，发现了以下几个问题：

### 1. **grant_eligible_badges 函数缺少参数**
前端调用时传递了 `p_family_id` 参数，但函数定义中没有这个参数，导致调用失败。

```typescript
// 前端代码
const { data, error } = await supabase.rpc("grant_eligible_badges", {
  p_profile_id: profile.id,
  p_family_id: familyId, // ❌ 函数定义中没有这个参数
});
```

### 2. **timestamp 字段类型处理错误**
数据库中的 `transactions.timestamp` 是 BIGINT 类型（毫秒时间戳），但函数中使用了 `DATE(timestamp)`，这会导致类型错误。

```sql
-- ❌ 错误的写法
SELECT DISTINCT DATE(timestamp) as task_date
FROM transactions

-- ✅ 正确的写法
SELECT DISTINCT DATE(to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0)) as task_date
FROM transactions
```

### 3. **profiles 表字段名错误** ⚠️ 关键问题
函数中使用了 `profiles.points` 字段，但实际表结构中使用的是 `profiles.balance` 字段。

```sql
-- ❌ 错误：profiles 表没有 points 字段
SELECT COALESCE(points, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;

-- ✅ 正确：应该使用 balance 字段
SELECT COALESCE(balance, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;
```

### 4. **特殊徽章条件未正确处理**
某些徽章（如 `first_redeem`、`generous`、`saver`）的条件检查逻辑不完整：

- `first_redeem`: 需要检查 `redeem` 类型的交易数量
- `generous`: 需要检查 `transfer` 类型的交易数量
- `saver`: 需要检查当前余额

但原函数只计算了这些值，没有在条件判断中使用。

### 5. **学习和家务类徽章未区分**
`learning_50`、`learning_100`、`chores_50`、`chores_100` 这些徽章需要根据任务标题来区分，但原函数统一使用了 `v_task_count`。

## 修复方案

创建了新的迁移文件 `009_fix_badge_functions.sql`，包含以下修复：

### 1. 修复 `grant_eligible_badges` 函数

```sql
CREATE OR REPLACE FUNCTION grant_eligible_badges(
  p_profile_id UUID, 
  p_family_id UUID DEFAULT NULL  -- ✅ 添加可选参数
)
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
  
  -- ... 其余逻辑
END;
$$ LANGUAGE plpgsql;
```

### 2. 修复 `get_available_badges` 函数

```sql
-- ✅ 添加更多统计变量
DECLARE
  v_transfer_count INTEGER;
  v_redeem_count INTEGER;
  v_current_balance INTEGER;
BEGIN
  -- 计算各项统计
  SELECT 
    COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.points ELSE 0 END), 0),
    COUNT(CASE WHEN t.type = 'earn' THEN 1 END),
    COUNT(CASE WHEN t.type = 'earn' AND t.title LIKE '%学习%' THEN 1 END),
    COUNT(CASE WHEN t.type = 'earn' AND t.title LIKE '%家务%' THEN 1 END),
    COUNT(CASE WHEN t.type = 'transfer' THEN 1 END),  -- ✅ 转赠次数
    COUNT(CASE WHEN t.type = 'redeem' THEN 1 END)     -- ✅ 兑换次数
  INTO v_total_earned, v_task_count, v_learning_count, v_chores_count, v_transfer_count, v_redeem_count
  FROM transactions t
  WHERE t.profile_id = p_profile_id;
  
  -- ✅ 获取当前余额
  SELECT COALESCE(points, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;
  
  -- ✅ 修复 timestamp 处理
  WITH daily_tasks AS (
    SELECT DISTINCT 
      DATE(to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0)) as task_date
    FROM transactions
    WHERE profile_id = p_profile_id 
    AND type = 'earn'
    AND timestamp IS NOT NULL
    ORDER BY task_date DESC
  )
  -- ... 其余逻辑
  
  -- ✅ 正确处理特殊徽章条件
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
    -- ✅ 添加完整的条件判断
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
```

### 3. 同步更新 `get_all_badges_progress` 函数

使用相同的逻辑更新了 `get_all_badges_progress` 函数，确保两个函数的行为一致。

## 部署步骤

### 1. 执行数据库迁移

在 Supabase Dashboard 的 SQL Editor 中执行：

```bash
# 打开 Supabase Dashboard
# 进入 SQL Editor
# 粘贴 supabase/migrations/009_fix_badge_functions.sql 的内容
# 点击 Run 执行
```

### 2. 验证修复

执行以下 SQL 验证函数是否正确更新：

```sql
-- 1. 检查函数是否存在
SELECT 
  routine_name, 
  routine_type,
  CASE 
    WHEN routine_name = 'get_available_badges' THEN '✅ 已修复'
    WHEN routine_name = 'grant_eligible_badges' THEN '✅ 已添加 p_family_id 参数'
    WHEN routine_name = 'get_all_badges_progress' THEN '✅ 已修复'
    ELSE '✅'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_available_badges', 'grant_eligible_badges', 'get_all_badges_progress')
ORDER BY routine_name;

-- 2. 测试函数（替换为实际的 profile_id）
SELECT * FROM get_all_badges_progress('your-profile-uuid-here');

-- 3. 测试领取徽章（替换为实际的 profile_id 和 family_id）
SELECT grant_eligible_badges('your-profile-uuid-here', 'your-family-uuid-here');
```

### 3. 清除缓存并测试

```bash
# 清除浏览器缓存
# 刷新页面
# 进入成就中心
# 点击"领取新徽章"按钮
```

## 预期效果

修复后，用户应该能够：

1. ✅ 看到所有已完成条件的徽章显示为"可领取"状态
2. ✅ 成功领取已达成条件的徽章
3. ✅ 正确显示各类徽章的进度：
   - 连续天数徽章（基于实际完成任务的天数）
   - 任务数量徽章（区分学习、家务和总任务）
   - 积分里程碑徽章（基于累计获得的元气值）
   - 特殊徽章（首次兑换、转赠次数、储蓄等）

## 徽章类型说明

### 基础徽章（已正确实现）

| 徽章条件 | 类型 | 标题 | 要求 | 检查逻辑 |
|---------|------|------|------|---------|
| `streak_3` | 连续 | 三日坚持 | 连续3天 | ✅ 已修复 timestamp 处理 |
| `streak_7` | 连续 | 七日坚持 | 连续7天 | ✅ 已修复 timestamp 处理 |
| `tasks_10` | 成就 | 初出茅庐 | 完成10个任务 | ✅ 正确统计 |
| `tasks_50` | 成就 | 勤奋之星 | 完成50个任务 | ✅ 正确统计 |
| `total_50` | 里程碑 | 初露锋芒 | 累计50元气值 | ✅ 正确统计 |
| `total_100` | 里程碑 | 百分成就 | 累计100元气值 | ✅ 正确统计 |
| `total_500` | 里程碑 | 元气大师 | 累计500元气值 | ✅ 正确统计 |
| `total_1000` | 里程碑 | 元气传奇 | 累计1000元气值 | ✅ 正确统计 |

### 特殊徽章（本次修复）

| 徽章条件 | 类型 | 标题 | 要求 | 检查逻辑 |
|---------|------|------|------|---------|
| `first_redeem` | 特殊 | 首次兑换 | 完成1次兑换 | ✅ 已添加 redeem 计数 |
| `generous` | 特殊 | 慷慨之心 | 转赠10次 | ✅ 已添加 transfer 计数 |
| `saver` | 特殊 | 储蓄达人 | 余额达到100 | ✅ 已添加余额检查 |
| `learning_50` | 成就 | 学习标兵 | 完成50个学习任务 | ✅ 已区分学习任务 |
| `learning_100` | 成就 | 学霸 | 完成100个学习任务 | ✅ 已区分学习任务 |
| `chores_50` | 成就 | 家务小能手 | 完成50个家务任务 | ✅ 已区分家务任务 |
| `chores_100` | 成就 | 家务达人 | 完成100个家务任务 | ✅ 已区分家务任务 |

### 未实现的特殊徽章（需要额外逻辑）

以下徽章需要更复杂的逻辑，暂未实现：

- `perfect_week`: 一周内每天都完成任务（需要检查连续7天）
- `early_bird`: 连续7天早上8点前完成任务（需要检查时间）
- `night_owl`: 连续7天晚上完成作业（需要检查时间）
- `zero_penalty`: 连续30天无违规记录（需要违规记录表）
- `wishlist_approved`: 愿望清单被批准（需要愿望清单功能）

## 故障排查

### 问题1: 函数调用失败

**症状**: 点击"领取新徽章"按钮后显示错误

**解决方案**:
1. 检查是否执行了迁移文件
2. 验证函数是否存在：`SELECT * FROM information_schema.routines WHERE routine_name = 'grant_eligible_badges'`
3. 检查函数参数：应该有 `p_profile_id UUID` 和 `p_family_id UUID DEFAULT NULL`

### 问题2: 徽章进度不正确

**症状**: 已完成的任务仍显示为未完成

**解决方案**:
1. 检查 transactions 表的数据：
   ```sql
   SELECT type, COUNT(*) 
   FROM transactions 
   WHERE profile_id = 'your-profile-uuid' 
   GROUP BY type;
   ```
2. 手动测试函数：
   ```sql
   SELECT * FROM get_all_badges_progress('your-profile-uuid');
   ```
3. 检查 badge_definitions 表是否有对应的徽章定义

### 问题3: timestamp 转换错误

**症状**: 连续天数徽章始终为0

**解决方案**:
1. 检查 transactions 表的 timestamp 字段类型：应该是 BIGINT
2. 验证 timestamp 值：应该是毫秒时间戳（13位数字）
3. 测试转换：
   ```sql
   SELECT 
     timestamp,
     to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0) as converted
   FROM transactions 
   WHERE profile_id = 'your-profile-uuid' 
   LIMIT 5;
   ```

---

**更新时间**: 2026-02-09
**版本**: v1.1
**修复文件**: `supabase/migrations/009_fix_badge_functions.sql`
