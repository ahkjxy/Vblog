# 🎰 抽奖系统说明文档 (Lottery System)

本文档详细说明了“家庭积分银行”项目中的抽奖系统实现，包括数据库结构、业务逻辑和前端展示。

## 1. 业务逻辑概述

### 🏆 徽章免费抽奖
- **触发条件**：当成员获得新的成就徽章时。
- **奖励内容**：随机获得 **0-15** BP (元气值)。
- **限制**：每个徽章实例仅可领取一次抽奖奖励。

### 💎 积分兑换抽奖
- **消耗**：每次消耗 **10 BP**。
- **限制**：每人每天最多兑换 **3次**（每日0点重置）。
- **奖励内容**：随机获得 **0-15** BP。

## 2. 奖励分布算法 (加权随机)

系统采用加权随机算法，分布如下：

| 获得积分 | 概率权重 | 视觉标签 |
| :--- | :--- | :--- |
| **0 BP** | 30% | 再接再厉 / 谢谢参与 |
| **1-5 BP** | 40% | 能量小奖 |
| **6-10 BP** | 20% | 能量大礼 |
| **11-15 BP** | 10% | 幸运大奖 |

**期望值**：约 4.1 BP。

## 3. 数据库核心实现 (Supabase SQL)

以下是抽奖系统的完整 SQL 逻辑，包含概率生成、状态查询和核心执行函数。

```sql
-- ============================================
-- 幸运转盘抽奖系统核心逻辑
-- ============================================

-- 1. 获取随机奖励分值 (加权随机: 0(30%), 1-5(40%), 6-10(20%), 11-15(10%))
CREATE OR REPLACE FUNCTION get_lottery_points()
RETURNS INTEGER AS $$
DECLARE
  v_rand FLOAT := random() * 100;
BEGIN
  IF v_rand < 30 THEN RETURN 0;
  ELSIF v_rand < 70 THEN RETURN floor(random() * 5 + 1);
  ELSIF v_rand < 90 THEN RETURN floor(random() * 5 + 6);
  ELSE RETURN floor(random() * 5 + 11);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. 徽章免费抽奖
CREATE OR REPLACE FUNCTION lottery_from_badge(p_profile_id UUID, p_badge_id UUID, p_family_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
BEGIN
  -- 检查是否已领取
  IF EXISTS (SELECT 1 FROM lottery_records WHERE profile_id = p_profile_id AND badge_id = p_badge_id AND source = 'badge') THEN
    RAISE EXCEPTION '该徽章奖励已领取过';
  END IF;

  v_points := get_lottery_points();
  
  -- 记录抽奖
  INSERT INTO lottery_records (profile_id, family_id, source, badge_id, points_won)
  VALUES (p_profile_id, p_family_id, 'badge', p_badge_id, v_points);

  -- 增加积分
  IF v_points > 0 THEN
    UPDATE profiles SET balance = balance + v_points WHERE id = p_profile_id;
    -- 记录交易
    INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp)
    VALUES (p_profile_id, p_family_id, 'lottery', v_points, '成就徽章免费奖励', NOW());
  END IF;

  RETURN v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 积分消费抽奖 (10积分)
CREATE OR REPLACE FUNCTION lottery_from_exchange(p_profile_id UUID, p_family_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
  v_today_count INTEGER;
BEGIN
  -- 检查余额
  IF (SELECT balance FROM profiles WHERE id = p_profile_id) < 10 THEN
    RAISE EXCEPTION '元气值不足 10，无法兑换';
  END IF;

  -- 检查每日限制 (3次)
  SELECT COUNT(*) INTO v_today_count FROM lottery_records 
  WHERE profile_id = p_profile_id AND source = 'exchange' AND created_at::DATE = CURRENT_DATE;
  
  IF v_today_count >= 3 THEN
    RAISE EXCEPTION '今日兑换次数已达上限';
  END IF;

  -- 扣除积分
  UPDATE profiles SET balance = balance - 10 WHERE id = p_profile_id;
  INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp)
  VALUES (p_profile_id, p_family_id, 'exchange', -10, '兑换转盘抽奖', NOW());

  v_points := get_lottery_points();
  
  -- 记录并加分
  INSERT INTO lottery_records (profile_id, family_id, source, points_won)
  VALUES (p_profile_id, p_family_id, 'exchange', v_points);

  IF v_points > 0 THEN
    UPDATE profiles SET balance = balance + v_points WHERE id = p_profile_id;
    INSERT INTO transactions (profile_id, family_id, type, points, title, timestamp)
    VALUES (p_profile_id, p_family_id, 'lottery', v_points, '转盘幸运奖励', NOW());
  END IF;

  RETURN v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```


## 4. 前端组件设计

### `LotteryWheel.tsx`
- **视觉**：高性能 CSS 动画驱动的 8 扇区转盘。
- **音效/特效**：
  - 加速与减速旋转。
  - 中奖时弹出烟花特效。
  - 不同奖项对应不同颜色梯度（Emerald, Blue, Amber, Gray）。

### `AchievementCenter.tsx`
- **队列管理**：支持多个徽章连续抽奖。
- **状态统计**：实时展示今日剩余兑换次数和累计收益。

## 5. 安全建议
1. **防作弊**：所有分值计算应在后端执行，前端仅负责动画展示。
2. **限流**：建议在 RPC 层添加简单的限流策略。
