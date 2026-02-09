# 抽奖模块移除总结

## 已删除的文件

### 组件文件
- `components/LotteryWheel.tsx` - 抽奖转盘组件
- `components/LotteryRulesModal.tsx` - 抽奖规则说明弹窗

### 文档文件
- `LOTTERY_IMPLEMENTATION.md` - 抽奖系统实施文档
- `LOTTERY_QUICKSTART.md` - 抽奖快速开始指南
- `lottery.md` - 抽奖详细说明文档

### 数据库迁移文件
- `supabase/migrations/006_lottery_system.sql` - 抽奖系统初始迁移
- `supabase/migrations/007_fix_lottery_ambiguity.sql` - 抽奖函数修复

## 已修改的文件

### 1. `types.ts`
**移除的类型定义:**
- `LotteryRecord` 接口
- `LotteryStats` 接口

**修改的类型:**
- `Transaction['type']` - 移除了 `'lottery'` 和 `'exchange'` 类型

### 2. `components/AchievementCenter.tsx`
**移除的功能:**
- 所有抽奖相关的状态管理
- 抽奖统计数据加载
- 徽章抽奖处理逻辑
- 积分兑换抽奖逻辑
- 抽奖转盘弹窗
- 抽奖规则弹窗

**保留的功能:**
- 成就中心基础布局
- 徽章展示（BadgeSection）
- 基础统计卡片（等级、积分、徽章数）

### 3. `components/HistorySection.tsx`
**移除的功能:**
- 历史记录标签中的"抽奖"选项
- 交易类型映射中的 `lottery` 和 `exchange` 类型
- 统计计算中对抽奖类型的处理
- 图标渲染中对抽奖类型的特殊处理

### 4. `test/scripts/capture_tour.spec.ts`
**移除的内容:**
- 抽奖相关的测试注释代码

## 数据库清理

### 创建的清理脚本
`supabase/migrations/cleanup_lottery_system.sql`

**该脚本将删除:**

1. **函数 (Functions):**
   - `notify_lottery_win()` - 抽奖中奖通知
   - `lottery_from_badge()` - 徽章抽奖
   - `lottery_from_exchange()` - 积分兑换抽奖
   - `get_lottery_points()` - 抽奖积分计算
   - `get_lottery_stats()` - 抽奖统计
   - `get_pending_badge_lotteries()` - 待处理徽章抽奖
   - `check_daily_lottery_limit()` - 每日限制检查
   - `cleanup_old_daily_limits()` - 清理过期限制

2. **表 (Tables):**
   - `lottery_records` - 抽奖记录表
   - `daily_lottery_limits` - 每日限制表

3. **消息清理 (可选):**
   - 删除 messages 表中的抽奖系统消息

## 执行数据库清理

在 Supabase Dashboard 的 SQL Editor 中执行以下脚本：

```bash
# 在 Supabase Dashboard 中:
# 1. 打开 SQL Editor
# 2. 粘贴 supabase/migrations/cleanup_lottery_system.sql 的内容
# 3. 点击 Run 执行
```

## 验证清理结果

执行清理脚本后，运行以下 SQL 验证：

```sql
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
```

## 注意事项

1. **数据备份**: 在执行清理脚本前，建议先备份数据库
2. **历史消息**: 清理脚本会删除抽奖相关的系统消息，如需保留可注释掉相关 DELETE 语句
3. **前端缓存**: 清理完成后建议清除浏览器缓存
4. **重新部署**: 修改完成后需要重新部署应用

## 影响范围

- ✅ 成就中心不再显示抽奖相关功能
- ✅ 历史记录不再有抽奖类型的筛选
- ✅ 数据库不再存储抽奖相关数据
- ✅ 用户无法通过徽章或积分进行抽奖

## 完成时间

2026-02-09

---

**状态**: ✅ 已完成
**版本**: 移除抽奖模块 v1.0
