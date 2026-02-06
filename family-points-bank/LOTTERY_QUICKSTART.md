# 🚀 抽奖系统快速开始指南 (V9 稳定版)

**重要提示**: 如果你之前运行过旧版本的 SQL，请务必执行最新的 V9 迁移文件。
V9 版本彻底修复了 `family_id` 为空引起的约束冲突 (Not-Null Constraint Violation) 错误。

## 第一步: 执行数据库迁移

### 方式 1: Supabase Dashboard (推荐)

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制 `supabase/migrations/006_lottery_system.sql` 的全部内容 (V9 版)
6. 粘贴到编辑器 (该脚本会自动清理旧数据，请放心运行)
7. 点击 **Run** 按钮执行

### 方式 2: Supabase CLI

```bash
cd /Users/liaoyuan/Desktop/works/family-points-bank
supabase db push
```

---

## 第二步: 验证数据库修正

执行以下查询确认修正是否生效：

```sql
-- 检查表结构 (profile_id 和 badge_id 应该是 text 类型)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lottery_records' 
  AND column_name IN ('profile_id', 'badge_id');

-- data_type 应该是 'text'
```

---

## 第三步: 测试抽奖功能

### 测试抽奖算法
```sql
SELECT get_lottery_points();
```

### 测试统计功能 (支持任意 ID 格式)
```sql
-- 替换为你的实际 ID (如 'p-sister1')
SELECT * FROM get_lottery_stats('p-sister1');
```

---

## 第四步: 启动开发服务器

```bash
yarn dev
```

---

## 功能测试清单

### ✅ 积分兑换抽奖
- [ ] 积分 >= 10 时,按钮可点击
- [ ] 每日限制 3 次
- [ ] 抽奖后积分减少 10，并增加获得的元气值

### ✅ 徽章奖励抽奖 (重点)
- [ ] **获得多个徽章**: 假设你一次同步获得了3个徽章
- [ ] **连续抽奖**: 界面应该连续弹出3次转盘
- [ ] **不限次数**: 徽章抽奖不占用每日兑换次数
- [ ] **一次性**: 每个徽章ID只能抽奖一次

---

## 常见问题

### Q: 为什么之前报错 `column "amount" does not exist`?
**A**: 这是因为 `transactions` 表的正确字段名是 `points`，新的迁移文件已经修正了这个问题。

### Q: 为什么之前报错 `invalid input syntax for type uuid`?
**A**: 你的用户 ID (如 `p-sister1`) 不是 UUID 格式。新的迁移文件已将 `profile_id` 更改为 `TEXT` 类型，现在可以支持任何格式的 ID。

---

**祝你使用愉快! 🎉**
