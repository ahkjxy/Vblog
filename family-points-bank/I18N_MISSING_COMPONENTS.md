# 🔍 需要国际化的组件清单

## ❌ 发现的硬编码文本

### 1. **EditModal.tsx** - 高优先级 ⚠️
**位置**: `components/EditModal.tsx`
**硬编码文本**:
- Line 27: `'任务录入' : 'Task Entry'` 和 `'奖品商店' : 'Reward Store'`
- Line 99: `['每日', '每次', '每周', '每月']` 和 `['Daily', 'Once', 'Weekly', 'Monthly']`
- Line 112: `'实物奖品' : 'Physical Reward'` 和 `'特权奖励' : 'Privilege Reward'`
- Line 129-132: 分类标签 `'学习' : 'Learning'`, `'家务' : 'Chores'`, `'自律' : 'Discipline'`, `'处罚' : 'Penalty'`

**影响**: 设置页面的任务和奖励编辑功能

---

### 2. **BadgeSection.tsx** - 中优先级
**位置**: `components/BadgeSection.tsx`
**硬编码文本**:
- Line 212: `'可领取' : 'Claimable'`
- Line 224: `'数据未同步' : 'Data Not Synced'`
- Line 227: `'成就徽章功能需要将数据同步到云端...'`
- Line 239: `'已获得 {earned} / {total} 个徽章' : 'Earned {earned} / {total} badges'`
- Line 256: `'领取新徽章' : 'Claim Badges'`
- Line 266: `'已获得 ({count})' : 'Earned ({count})'`
- Line 282: `'可以领取 ({count})' : 'Claimable ({count})'`

**影响**: 成就中心页面的徽章显示

---

### 3. **DocsPage.tsx** - 低优先级
**位置**: `components/DocsPage.tsx`
**硬编码文本**: 整个页面都是硬编码的中文
- 标题: `元气银行使用说明与技术手册`
- 描述: `本指南详细汇总了应用的功能模块...`
- 路由架构部分: 所有路由标签和描述
- 页面核心功能部分: 所有功能描述
- 管理流程部分: 所有流程说明
- 技术栈部分: 所有技术说明

**影响**: 文档页面（用户访问频率较低）

---

### 4. **BlogPosts.tsx** - 低优先级
**位置**: `components/BlogPosts.tsx`
**需要检查**: 是否有硬编码文本

---

### 5. **PasswordResetPage.tsx** - 低优先级
**位置**: `components/PasswordResetPage.tsx`
**硬编码文本**:
- Line 53: `'正在安全连接...'`

---

## ✅ 已完成的组件

1. ✅ App.tsx
2. ✅ HeaderBar.tsx
3. ✅ Sidebar.tsx
4. ✅ ActionDrawer.tsx
5. ✅ DashboardSection.tsx
6. ✅ EarnSection.tsx
7. ✅ RedeemSection.tsx
8. ✅ HistorySection.tsx
9. ✅ SettingsSection.tsx
10. ✅ MemberSettings.tsx
11. ✅ TaskSettings.tsx
12. ✅ RewardSettings.tsx
13. ✅ SyncSettings.tsx
14. ✅ AchievementCenter.tsx
15. ✅ ConfirmDialog.tsx
16. ✅ PendingActionModal.tsx
17. ✅ TransferModal.tsx
18. ✅ WishlistModal.tsx
19. ✅ ProfileSwitcherModal.tsx (需要验证)
20. ✅ PasswordResetModal.tsx
21. ✅ GlobalSearchModal.tsx (需要验证)
22. ✅ ChatWidget.tsx (需要验证)
23. ✅ Pagination.tsx

---

## 📋 修复优先级

### 🔴 高优先级（立即修复）
1. **EditModal.tsx** - 设置页面核心功能，用户经常使用

### 🟡 中优先级（建议修复）
2. **BadgeSection.tsx** - 成就中心的徽章显示

### 🟢 低优先级（可选）
3. **DocsPage.tsx** - 文档页面
4. **BlogPosts.tsx** - 博客文章
5. **PasswordResetPage.tsx** - 密码重置页面

---

## 🎯 下一步行动

1. 立即修复 **EditModal.tsx**
2. 修复 **BadgeSection.tsx**
3. 验证所有模态框组件是否完全国际化
4. 可选：修复低优先级组件
