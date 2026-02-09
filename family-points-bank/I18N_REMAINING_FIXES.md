# 🔧 剩余需要修复的硬编码文本

## 优先级分类

### 🔴 高优先级（用户常见）

#### 1. **Pagination.tsx** - Line 64-68
```typescript
// 当前代码
{language === 'zh' ? (
  <>显示 <span>{startItem}</span> - <span>{endItem}</span> / 共 <span>{totalItems}</span> 条</>
) : (
  <>Showing <span>{startItem}</span> - <span>{endItem}</span> of <span>{totalItems}</span> items</>
)}

// 修复为
<>{t.pagination.showing} <span>{startItem}</span> {t.pagination.to} <span>{endItem}</span> {t.pagination.ofTotal} <span>{totalItems}</span> {t.pagination.items}</>
```

#### 2. **BadgeSection.tsx** - 多处硬编码
- Line 319: `✨ {language === 'zh' ? '点击领取' : 'Click to Claim'}` → `{t.badge.clickToClaim}`
- Line 336: `{replace(language === 'zh' ? '未达成 ({count})' : 'Locked ({count})', ...)}` → `{replace(t.badge.locked, ...)}`
- Line 370: `{replace(language === 'zh' ? '还需 {remaining}' : '{remaining} more needed', ...)}` → `{replace(t.badge.needMore, ...)}`
- Line 401: `{language === 'zh' ? '还没有徽章' : 'No Badges Yet'}` → `{t.badge.noBadgesYet}`
- Line 404: `{language === 'zh' ? '完成任务，解锁你的第一个成就徽章！' : 'Complete tasks to unlock your first badge!'}` → `{t.badge.completeTasksFirst}`
- Line 424: `{language === 'zh' ? '暂无可领取的徽章' : 'No Claimable Badges'}` → `{t.badge.noClaimableBadges}`
- Line 427: `{language === 'zh' ? '继续完成任务，解锁更多成就！' : 'Keep completing tasks to unlock more badges!'}` → `{t.badge.keepCompleting}`
- Line 434: `{replace(language === 'zh' ? '{count} 个徽章可以领取' : '{count} badges ready to claim', ...)}` → `{replace(t.badge.readyToClaim, ...)}`
- Line 443: `{language === 'zh' ? '一键领取' : 'Claim All'}` → `{t.badge.claimAll}`
- Line 468: `{language === 'zh' ? '可领取' : 'Claimable'}` → `{t.badge.claimable}`
- Line 473: `✨ {language === 'zh' ? '已完成！点击领取' : 'Completed! Click to claim'}` → `{t.badge.completed}`

#### 3. **EarnSection.tsx** - 多处硬编码
- Line 96: `{language === 'zh' ? '任务中心' : 'TASK CENTER'}` → `{t.earn.taskCenter}`
- Line 99: `{language === 'zh' ? '元气任务工场' : 'Task Workshop'}` → `{t.earn.taskWorkshop}`
- Line 129-131: 统计标签 → 使用 `t.earn.*`
- Line 205: `{task.description || (language === 'zh' ? '完成后请点击记录' : 'Click to record after completion')}` → `{task.description || t.earn.clickToRecord}`
- Line 211: `{task.frequency || (language === 'zh' ? '随时' : 'Anytime')}` → `{task.frequency || t.earn.anytime}`

#### 4. **Splash.tsx** - Line 102-121
```typescript
// 当前代码
{language === 'zh' ? (
  <><span className="text-[#FF4D94]">元气</span>银行</>
) : (
  <><span className="text-[#FF4D94]">Family</span> Bank</>
)}

// 修复为
{language === 'zh' ? (
  <><span className="text-[#FF4D94]">{t.app.energyBank}</span>{t.app.name.replace('元气', '')}</>
) : (
  <><span className="text-[#FF4D94]">{t.app.energyBank}</span> {t.app.name.replace('Family ', '')}</>
)}
```

#### 5. **WishlistModal.tsx** - Line 102
```typescript
// 当前代码
{language === 'zh' ? '元气' : 'Points'}

// 修复为
{t.app.points}
```

#### 6. **TransferModal.tsx** - Line 139
```typescript
// 当前代码
{language === 'zh' ? '元气' : 'Points'}

// 修复为
{t.app.points}
```

#### 7. **PendingActionModal.tsx** - Line 48
```typescript
// 当前代码
{pendingAction.points > 0 ? '+' : ''}{pendingAction.points} {language === 'zh' ? '元气' : 'Points'}

// 修复为
{pendingAction.points > 0 ? '+' : ''}{pendingAction.points} {t.app.points}
```

#### 8. **SettingsSection.tsx** - Line 436
```typescript
// 当前代码
{s.sub} {language === 'zh' ? '条' : ''}

// 修复为
{s.sub} {t.settings.items}
```

### 🟡 中优先级（不太常见）

#### 9. **ActionDrawer.tsx** - Line 221
```typescript
// 当前代码
language === 'zh' ? 'bg-gradient...' : 'bg-white...'

// 这个是样式判断，保持不变
```

### 🟢 低优先级（很少使用）

#### 10. **DocsPage.tsx** - 整个页面
- 这个页面全是硬编码的中文
- 需要大量翻译工作
- 建议单独处理

---

## 修复策略

### 立即修复（5分钟内）
1. Pagination.tsx
2. WishlistModal.tsx
3. TransferModal.tsx
4. PendingActionModal.tsx
5. SettingsSection.tsx

### 批量修复（10分钟内）
6. BadgeSection.tsx（11处）
7. EarnSection.tsx（5处）
8. Splash.tsx（2处）

### 可选修复
9. DocsPage.tsx（整页）

---

## 已添加的翻译键

✅ `pagination.showing`, `pagination.to`, `pagination.ofTotal`, `pagination.items`
✅ `badge.clickToClaim`, `badge.locked`, `badge.needMore`, `badge.noBadgesYet`, `badge.completeTasksFirst`, `badge.noClaimableBadges`, `badge.keepCompleting`, `badge.readyToClaim`, `badge.claimAll`, `badge.completed`
✅ `earn.taskCenter`, `earn.taskWorkshop`, `earn.taskLibrary`, `earn.total`, `earn.dailyMust`, `earn.daily`, `earn.highValue`, `earn.high`, `earn.anytime`, `earn.clickToRecord`
✅ `app.familyBank`, `app.energyBank`, `app.points`
✅ `settings.items`

---

**更新时间**: 2026-02-09
**状态**: 翻译键已添加，等待组件修复
