# 徽章功能修复总结

## 问题
用户反馈：已经完成的任务（如"兑换过东西"）对应的徽章仍然显示为未完成状态。

## 修复内容

### 1. 创建数据库迁移文件
**文件**: `supabase/migrations/009_fix_badge_functions.sql`

修复了3个数据库函数：

#### a) `grant_eligible_badges` 函数
- ✅ 添加了 `p_family_id UUID DEFAULT NULL` 参数
- ✅ 支持从参数或 profiles 表获取 family_id
- ✅ 修复了返回值计数逻辑

#### b) `get_available_badges` 函数
- ✅ 修复了 timestamp 字段处理（BIGINT 毫秒时间戳 → TIMESTAMPTZ）
- ✅ **修复了字段名错误：使用 `balance` 而不是 `points`** ⚠️ 关键修复
- ✅ 添加了特殊徽章的统计：
  - `v_transfer_count`: 转赠次数
  - `v_redeem_count`: 兑换次数
  - `v_current_balance`: 当前余额（从 `balance` 字段获取）
- ✅ 区分了学习和家务类任务
- ✅ 完善了条件判断逻辑

#### c) `get_all_badges_progress` 函数
- ✅ 应用了与 `get_available_badges` 相同的修复
- ✅ **修复了字段名错误：使用 `balance` 而不是 `points`** ⚠️ 关键修复
- ✅ 确保两个函数行为一致

### 2. 清理前端代码
**文件**: `components/BadgeSection.tsx`

- ✅ 移除了未使用的变量 `remaining` 和 `isReady`
- ✅ 清除了所有 TypeScript 警告

### 3. 创建文档
- ✅ `BADGE_FUNCTIONS_FIX.md` - 详细的技术说明
- ✅ `QUICK_FIX_BADGES.md` - 快速修复指南
- ✅ `BADGE_FIX_SUMMARY.md` - 本文件

## 修复的徽章类型

### 基础徽章（已正确工作）
- 🔥 连续徽章: streak_3, streak_7, streak_14, streak_30, streak_100
- ⭐ 里程碑徽章: total_50, total_100, total_200, total_500, total_1000
- 🎯 任务徽章: tasks_10, tasks_50, tasks_100, tasks_200, tasks_500

### 特殊徽章（本次修复）
- 🎁 **first_redeem** (首次兑换): 现在正确检查兑换次数
- 💝 **generous** (慷慨之心): 现在正确检查转赠次数
- 💰 **saver** (储蓄达人): 现在正确检查当前余额
- 📚 **learning_50/100** (学习标兵/学霸): 现在区分学习任务
- 🧹 **chores_50/100** (家务小能手/达人): 现在区分家务任务

## 部署步骤

### 第1步：执行数据库迁移
```bash
# 在 Supabase Dashboard 的 SQL Editor 中执行
# 文件: supabase/migrations/009_fix_badge_functions.sql
```

### 第2步：验证修复
```sql
-- 检查函数是否更新
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_available_badges', 'grant_eligible_badges', 'get_all_badges_progress');

-- 测试函数（替换为实际的 profile_id）
SELECT * FROM get_all_badges_progress('your-profile-uuid-here');
```

### 第3步：测试前端
```bash
# 清除缓存并刷新页面
# 进入成就中心
# 点击"领取新徽章"按钮
```

## 预期效果

修复后，用户应该能够：

1. ✅ 看到所有已完成条件的徽章显示为"可领取"状态
2. ✅ 成功领取已达成条件的徽章
3. ✅ 正确显示各类徽章的进度
4. ✅ 特殊徽章（兑换、转赠、储蓄等）正常工作

## 技术细节

### 问题1: 函数参数不匹配
```typescript
// 前端调用
const { data, error } = await supabase.rpc("grant_eligible_badges", {
  p_profile_id: profile.id,
  p_family_id: familyId, // ❌ 原函数没有这个参数
});
```

**解决方案**: 添加可选参数
```sql
CREATE OR REPLACE FUNCTION grant_eligible_badges(
  p_profile_id UUID, 
  p_family_id UUID DEFAULT NULL  -- ✅ 新增
)
```

### 问题2: timestamp 类型错误
```sql
-- ❌ 错误：timestamp 是 BIGINT，不能直接用 DATE()
SELECT DISTINCT DATE(timestamp) as task_date

-- ✅ 正确：先转换为 TIMESTAMPTZ
SELECT DISTINCT DATE(to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0)) as task_date
```

### 问题3: 字段名错误 ⚠️ 关键问题
```sql
-- ❌ 错误：profiles 表没有 points 字段
SELECT COALESCE(points, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;

-- ✅ 正确：应该使用 balance 字段
SELECT COALESCE(balance, 0) INTO v_current_balance FROM profiles WHERE id = p_profile_id;
```

**错误信息**: `{"code": "42703","message": "column \"points\" does not exist"}`

### 问题4: 特殊徽章条件未检查
```sql
-- ❌ 原代码：只计算了值，但没有在条件中使用
COUNT(CASE WHEN t.type = 'redeem' THEN 1 END)

-- ✅ 修复：在条件判断中使用
WHEN 'custom' THEN
  CASE bd.condition
    WHEN 'first_redeem' THEN v_redeem_count >= bd.requirement_value
    WHEN 'generous' THEN v_transfer_count >= bd.requirement_value
    WHEN 'saver' THEN v_current_balance >= bd.requirement_value
    ELSE FALSE
  END
```

## 文件清单

### 新增文件
- ✅ `supabase/migrations/009_fix_badge_functions.sql` - 数据库迁移
- ✅ `BADGE_FUNCTIONS_FIX.md` - 详细技术文档
- ✅ `QUICK_FIX_BADGES.md` - 快速修复指南
- ✅ `BADGE_FIX_SUMMARY.md` - 本文件

### 修改文件
- ✅ `components/BadgeSection.tsx` - 清理未使用变量

### 相关文件（未修改）
- `supabase/migrations/003_seed_badge_conditions.sql` - 原始徽章定义
- `supabase/migrations/008_add_get_all_badges_progress.sql` - 之前的迁移
- `BADGE_DISPLAY_UPDATE.md` - 之前的更新文档

## 测试建议

### 1. 测试基础徽章
```sql
-- 查看任务统计
SELECT 
  COUNT(*) as total_tasks,
  SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END) as total_points
FROM transactions 
WHERE profile_id = 'your-profile-uuid' AND type = 'earn';
```

### 2. 测试特殊徽章
```sql
-- 查看特殊统计
SELECT 
  COUNT(CASE WHEN type = 'redeem' THEN 1 END) as redeem_count,
  COUNT(CASE WHEN type = 'transfer' THEN 1 END) as transfer_count
FROM transactions 
WHERE profile_id = 'your-profile-uuid';

-- 查看当前余额
SELECT points FROM profiles WHERE id = 'your-profile-uuid';
```

### 3. 测试连续天数
```sql
-- 查看每日任务
SELECT 
  DATE(to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0)) as task_date,
  COUNT(*) as task_count
FROM transactions 
WHERE profile_id = 'your-profile-uuid' AND type = 'earn'
GROUP BY task_date
ORDER BY task_date DESC
LIMIT 10;
```

## 故障排查

如果修复后仍有问题，请检查：

1. ✅ 是否成功执行了迁移文件
2. ✅ 函数是否有正确的参数（使用 `\df grant_eligible_badges` 查看）
3. ✅ transactions 表的 timestamp 字段是否为 BIGINT 类型
4. ✅ badge_definitions 表是否有对应的徽章定义
5. ✅ 浏览器缓存是否已清除

详细的故障排查步骤请参考 `BADGE_FUNCTIONS_FIX.md`。

---

**更新时间**: 2026-02-09
**版本**: v1.0
**状态**: ✅ 已完成
