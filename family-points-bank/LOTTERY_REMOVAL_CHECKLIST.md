# 抽奖模块移除检查清单

## ✅ 已完成的工作

### 1. 代码文件清理
- [x] 删除 `components/LotteryWheel.tsx`
- [x] 删除 `components/LotteryRulesModal.tsx`
- [x] 更新 `types.ts` - 移除 LotteryRecord 和 LotteryStats 接口
- [x] 更新 `types.ts` - 从 Transaction type 中移除 'lottery' 和 'exchange'
- [x] 重构 `components/AchievementCenter.tsx` - 移除所有抽奖逻辑
- [x] 更新 `components/HistorySection.tsx` - 移除抽奖类型筛选和显示
- [x] 清理 `test/scripts/capture_tour.spec.ts` - 移除抽奖测试注释
- [x] 更新 `supabase/scripts/delete_other_families.sql` - 移除抽奖表引用
- [x] 更新 `supabase/scripts/query_other_families.sql` - 移除抽奖表查询

### 2. 文档清理
- [x] 删除 `LOTTERY_IMPLEMENTATION.md`
- [x] 删除 `LOTTERY_QUICKSTART.md`
- [x] 删除 `lottery.md`
- [x] 创建 `LOTTERY_REMOVAL_SUMMARY.md` - 移除工作总结
- [x] 创建 `LOTTERY_REMOVAL_CHECKLIST.md` - 本检查清单

### 3. 数据库迁移文件
- [x] 删除 `supabase/migrations/006_lottery_system.sql`
- [x] 删除 `supabase/migrations/007_fix_lottery_ambiguity.sql`
- [x] 创建 `supabase/migrations/cleanup_lottery_system.sql` - 数据库清理脚本

## 🔄 需要执行的后续步骤

### 1. 数据库清理（重要！）
```bash
# 在 Supabase Dashboard 中执行:
# 1. 打开 SQL Editor
# 2. 粘贴 supabase/migrations/cleanup_lottery_system.sql 的内容
# 3. 点击 Run 执行
```

**清理内容:**
- [ ] 删除 8 个抽奖相关函数
- [ ] 删除 lottery_records 表
- [ ] 删除 daily_lottery_limits 表
- [ ] 清理抽奖系统消息（可选）

### 2. 验证数据库清理
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

### 3. 重新构建应用
```bash
# 清理旧的构建文件
rm -rf dist/
rm -rf android/app/src/main/assets/public/

# 重新构建
npm run build

# 如果需要构建 Android 应用
npm run build:android
```

### 4. 清除缓存
- [ ] 清除浏览器缓存
- [ ] 清除 Service Worker 缓存
- [ ] 如果使用 Android 应用，卸载后重新安装

### 5. 测试验证
- [ ] 访问成就中心，确认不显示抽奖相关内容
- [ ] 检查历史记录页面，确认没有抽奖筛选选项
- [ ] 验证现有功能正常工作（徽章、积分、任务等）
- [ ] 检查控制台是否有相关错误

## 📝 注意事项

1. **数据备份**: 执行数据库清理前，建议先备份数据库
2. **历史数据**: 如果需要保留抽奖历史消息，在清理脚本中注释掉 DELETE 语句
3. **构建文件**: android/app/src/main/assets/ 中的旧构建文件包含抽奖代码，需要重新构建
4. **部署**: 完成所有修改后，需要重新部署应用

## 🎯 预期结果

完成所有步骤后:
- ✅ 成就中心只显示徽章，不显示抽奖功能
- ✅ 历史记录不包含抽奖类型
- ✅ 数据库不包含抽奖相关表和函数
- ✅ 应用正常运行，无错误

## 📞 问题排查

如果遇到问题:
1. 检查浏览器控制台是否有错误
2. 验证数据库清理是否完全执行
3. 确认应用已重新构建
4. 清除所有缓存后重试

---

**创建时间**: 2026-02-09
**状态**: 代码清理完成，等待数据库清理和重新构建
