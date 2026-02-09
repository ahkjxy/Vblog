import { Reward, Profile } from '../types';
import { Icon } from './Icon';
import { PillTabs } from './PillTabs';
import { Pagination } from './Pagination';
import { calculateLevelInfo, getProfileTotalEarned } from "../utils/leveling";
import { useState, useMemo, useEffect } from "react";
import { Language, useTranslation } from '../i18n/translations';

interface RedeemSectionProps {
  rewards: Reward[];
  balance: number;
  onRedeem: (payload: { title: string; points: number; type: 'redeem' }) => void;
  isAdmin?: boolean;
  onApproveWishlist?: (rewardId: string) => void;
  onRejectWishlist?: (rewardId: string) => void;
  profiles?: Profile[];
  onAddWish?: () => void;
  currentProfile: Profile;
  language?: Language;
}

export function RedeemSection({ rewards, balance, onRedeem, isAdmin = false, onApproveWishlist, onRejectWishlist, profiles = [], onAddWish, currentProfile, language = 'zh' }: RedeemSectionProps) {
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const rewardTabs = [
    { id: 'all', label: t.redeem.allDreams, icon: '✨' },
    { id: '实物奖品', label: t.redeem.physicalRewards, icon: '🎁' },
    { id: '特权奖励', label: t.redeem.privilegeRewards, icon: '💎' },
  ];

  const filtered = useMemo(() => {
    // 过滤掉已拒绝的奖励
    // 普通用户只能看到 active 状态的奖励
    // 管理员可以看到 active 和 pending 状态的奖励
    const availableRewards = rewards.filter(r => {
      // 排除已拒绝的
      if (r.status === 'rejected') return false;
      // 管理员可以看到 active 和 pending
      if (isAdmin) return r.status === 'active' || r.status === 'pending' || !r.status;
      // 普通用户只能看到 active
      return r.status === 'active' || !r.status;
    });
    const sorted = [...availableRewards].sort((a, b) => a.points - b.points);
    if (activeTab === 'all') return sorted;
    return sorted.filter(r => r.type === activeTab);
  }, [activeTab, rewards, isAdmin]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const getRewardImage = (reward: Reward) =>
    reward.imageUrl || `https://ui-avatars.com/api/?background=7C4DFF&color=fff&name=${encodeURIComponent(reward.title)}&bold=true&font-size=0.33`;

  const getRequesterName = (reward: Reward) => {
    if (!reward.requestedBy) return null;
    const requester = profiles.find(p => p.id === reward.requestedBy);
    return requester?.name || '某人';
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-8 lg:p-10 mobile-card">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 blur-[60px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="flex-1 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C4DFF]/10 text-[#7C4DFF] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] animate-pulse"></div>
                {t.redeem.dreamStore}
              </div>
              <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">{t.redeem.whichWish}</h3>
            </div>
            
            <div className="flex items-center gap-5 p-5 rounded-[32px] bg-gray-50/80 dark:bg-white/5 border border-white/40 dark:border-white/5 max-w-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] group/progress relative overflow-hidden">
               <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover/progress:scale-110 bg-white dark:bg-gray-800 ${calculateLevelInfo(getProfileTotalEarned(currentProfile), language).color} relative z-10`}>
                  <Icon name={calculateLevelInfo(getProfileTotalEarned(currentProfile), language).icon as any} size={28} />
               </div>
               <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest opacity-80">{t.redeem.availableBalance}</p>
                    <p className="text-[14px] font-black tabular-nums text-[#FF4D94] points-font">{balance} BP</p>
                  </div>
                  <div className="h-2 w-full bg-white dark:bg-black/40 rounded-full overflow-hidden p-[1px] shadow-inner">
                     <div 
                       className="h-full bg-gradient-to-r from-[#FF4D94] via-[#7C4DFF] to-emerald-500 rounded-full transition-all duration-1000 relative" 
                       style={{ width: `${Math.min(100, (balance / 1000) * 100)}%` }}
                     >
                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite] -skew-x-12" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 lg:min-w-[320px]">
            <div className="flex gap-3 justify-end items-center">
              {onAddWish && (
                <button
                  onClick={onAddWish}
                  className="px-6 py-4 rounded-[24px] bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 group/wish"
                >
                  <Icon name="plus" size={14} className="group-hover/wish:rotate-90 transition-transform" />
                  <span>{t.redeem.addNewWish}</span>
                </button>
              )}
            </div>
            
            <div className="flex gap-4 p-4 bg-white dark:bg-black/20 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex-1 flex items-center gap-3 px-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t.redeem.canAffordNow}</span>
              </div>
              <div className="flex-1 flex items-center gap-3 px-3 border-l border-gray-100 dark:border-white/5">
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t.redeem.almostThere}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-1 px-1 rounded-[24px] lg:rounded-[32px] bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <PillTabs
            tabs={rewardTabs}
            activeId={activeTab}
            onChange={setActiveTab}
            className="!mt-0"
          />
        </div>
      </div>

      {/* Reward Grid - Double column on mobile for density */}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
        {paginatedData.map(reward => {
          const canAfford = balance >= reward.points;
          const gap = Math.max(0, reward.points - balance);
          const progress = Math.min(100, Math.round((balance / reward.points) * 100));
          
          return (
            <div 
              key={reward.id} 
              className={`group relative flex flex-col rounded-[20px] sm:rounded-[40px] bg-white dark:bg-[#0F172A] border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)] mobile-card animate-in fade-in slide-in-from-bottom-2 ${
                canAfford 
                  ? 'border-transparent hover:border-[#FF4D94]/30 shadow-sm' 
                  : 'border-transparent opacity-90 grayscale-[0.3]'
              }`}
            >
              {/* Product Image Area */}
              <div className="relative p-2 sm:p-3 pb-0 sm:pb-3">
                <div className="relative aspect-[16/10] sm:aspect-[1/1] rounded-[16px] sm:rounded-[32px] overflow-hidden bg-gray-50 dark:bg-white/5">
                  <img src={getRewardImage(reward)} alt={reward.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/10">
                    {reward.type === '实物奖品' ? t.redeem.physical : t.redeem.privilege}
                  </div>

                  {/* Points Badge - Compact */}
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white text-[10px] font-black points-font shadow-sm">
                    {reward.points}
                  </div>

                  {/* Progress Overlay */}
                  {!canAfford && reward.status !== 'pending' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-[#FF4D94]" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-white font-bold text-[9px]">{t.redeem.need} {gap}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-2.5 sm:p-6 flex flex-col flex-1 gap-2">
                <div className="min-h-[2.5em]">
                  <h4 className="text-[11px] sm:text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-0.5">{reward.title}</h4>
                  {reward.status === 'pending' && <p className="text-[8px] text-amber-500 font-bold">{t.redeem.pending}</p>}
                </div>

                <div className="mt-auto">
                  {!canAfford && reward.status !== 'pending' && (
                    <button disabled className="w-full h-7 sm:h-12 rounded-[10px] sm:rounded-[20px] bg-gray-100 dark:bg-white/5 text-gray-400 text-[9px] sm:text-sm font-bold flex items-center justify-center gap-1 cursor-not-allowed">
                      <Icon name="lock" size={10} className="sm:hidden" />
                      <span className="hidden sm:inline">{t.redeem.insufficientBalance}</span>
                      <span className="sm:hidden">{t.redeem.cannotRedeem}</span>
                    </button>
                  )}

                  {reward.status === 'pending' && (
                    <div className="w-full h-7 sm:h-12 rounded-[10px] sm:rounded-[20px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] sm:text-sm font-bold flex items-center justify-center border border-amber-100 dark:border-transparent">
                      <span className="hidden sm:inline">{t.redeem.waitingApproval}</span>
                      <span className="sm:hidden">{t.redeem.pending}</span>
                    </div>
                  )}

                  {canAfford && (
                    <button
                      onClick={() => onRedeem({ title: reward.title, points: -reward.points, type: 'redeem' })}
                      className={`w-full py-4 rounded-[20px] text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                        canAfford 
                          ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-[#FF4D94] dark:hover:bg-[#FF4D94] hover:text-white dark:hover:text-white shadow-lg active:scale-95' 
                          : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Icon name="reward" size={16} />
                          {t.redeem.redeemNow}
                        </>
                      ) : (
                        t.redeem.insufficientBalance
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
          language={language}
        />
      )}

      {filtered.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-white/50 dark:bg-white/5 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
          <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-4xl opacity-50">🎁</div>
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest">{t.redeem.emptyStore}</p>
        </div>
      )}
    </div>
  );
}
