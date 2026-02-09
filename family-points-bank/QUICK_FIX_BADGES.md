# 徽章问题快速修复指南

## 问题
已完成的任务（如兑换过东西）对应的徽章仍然显示为未完成。

**错误信息**: `column "points" does not exist`

**原因**: 函数中使用了错误的字段名 `points`，应该使用 `balance`。

## 快速修复（3步）

### 第1步：执行数据库迁移

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. 复制粘贴 `supabase/migrations/009_fix_badge_functions.sql` 的全部内容
6. 点击 **Run** 按钮执行

### 第2步：验证修复

在 SQL Editor 中执行以下查询（替换 `your-profile-uuid` 为你的实际 profile_id）：

```sql
-- 查看所有徽章进度
SELECT 
  title,
  progress,
  requirement,
  is_earned,
  CASE 
    WHEN is_earned THEN '✅ 已获得'
    WHEN progress >= requirement THEN '🎉 可领取'
    ELSE '⏳ 进行中'
  END as status
FROM get_all_badges_progress('your-profile-uuid')
ORDER BY 
  CASE 
    WHEN progress >= requirement AND NOT is_earned THEN 1
    WHEN is_earned THEN 2
    ELSE 3
  END,
  requirement;
```

你应该能看到：
- ✅ 已获得的徽章
- 🎉 可领取的徽章（progress >= requirement）
- ⏳ 进行中的徽章

### 第3步：领取徽章

1. 刷新浏览器页面（清除缓存：Cmd+Shift+R 或 Ctrl+Shift+R）
2. 进入"成就中心"页面
3. 点击"领取新徽章"按钮
4. 应该能看到成功提示

## 如何获取 profile_id

在浏览器控制台（F12）执行：

```javascript
// 方法1：从 localStorage 获取
const state = JSON.parse(localStorage.getItem('family-state') || '{}');
console.log('Profile ID:', state.currentProfile?.id);

// 方法2：从 Supabase 查询
const { data } = await supabase.auth.getUser();
console.log('User ID:', data.user?.id);
```

或者在 Supabase Dashboard 的 SQL Editor 中：

```sql
-- 查看所有用户
SELECT id, name, email FROM profiles;
```

## 修复内容

本次修复解决了以下问题：

1. ✅ **函数参数错误**: `grant_eligible_badges` 现在接受 `p_family_id` 参数
2. ✅ **timestamp 类型错误**: 正确处理 BIGINT 毫秒时间戳
3. ✅ **字段名错误**: 使用 `balance` 而不是 `points` 字段 ⚠️ 关键修复
4. ✅ **特殊徽章未检查**: 
   - `first_redeem` (首次兑换) - 现在正确检查兑换次数
   - `generous` (慷慨之心) - 现在正确检查转赠次数
   - `saver` (储蓄达人) - 现在正确检查当前余额
5. ✅ **学习/家务徽章未区分**: 现在根据任务标题区分类型

## 常见问题

### Q: 执行迁移后仍然看不到可领取的徽章？

A: 尝试以下步骤：
1. 清除浏览器缓存（Cmd+Shift+R 或 Ctrl+Shift+R）
2. 退出登录后重新登录
3. 在 SQL Editor 中手动测试函数（见第2步）

### Q: 显示"暂无可领取的徽章"但我确实完成了任务？

A: 检查徽章定义：

```sql
-- 查看所有徽章定义
SELECT condition, title, requirement_value, requirement_type 
FROM badge_definitions 
ORDER BY requirement_value;

-- 查看你的统计数据
SELECT 
  COUNT(CASE WHEN type = 'earn' THEN 1 END) as total_tasks,
  COUNT(CASE WHEN type = 'redeem' THEN 1 END) as redeem_count,
  COUNT(CASE WHEN type = 'transfer' THEN 1 END) as transfer_count,
  SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END) as total_points
FROM transactions 
WHERE profile_id = 'your-profile-uuid';
```

### Q: 连续天数徽章始终为0？

A: 检查 timestamp 字段：

```sql
-- 查看最近的交易记录
SELECT 
  timestamp,
  to_timestamp(CAST(timestamp AS DOUBLE PRECISION) / 1000.0) as converted_time,
  type,
  title
FROM transactions 
WHERE profile_id = 'your-profile-uuid' 
AND type = 'earn'
ORDER BY timestamp DESC 
LIMIT 10;
```

如果 `converted_time` 显示正确的日期时间，说明转换成功。

## 需要帮助？

如果以上步骤无法解决问题，请提供以下信息：

1. 执行迁移时的错误信息（如果有）
2. 第2步验证查询的结果
3. 浏览器控制台的错误信息（F12 打开控制台）

---

**文件位置**: 
- 迁移文件: `family-points-bank/supabase/migrations/009_fix_badge_functions.sql`
- 详细说明: `family-points-bank/BADGE_FUNCTIONS_FIX.md`
