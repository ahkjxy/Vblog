import { useMemo, useState } from "react";
import { Profile, Transaction, Reward, Task } from "../types";
import { Icon } from "./Icon";
import { BlogPosts } from "./BlogPosts";
import { formatDateTime } from "../utils/datetime";
import { PillTabs } from "./PillTabs";
import { calculateLevelInfo, getLevels, getRoleLabel } from "../utils/leveling";
import { Language, useTranslation } from "../i18n/translations";

// 成员头像组件
function MemberAvatar({ avatarUrl, name, avatarColor }: { avatarUrl?: string | null; name: string; avatarColor: string }) {
  const [imageError, setImageError] = useState(false);
  const showAvatar = avatarUrl && !imageError;

  if (showAvatar) {
    return (
      <img 
        src={avatarUrl!} 
        alt={name}
        className="w-11 h-11 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div 
      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg ${avatarColor || 'bg-gray-400'} shadow-md group-hover:scale-110 transition-transform`}
    >
      {name.slice(-1)}
    </div>
  );
}

interface DashboardSectionProps {
  currentProfile: Profile;
  profiles: Profile[];
  rewards: Reward[];
  tasks: Task[];
  onGoEarn: () => void;
  onGoRedeem: () => void;
  onGoHistory: () => void;
  onRedeem: (payload: { title: string; points: number; type: 'redeem' }) => void;
  onSelectTask: (payload: { title: string; points: number; type: 'earn' }) => void;
  language?: Language;
}

type ChartPoint = { label: string; value: number };
type ProfileInsight = {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  balance: number;
  totalEarned: number;
  activity7d: number;
  completionRate: number;
  net7d: number;
  trend7d: ChartPoint[];
};

function buildTrend(
  transactions: (Transaction & { profileId: string })[],
  days: number
): ChartPoint[] {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const buckets: ChartPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const start = d.getTime();
    const endTime = start + 24 * 60 * 60 * 1000;
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const value = transactions
      .filter(
        (t: Transaction & { profileId: string }) => t.timestamp >= start && t.timestamp < endTime
      )
      .reduce((sum: number, t: Transaction) => sum + t.points, 0);
    buckets.push({ label, value });
  }
  return buckets;
}

export function DashboardSection({
  currentProfile,
  profiles,
  rewards,
  tasks,
  onGoEarn,
  onGoRedeem,
  onGoHistory,
  onRedeem,
  onSelectTask,
  language = 'zh',
}: DashboardSectionProps) {
  const { t } = useTranslation(language);
  const [isTopMembersExpanded, setIsTopMembersExpanded] = useState(false);
  const todayGain = currentProfile.history
    .filter(
      (h) => new Date(h.timestamp).toDateString() === new Date().toDateString() && h.points > 0
    )
    .reduce((a, b) => a + b.points, 0);

  const totals = currentProfile.history.reduce(
    (acc, h) => {
      if (h.points > 0) acc.earned += h.points;
      if (h.points < 0) acc.spent += Math.abs(h.points);
      acc.count += 1;
      return acc;
    },
    { earned: 0, spent: 0, count: 0 }
  );

  const allTransactions = useMemo<(Transaction & { profileId: string; profileName: string; avatarColor: string })[]>(
    () =>
      profiles.flatMap((p) =>
        p.history.map((tx) => ({ ...tx, profileId: p.id, profileName: p.name, avatarColor: p.avatarColor }))
      ),
    [profiles]
  );

  const profileInsights = useMemo<ProfileInsight[]>(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return profiles.map((p: Profile) => {
      const last7 = p.history.filter((tx: Transaction) => now - tx.timestamp <= oneDay * 7);
      const earn = last7.filter((tx: Transaction) => tx.type === "earn").length;
      const penalty = last7.filter((tx: Transaction) => tx.type === "penalty").length;
      const totalEarned = p.history.filter((tx: Transaction) => tx.points > 0).reduce((s: number, tx: Transaction) => s + tx.points, 0);
      
      return {
        id: p.id,
        name: p.name,
        avatarColor: p.avatarColor,
        avatarUrl: p.avatarUrl,
        balance: p.balance,
        totalEarned,
        activity7d: last7.length,
        completionRate: earn + penalty === 0 ? 0 : Math.round((earn / (earn + penalty)) * 100),
        net7d: last7.reduce((s: number, tx: Transaction) => s + tx.points, 0),
        trend7d: buildTrend(
          last7.map((tx) => ({ ...tx, profileId: p.id })),
          7
        ),
      };
    });
  }, [profiles]);

  const renderMiniTrend = (data: ChartPoint[]) => {
    if (!data.length) return <div className="text-[10px] text-gray-400 italic">{t.dashboard.energyBalance}</div>;
    const height = 40;
    const maxVal = Math.max(...data.map((d) => Math.abs(d.value)), 1);
    const step = data.length === 1 ? 0 : Math.max(20, 140 / (data.length - 1));
    const width = (data.length - 1) * step || 1;
    const zeroY = height / 2;
    const points = data
      .map((d, i) => {
        const x = i * step;
        const y = zeroY - (d.value / (maxVal * 2)) * height;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg
        viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
        className="w-full h-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={`M ${points}`}
          fill="none"
          className="stroke-[#FF4D94]"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.length > 0 && (
          <circle
            cx={(data.length - 1) * step}
            cy={zeroY - (data[data.length - 1].value / (maxVal * 2)) * height}
            r={3}
            className="fill-[#FF4D94] shadow-sm"
          />
        )}
      </svg>
    );
  };

  const [quickTab, setQuickTab] = useState<"rewards" | "tasks">("rewards");
  const [heroTab, setHeroTab] = useState<"stats" | "progress">("stats");
  const myLevel = calculateLevelInfo(totals.earned, language);

  // 计算最常用的任务和奖励
  const mostUsedItems = useMemo(() => {
    // 统计任务使用频率
    const taskUsageCount = new Map<string, number>();
    allTransactions.forEach(tx => {
      if (tx.type === 'earn') {
        const count = taskUsageCount.get(tx.title) || 0;
        taskUsageCount.set(tx.title, count + 1);
      }
    });

    // 统计奖励使用频率
    const rewardUsageCount = new Map<string, number>();
    allTransactions.forEach(tx => {
      if (tx.type === 'redeem') {
        const count = rewardUsageCount.get(tx.title) || 0;
        rewardUsageCount.set(tx.title, count + 1);
      }
    });

    // 按使用频率排序任务
    const sortedTasks = [...tasks].sort((a, b) => {
      const countA = taskUsageCount.get(a.title) || 0;
      const countB = taskUsageCount.get(b.title) || 0;
      return countB - countA; // 降序
    });

    // 按使用频率排序奖励
    const sortedRewards = [...rewards].sort((a, b) => {
      const countA = rewardUsageCount.get(a.title) || 0;
      const countB = rewardUsageCount.get(b.title) || 0;
      return countB - countA; // 降序
    });

    return { tasks: sortedTasks, rewards: sortedRewards };
  }, [tasks, rewards, allTransactions]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 左侧英雄区：管理与成长 Tab 切换 */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden relative mobile-card flex flex-col">
          {/* 顶部装饰渐变条 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4D94] via-[#7C4DFF] to-[#10B981]" />
          
          <div className="p-1 px-1 sm:p-2 sm:px-2 flex border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 relative z-10">
             <button 
               onClick={() => setHeroTab('stats')}
               className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-[24px] ${heroTab === 'stats' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
             >
               <Icon name="shield" size={14} />
               {t.dashboard.coreManagement}
             </button>
             <button 
               onClick={() => setHeroTab('progress')}
               className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-[24px] ${heroTab === 'progress' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
             >
               <Icon name="award" size={14} />
               {t.dashboard.growthLadder}
             </button>
          </div>

          <div className="flex-1">
            {heroTab === 'stats' ? (
              <div className="p-6 lg:p-10 animate-in fade-in duration-500 flex flex-col h-full">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                  <div className="flex-1">
                    {/* 大数字展示区 - 渐变卡片设计 */}
                    <div className="relative mb-8 p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#FF4D94]/10 via-[#7C4DFF]/10 to-[#10B981]/10 dark:from-[#FF4D94]/8 dark:via-[#7C4DFF]/8 dark:to-[#10B981]/8 border border-gray-100 dark:border-white/10 overflow-hidden group/hero shadow-sm hover:shadow-md transition-all">
                      {/* 背景装饰 */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#7C4DFF]/10 dark:from-[#7C4DFF]/15 to-transparent blur-[60px]" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FF4D94]/10 dark:from-[#FF4D94]/15 to-transparent blur-[50px]" />
                      
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                          {/* 左侧：标签和大数字 */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF4D94]/20 to-[#7C4DFF]/20 dark:from-[#FF4D94]/30 dark:to-[#7C4DFF]/30 text-[#FF4D94] dark:text-[#FF6BA9] text-[10px] font-black uppercase tracking-[0.2em] w-fit border border-[#FF4D94]/20 dark:border-[#FF4D94]/30">
                              <Icon name="shield" size={12} className="animate-pulse" />
                              {t.dashboard.energyCore}
                            </div>
                            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-none tracking-tighter flex items-baseline gap-2">
                              <span className="points-font bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] dark:from-[#FF6BA9] dark:to-[#9D6FFF] bg-clip-text text-transparent">{currentProfile.balance}</span>
                              <span className="text-base font-medium text-gray-600 dark:text-gray-300">{t.dashboard.energyPower}</span>
                            </h2>
                          </div>
                          
                          {/* 右侧：统计信息 */}
                          <div className="flex items-center gap-4 sm:pb-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">{t.dashboard.todayGrowth}</span>
                              <span className="text-lg font-black text-emerald-500 dark:text-emerald-400 points-font">+{todayGain}</span>
                            </div>
                            <div className="w-[1px] h-8 bg-gray-200 dark:bg-white/10" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">{t.dashboard.accountRole}</span>
                              <span className="text-xs font-black text-[#7C4DFF] dark:text-[#9D6FFF] uppercase tracking-wider">{getRoleLabel(currentProfile.role, language)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 用户实时境界看板 */}
                    <div className="mb-6 p-4 sm:p-5 rounded-[32px] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center gap-5 group/banner relative overflow-hidden hover:border-[#FF4D94]/20 dark:hover:border-[#FF4D94]/30 transition-all">
                       <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D94]/5 dark:from-[#FF4D94]/10 to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-700" />
                       <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-lg text-white transform group-hover/banner:rotate-6 transition-all duration-500 relative overflow-hidden`}>
                          <Icon name={myLevel.icon as any} size={myLevel.level >= 5 ? 24 : 20} className="z-10 drop-shadow-md" />
                       </div>
                       <div className="flex-1 min-w-0 z-10">
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                             <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-gray-900 dark:text-white truncate">{currentProfile.name}</h4>
                                <span className="px-1.5 py-0.5 rounded-md bg-[#7C4DFF]/10 text-[#7C4DFF] text-[9px] font-black uppercase tracking-wider border border-[#7C4DFF]/15">
                                  {getRoleLabel(currentProfile.role, language)}
                                </span>
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-wider ${myLevel.color} opacity-80`}>
                                {myLevel.name} LV.{myLevel.level}
                             </span>
                          </div>
                          <div className="space-y-1.5">
                             <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] transition-all duration-1000 shadow-[0_0_8px_rgba(255,77,148,0.3)]" style={{ width: `${myLevel.progress}%` }} />
                             </div>
                             <div className="flex justify-between items-center text-[9px] font-bold text-gray-400/80 uppercase tabular-nums">
                                <span>{t.dashboard.currentProgress}</span>
                                <span>{myLevel.nextPoints ? `${totals.earned} / ${myLevel.nextPoints}` : t.dashboard.peakLevel}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: t.dashboard.totalEarned, value: totals.earned, icon: "plus", tone: "indigo" },
                        { label: t.dashboard.totalSpent, value: totals.spent, icon: "reward", tone: "rose" },
                        { label: t.dashboard.tasksCompleted, value: totals.count, icon: "check", tone: "emerald" },
                        { label: t.dashboard.accountBalance, value: currentProfile.balance, icon: "shield", tone: "amber" }
                      ].map((stat, i) => (
                        <div key={i} className="flex flex-col p-3 sm:p-4 rounded-[24px] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-[#FF4D94]/20 dark:hover:border-[#FF4D94]/30 transition-all group/stat shadow-sm min-h-[84px]">
                           <div className="flex items-center justify-between mb-1.5">
                             <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider group-hover/stat:text-[#FF4D94] dark:group-hover/stat:text-[#FF6BA9] transition-colors">{stat.label}</p>
                             <Icon name={stat.icon as any} size={12} className="opacity-40 text-gray-400" />
                           </div>
                           <p className={`text-lg sm:text-xl font-black points-font truncate mt-auto ${
                             stat.tone === 'rose' ? 'text-rose-500 dark:text-rose-400' : 
                             stat.tone === 'emerald' ? 'text-emerald-500 dark:text-emerald-400' : 
                             stat.tone === 'amber' ? 'text-amber-500 dark:text-amber-400' : 'text-[#7C4DFF] dark:text-[#9D6FFF]'
                           }`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-px bg-[#FF4D94]" />
                        <span className="text-[9px] font-black text-[#FF4D94] uppercase tracking-[0.3em]">{t.dashboard.cultivationPath}</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {t.dashboard.growthLadder}
                      </h3>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                       <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest text-center">{t.dashboard.currentTotalEarned}</p>
                       <p className="text-base font-black text-[#7C4DFF] dark:text-[#9D6FFF] points-font text-center">{totals.earned}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getLevels(language).map((lv) => {
                      const isUnlocked = totals.earned >= lv.minPoints;
                      return (
                        <div key={lv.level} className={`p-3.5 rounded-[20px] border transition-all duration-500 flex items-center gap-4 relative overflow-hidden ${isUnlocked ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:border-[#FF4D94]/20' : 'bg-gray-50/50 dark:bg-transparent border-transparent opacity-50 grayscale'}`}>
                          {isUnlocked && (
                            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#FF4D94]/10 to-transparent flex items-center justify-end pr-1.5 pt-1.5 rounded-tr-[20px]">
                              <div className="w-1.5 h-1.5 bg-[#FF4D94] rounded-full shadow-[0_0_8px_#FF4D94]" />
                            </div>
                          )}
                          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${isUnlocked ? `bg-white dark:bg-gray-800 shadow-xl border border-gray-50 dark:border-white/5 ${lv.color}` : 'bg-gray-100 dark:bg-white/5'}`}>
                            <Icon name={lv.icon as any} size={20} className={isUnlocked ? 'animate-float' : 'opacity-40'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className={`text-[13px] font-black tracking-tight ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{lv.name}</p>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LV.{lv.level}</p>
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="h-1 flex-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mr-3">
                                  <div 
                                    className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF]' : 'bg-gray-200'}`} 
                                    style={{ width: isUnlocked ? '100%' : `${Math.min(100, (totals.earned / lv.minPoints) * 100)}%` }} 
                                  />
                               </div>
                               <p className={`text-[9px] font-black points-font tabular-nums ${isUnlocked ? 'text-[#FF4D94]' : 'text-gray-400'}`}>{lv.minPoints}+</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：任务和商店 Tab */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col group mobile-card overflow-hidden">
          <div className="p-6 lg:p-8 flex flex-col h-full"> 
            <PillTabs
              tabs={[
                { id: "rewards", label: t.dashboard.dreamExchange, icon: "🎁" },
                { id: "tasks", label: t.dashboard.quickTasks, icon: "⚡" },
              ]}
              activeId={quickTab}
              onChange={(id) => setQuickTab(id as "rewards" | "tasks")}
              className="!p-1 bg-gray-50 dark:bg-white/5 mb-6"
            />
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1" style={{ maxHeight: '460px' }}>
              {(quickTab === "rewards" ? mostUsedItems.rewards : mostUsedItems.tasks).slice(0, 10).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-white/10 border border-transparent hover:border-[#FF4D94]/20 dark:hover:border-[#FF4D94]/30 transition-all group/item shadow-sm">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-black text-gray-800 dark:text-gray-200 truncate">{item.title}</h4>
                    <p className={`text-[10px] font-black points-font mt-0.5 ${quickTab === 'tasks' ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#FF4D94] dark:text-[#FF6BA9]'}`}>
                      {quickTab === 'tasks' ? '+' : ''}{item.points} {t.common.energy}
                    </p>
                  </div>
                  <button 
                    onClick={() => quickTab === 'rewards' ? onRedeem({ title: item.title, points: -item.points, type: 'redeem' }) : onSelectTask({ title: item.title, points: item.points, type: 'earn' })}
                    className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-white/20 flex items-center justify-center text-white hover:bg-[#FF4D94] dark:hover:bg-[#FF6BA9] hover:shadow-lg transition-all active:scale-95"
                  >
                    <Icon name={quickTab === 'rewards' ? 'reward' : 'plus'} size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={quickTab === 'rewards' ? onGoRedeem : onGoEarn} className="mt-6 w-full py-4 bg-gray-100/50 dark:bg-white/5 rounded-2xl text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
              <span>{t.dashboard.manageAll}</span>
              <Icon name="arrow-down" size={12} className="-rotate-90 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 博客文章区域 - 替换原来的元气波动走势 */}
        <div className="lg:col-span-8">
          <BlogPosts language={language} />
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col h-full mobile-card">
          <div className="p-6 lg:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
               <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.dashboard.liveStream}</h3>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mt-1">{t.dashboard.cloudSync}</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">{t.dashboard.live}</span>
               </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1" style={{ minHeight: '440px', maxHeight: '440px' }}>
              {allTransactions.sort((a,b) => b.timestamp - a.timestamp).slice(0, 15).map((msg, idx) => (
                <div key={idx} className="flex gap-3 group/activity items-start hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md ${msg.avatarColor || 'bg-gray-400'}`}>
                    {(msg.profileName || '消').slice(-1)}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon 
                        name={msg.type === 'earn' ? 'plus' : msg.type === 'redeem' ? 'reward' : msg.type === 'penalty' ? 'alert-circle' : 'arrow-right'} 
                        size={14} 
                        className={`shrink-0 ${msg.type === 'earn' ? 'text-emerald-500' : msg.type === 'redeem' ? 'text-rose-500' : msg.type === 'penalty' ? 'text-amber-500' : 'text-[#7C4DFF]'}`}
                      />
                      <span className={`text-[11px] font-black uppercase tracking-wider ${msg.type === 'earn' ? 'text-emerald-500' : msg.type === 'redeem' ? 'text-rose-500' : msg.type === 'penalty' ? 'text-amber-500' : 'text-[#7C4DFF]'}`}>
                        {msg.type === 'earn' ? t.dashboard.taskReward : msg.type === 'redeem' ? t.dashboard.dreamRedeem : msg.type === 'penalty' ? t.dashboard.violationDeduction : t.dashboard.energyTransfer}
                      </span>
                    </div>
                    <p className="text-[15px] font-black text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 leading-tight">{msg.title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="inline-flex items-center gap-1.5">
                          <Icon name="user" size={14} className="opacity-60 shrink-0 flex-shrink-0" />
                          <span className="font-medium truncate max-w-[80px]">{msg.profileName || t.dashboard.member}</span>
                        </div>
                        <span className="opacity-40">·</span>
                        <span className="font-medium shrink-0">{formatDateTime(msg.timestamp)}</span>
                      </div>
                      <span className={`text-base font-black tabular-nums points-font shrink-0 ${msg.points > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {msg.points > 0 ? '+' : ''}{msg.points}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col mobile-card">
           <div className="p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.dashboard.identityGrowthMatrix}</h3>
              <button onClick={() => setIsTopMembersExpanded(!isTopMembersExpanded)} className="text-[10px] font-black text-[#7C4DFF] uppercase tracking-widest hover:underline">
                {isTopMembersExpanded ? t.dashboard.collapseDetails : t.dashboard.viewAll}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar pr-2" style={{ maxHeight: '360px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileInsights.map((p) => {
                    const plv = calculateLevelInfo(p.totalEarned, language);
                    
                    return (
                      <div key={p.id} className="p-5 rounded-[28px] bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-[#10B981]/20 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <MemberAvatar 
                              avatarUrl={p.avatarUrl} 
                              name={p.name} 
                              avatarColor={p.avatarColor} 
                            />
                            <div>
                          <p className="text-sm font-black text-gray-800 dark:text-white">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Icon name={plv.icon as any} size={10} className={plv.color} />
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              {plv.name} (LV.{plv.level})
                            </p>
                          </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="w-16 h-6 mb-1">{renderMiniTrend(p.trend7d)}</div>
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase leading-none">{t.dashboard.active} {p.completionRate}%</span>
                     </div>
                      </div>
                    );
                  })}
              </div>
            </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#111827] p-8 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group mobile-card">
          <div className="absolute -bottom-10 -right-10 text-[#7C4DFF]/5 group-hover:rotate-12 transition-transform duration-1000">
             <Icon name="award" size={160} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">{t.dashboard.familyEconomicHub}</h3>
            <div className="space-y-5">
               <div className="p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{t.dashboard.totalCirculation}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black points-font text-gray-900 dark:text-white">
                      {profiles.reduce((sum, p) => sum + p.balance, 0)}
                    </span>
                    <span className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em]">{t.dashboard.energyConservation}</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.todayOutput}</p>
                     <p className="text-lg font-black text-emerald-500 points-font">
                        +{allTransactions.filter(t => t.points > 0 && new Date(t.timestamp).toDateString() === new Date().toDateString()).reduce((s, t) => s + t.points, 0)}
                     </p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.todayConsumption}</p>
                     <p className="text-lg font-black text-rose-500 points-font">
                        -{allTransactions.filter(t => t.points < 0 && new Date(t.timestamp).toDateString() === new Date().toDateString()).reduce((s, t) => s + Math.abs(t.points), 0)}
                     </p>
                  </div>
               </div>
               <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.conversionEfficiency}</span>
                     <span className="text-[10px] font-black text-[#7C4DFF] font-mono">92.4%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7C4DFF] via-[#FF4D94] to-[#7C4DFF] w-[92.4%] shadow-[0_0_10px_rgba(124,77,255,0.4)]" />
                  </div>
               </div>
            </div>
            <button onClick={onGoHistory} className="mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-900 dark:bg-white/10 text-white dark:text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-gray-800 transition-all">
               {t.dashboard.viewTotalLedger}
               <Icon name="arrow-down" size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
