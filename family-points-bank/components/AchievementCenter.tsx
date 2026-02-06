import { useState, useEffect } from "react";
import { Profile, LotteryStats } from "../types";
import { BadgeSection } from "./BadgeSection";
import { Icon } from "./Icon";
import { supabase } from "../supabaseClient";
import { useToast } from "./Toast";
import { LotteryWheel } from "./LotteryWheel";
import { LotteryRulesModal } from "./LotteryRulesModal";

interface AchievementCenterProps {
  currentProfile: Profile;
  familyId: string;
  onRefresh?: () => Promise<void>;
}

export function AchievementCenter({ currentProfile, familyId, onRefresh }: AchievementCenterProps) {
  const [lotteryStats, setLotteryStats] = useState<LotteryStats | null>(null);
  const [showLotteryWheel, setShowLotteryWheel] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [lotterySource, setLotterySource] = useState<'badge' | 'exchange'>('exchange');
  const [currentBadgeId, setCurrentBadgeId] = useState<string>('');
  const [currentBadgeTitle, setCurrentBadgeTitle] = useState<string>('新徽章');
  const [lotteryQueue, setLotteryQueue] = useState<{id: string, title: string}[]>([]);
  const [lotteryWheelLoading, setLotteryWheelLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadLotteryStats();
  }, [currentProfile.id]);

  const loadLotteryStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_lottery_stats', {
        p_profile_id: currentProfile.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const stats = data[0];
        setLotteryStats({
          totalLotteryCount: Number(stats.total_lottery_count ?? 0),
          totalPointsWon: Number(stats.total_points_won ?? 0),
          badgeLotteryCount: Number(stats.badge_lottery_count ?? 0),
          exchangeLotteryCount: Number(stats.exchange_lottery_count ?? 0),
          todayExchangeCount: Number(stats.today_exchange_count ?? 0),
          remainingExchangeCount: stats.remaining_exchange_count !== undefined ? Number(stats.remaining_exchange_count) : 3,
          pendingBadgeCount: Number(stats.pending_badge_count ?? 0),
        });
      }
    } catch (error) {
      console.error('Failed to load lottery stats:', error);
    }
  };

  const handleBadgeLottery = async () => {
    if (lotteryWheelLoading) return;
    
    try {
      setLotteryWheelLoading(true);
      
      // 如果队列为空，先获取待处理的抽奖
      let currentQueue = [...lotteryQueue];
      if (currentQueue.length === 0) {
        const { data, error } = await supabase.rpc('get_pending_badge_lotteries', {
          p_profile_id: currentProfile.id,
        });

        if (error) throw error;
        if (!data || data.length === 0) {
          showToast({ type: 'info', title: '暂无待领取的徽章奖励' });
          await loadLotteryStats();
          return;
        }
        currentQueue = data;
        setLotteryQueue(data);
      }

      // 启动第一个抽奖
      const nextBadge = currentQueue[0];
      setCurrentBadgeId(nextBadge.id);
      setCurrentBadgeTitle(nextBadge.title);
      setLotterySource('badge');
      setShowLotteryWheel(true);
    } catch (error) {
      showToast({
        type: 'error',
        title: '获取失败',
        description: (error as Error).message,
      });
    } finally {
      setLotteryWheelLoading(false);
    }
  };

  const handleExchangeLottery = async () => {
    if (currentProfile.balance < 10) {
      showToast({
        type: 'error',
        title: '积分不足',
        description: '需要10积分才能兑换抽奖机会',
      });
      return;
    }

    if (lotteryStats && lotteryStats.remainingExchangeCount <= 0) {
      showToast({
        type: 'error',
        title: '今日兑换已达上限',
        description: '每天最多可以兑换3次抽奖机会',
      });
      return;
    }

    setLotterySource('exchange');
    setCurrentBadgeTitle('幸运能量转盘');
    setShowLotteryWheel(true);
  };

  const handleLotteryComplete = async (points: number) => {
    try {
      // 调用后端函数执行抽奖
      const { error } = await supabase.rpc(
        lotterySource === 'badge' ? 'lottery_from_badge' : 'lottery_from_exchange',
        lotterySource === 'badge'
          ? { p_profile_id: currentProfile.id, p_badge_id: currentBadgeId, p_family_id: familyId }
          : { p_profile_id: currentProfile.id, p_family_id: familyId }
      );

      if (error) throw error;

      showToast({
        type: 'success',
        title: '抽奖成功!',
        description: `恭喜获得 ${points} 元气值`,
      });

      // 刷新统计数据
      await loadLotteryStats();
      if (onRefresh) await onRefresh();
      
      // 关闭转盘
      setTimeout(() => {
        setShowLotteryWheel(false);
        // 如果是徽章抽奖，从队列中移除第一个
        if (lotterySource === 'badge' && lotteryQueue.length > 0) {
          setLotteryQueue(prev => prev.slice(1));
        }
      }, 500);
    } catch (error) {
      showToast({
        type: 'error',
        title: '抽奖失败',
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-8 lg:p-10 mobile-card">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 blur-[60px] rounded-full"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D94]/10 text-[#FF4D94] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] animate-pulse"></div>
                成就中心
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-2">
                我的成就与抽奖
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg tracking-wide">
                查看你的徽章成就,参与幸运抽奖赢取元气值
              </p>
            </div>
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center transition-all group"
              title="查看抽奖规则"
            >
              <Icon name="settings" size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-[#FF4D94] transition-colors" />
            </button>
          </div>
        </div>

        {/* 抽奖统计卡片 */}
        {lotteryStats && (
          <div className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: '总抽奖次数',
                value: lotteryStats.totalLotteryCount,
                icon: 'reward',
                color: 'text-[#FF4D94]',
              },
              {
                label: '累计获得',
                value: `${lotteryStats.totalPointsWon}`,
                icon: 'plus',
                color: 'text-emerald-500',
                suffix: '元气值',
              },
              {
                label: '今日剩余',
                value: lotteryStats.remainingExchangeCount,
                icon: 'history',
                color: 'text-amber-500',
                suffix: '次',
              },
              {
                label: '当前积分',
                value: currentProfile.balance,
                icon: 'home',
                color: 'text-indigo-500',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-6 rounded-2xl border border-gray-100 dark:border-white/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${stat.color}`}>
                    <Icon name={stat.icon as any} size={20} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
                <p className={`text-3xl font-black ${stat.color}`}>
                  {stat.value}
                  {stat.suffix && <span className="text-lg ml-1">{stat.suffix}</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 抽奖操作按钮容器 */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => {
              if (lotteryStats && lotteryStats.pendingBadgeCount > 0) {
                handleBadgeLottery();
              } else {
                handleExchangeLottery();
              }
            }}
            disabled={
              !lotteryStats || lotteryWheelLoading ||
              (lotteryStats.pendingBadgeCount <= 0 && (lotteryStats.remainingExchangeCount <= 0 || currentProfile.balance < 10))
            }
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              lotteryStats && lotteryStats.pendingBadgeCount > 0
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white animate-bounce-subtle'
                : lotteryStats && lotteryStats.remainingExchangeCount > 0
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white hover:brightness-110'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'
            }`}
          >
            <Icon 
              name={lotteryStats && lotteryStats.pendingBadgeCount > 0 ? "reward" : "history"} 
              size={20} 
            />
            <span>
              {lotteryStats && lotteryStats.pendingBadgeCount > 0 
                ? `抽奖 (${lotteryStats.pendingBadgeCount}次)` 
                : lotteryStats && lotteryStats.remainingExchangeCount > 0 
                  ? '10积分兑换抽奖' 
                  : '明天再来吧'}
            </span>
          </button>
          
          {lotteryStats && lotteryStats.remainingExchangeCount <= 0 && lotteryStats.pendingBadgeCount <= 0 && (
            <p className="w-full text-xs text-gray-500 dark:text-gray-400 mt-0">
              今日兑换次数已用完,明天再来吧!
            </p>
          )}
        </div>
      </div>

      {/* Badge Section */}
      <BadgeSection 
        profile={currentProfile}
        familyId={familyId}
        onBadgeClaimed={(badges: { id: string; title: string }[]) => {
          if (badges.length > 0) {
            setLotteryQueue(prev => [...prev, ...badges]);
          }
        }}
      />

      {/* Lottery Wheel Modal */}
      <LotteryWheel
        isOpen={showLotteryWheel}
        onClose={() => {
          setShowLotteryWheel(false);
          // 如果手动关闭，也应该跳过当前队列项
          if (lotterySource === 'badge' && lotteryQueue.length > 0) {
            setLotteryQueue(prev => prev.slice(1));
          }
        }}
        onComplete={handleLotteryComplete}
        source={lotterySource}
        badgeTitle={currentBadgeTitle}
      />

      {/* Lottery Rules Modal */}
      <LotteryRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
