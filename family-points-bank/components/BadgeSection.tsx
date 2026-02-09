import { useEffect, useState } from "react";
import { Badge, Profile } from "../types";
import { BadgeDisplay } from "./BadgeDisplay";
import { Icon } from "./Icon";
import { supabase } from "../supabaseClient";
import { useToast } from "./Toast";

interface BadgeSectionProps {
  profile: Profile;
  familyId: string;
  onBadgeClaimed?: (badges: { id: string; title: string }[]) => void;
}

interface AvailableBadge {
  condition: string;
  badge_type: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  requirement: number;
  is_earned?: boolean;
  earned_at?: string;
}

export function BadgeSection({ profile, familyId, onBadgeClaimed }: BadgeSectionProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<AvailableBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"earned" | "available">("earned");
  const { showToast } = useToast();

  useEffect(() => {
    loadBadges();
  }, [profile.id]);

  // 验证是否为有效的 UUID
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const loadBadges = async () => {
    setLoading(true);
    try {
      // 检查 profile.id 是否为有效的 UUID
      if (!isValidUUID(profile.id)) {
        console.warn("Profile ID is not a valid UUID:", profile.id);
        setBadges([]);
        setAvailableBadges([]);
        setLoading(false);
        return;
      }

      // 加载已获得的徽章
      const { data: earnedBadges, error: earnedError } = await supabase
        .from("badges")
        .select("*")
        .eq("profile_id", profile.id)
        .order("earned_at", { ascending: false });

      if (earnedError) throw earnedError;

      setBadges(
        (earnedBadges || []).map((b) => ({
          id: b.id,
          type: b.type,
          title: b.title,
          description: b.description,
          icon: b.icon,
          earnedAt: new Date(b.earned_at).getTime(),
          condition: b.condition,
        }))
      );

      // 尝试使用新函数获取所有徽章进度
      const { data: allBadgesProgress, error: allBadgesError } = await supabase.rpc(
        "get_all_badges_progress",
        {
          p_profile_id: profile.id,
        }
      );

      if (allBadgesError) {
        console.warn("Failed to load all badges progress, falling back to old method:", allBadgesError);
        
        // 回退到旧方法
        const { data: available, error: availableError } = await supabase.rpc(
          "get_available_badges",
          {
            p_profile_id: profile.id,
          }
        );

        if (availableError) {
          console.warn("Failed to load available badges:", availableError);
        } else {
          const earnedBadgeIds = new Set((earnedBadges || []).map(b => b.condition));
          const filteredAvailable = (available || []).filter(
            (badge: AvailableBadge) => !earnedBadgeIds.has(badge.condition)
          );
          setAvailableBadges(filteredAvailable);
        }
      } else {
        // 使用新方法：过滤出未获得的徽章
        const unearnedBadges = (allBadgesProgress || []).filter(
          (badge: AvailableBadge) => !badge.is_earned
        );
        setAvailableBadges(unearnedBadges);
      }
    } catch (error) {
      console.error("Failed to load badges:", error);
      showToast({ type: "error", title: "加载徽章失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBadges = async () => {
    // 检查 profile.id 是否为有效的 UUID
    if (!isValidUUID(profile.id)) {
      showToast({ 
        type: "error", 
        title: "无法领取徽章", 
        description: "请先同步数据到云端" 
      });
      return;
    }

    try {
      // 检查 familyId 是否有效 (如果后端强制需要)
      if (!isValidUUID(familyId)) {
         // 可能这是一个新用户或者数据问题
         console.warn("Invalid family ID:", familyId);
         // 我们还是尝试调用，让后端处理或者只抛出警告
      }

      const { data, error } = await supabase.rpc("grant_eligible_badges", {
        p_profile_id: profile.id,
        p_family_id: familyId, // 传递 family_id
      });

      if (error) throw error;

      const count = data || 0;
      if (count > 0) {
        showToast({
          type: "success",
          title: "恭喜获得新徽章！",
          description: `成功获得 ${count} 个新徽章`,
        });
        
        // 重新加载徽章
        await loadBadges();
        
        // 触发抽奖回调 (获取最新的徽章)
        if (onBadgeClaimed) {
          // 获取刚刚领取的徽章
          const { data: latestBadges } = await supabase
            .from("badges")
            .select("*")
            .eq("profile_id", profile.id)
            .order("earned_at", { ascending: false })
            .limit(count);
          
          if (latestBadges && latestBadges.length > 0) {
            // 将所有新徽章传递给回调
            const newBadges = latestBadges.map(b => ({
              id: b.id,
              title: b.title
            }));
            onBadgeClaimed(newBadges);
          }
        }
      } else {
        showToast({ type: "info", title: "暂无可领取的徽章" });
      }
    } catch (error) {
      showToast({ type: "error", title: "领取失败", description: (error as Error).message });
    }
  };

  const getProgressPercentage = (progress: number, requirement: number) => {
    return Math.min((progress / requirement) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
        <button
          onClick={() => setActiveTab("earned")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "earned"
              ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 hover:text-[#FF4D94]"
          }`}
        >
          全部徽章 ({badges.length + availableBadges.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "available"
              ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 hover:text-[#FF4D94]"
          }`}
        >
          可领取 ({availableBadges.filter(b => b.progress >= b.requirement).length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 min-h-[400px] shadow-xl">
        {!isValidUUID(profile.id) ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center mb-4">
              <Icon name="settings" size={40} className="opacity-30 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              数据未同步
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              成就徽章功能需要将数据同步到云端。请前往设置页面完成数据同步。
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "earned" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  已获得 {badges.length} / {badges.length + availableBadges.length} 个徽章
                </p>
                <div className="mt-2 w-full max-w-xs h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${((badges.length / (badges.length + availableBadges.length)) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleClaimBadges}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2"
              >
                <Icon name="reward" size={16} />
                领取新徽章
              </button>
            </div>
            
            {/* 已获得的徽章 */}
            {badges.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    已获得 ({badges.length})
                  </h4>
                </div>
                <BadgeDisplay badges={badges} />
              </div>
            )}
            
            {/* 未获得的徽章 */}
            {availableBadges.length > 0 && (
              <div>
                {/* 可领取的徽章 */}
                {availableBadges.filter(b => b.progress >= b.requirement).length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                      <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        可以领取 ({availableBadges.filter(b => b.progress >= b.requirement).length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableBadges
                        .filter(b => b.progress >= b.requirement)
                        .map((badge, index) => {
                          return (
                            <div
                              key={index}
                              className="group relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10 p-4 rounded-2xl border-2 border-emerald-400/60 dark:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-105 cursor-pointer"
                              onClick={handleClaimBadges}
                            >
                              {/* 可领取标记 */}
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <Icon name="check" size={12} className="text-white" />
                              </div>
                              
                              <div className="flex flex-col items-center text-center">
                                {/* 徽章图标 */}
                                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-3xl mb-3 shadow-md transition-transform group-hover:scale-110">
                                  {badge.icon}
                                </div>
                                
                                {/* 徽章信息 */}
                                <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 line-clamp-1">
                                  {badge.title}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                                  {badge.description}
                                </p>
                                
                                {/* 可领取提示 */}
                                <div className="w-full px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg">
                                  <p className="text-xs font-black text-white">
                                    ✨ 点击领取
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
                
                {/* 未达成的徽章 */}
                {availableBadges.filter(b => b.progress < b.requirement).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
                      <h4 className="text-base font-bold text-gray-700 dark:text-gray-300">
                        未达成 ({availableBadges.filter(b => b.progress < b.requirement).length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableBadges
                        .filter(b => b.progress < b.requirement)
                        .map((badge, index) => {
                          const remaining = badge.requirement - badge.progress;
                          
                          return (
                            <div
                              key={index}
                              className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-4 rounded-2xl border border-gray-200 dark:border-white/10 opacity-80 hover:opacity-100 transition-all"
                            >
                              <div className="flex flex-col items-center text-center">
                                {/* 徽章图标 */}
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 grayscale flex items-center justify-center text-3xl mb-3 shadow-sm transition-transform group-hover:scale-105">
                                  {badge.icon}
                                </div>
                                
                                {/* 徽章信息 */}
                                <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 line-clamp-1">
                                  {badge.title}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.5rem]">
                                  {badge.description}
                                </p>
                                
                                {/* 进度信息 */}
                                <div className="w-full space-y-2">
                                  <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                      还需 <span className="font-black">{remaining}</span>
                                    </p>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 rounded-full"
                                      style={{
                                        width: `${getProgressPercentage(badge.progress, badge.requirement)}%`,
                                      }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {badge.progress} / {badge.requirement}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {badges.length === 0 && availableBadges.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-500/10 dark:to-purple-500/10 flex items-center justify-center mb-4">
                  <Icon name="reward" size={40} className="opacity-50 text-pink-500" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  还没有徽章
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  完成任务，解锁你的第一个成就徽章！
                </p>
                <button
                  onClick={handleClaimBadges}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2"
                >
                  <Icon name="reward" size={16} />
                  领取徽章
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {availableBadges.filter(b => b.progress >= b.requirement).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 flex items-center justify-center mb-4">
                  <Icon name="reward" size={40} className="opacity-50 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  暂无可领取的徽章
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  继续完成任务，解锁更多成就！
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {availableBadges.filter(b => b.progress >= b.requirement).length} 个徽章可以领取
                  </p>
                  <button
                    onClick={handleClaimBadges}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                  >
                    <Icon name="plus" size={16} />
                    一键领取
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableBadges.filter(b => b.progress >= b.requirement).map((badge, index) => (
                    <div
                      key={index}
                      className="group bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10 p-5 rounded-2xl border-2 border-emerald-400/60 dark:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-500/20 cursor-pointer"
                      onClick={handleClaimBadges}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md flex-shrink-0">
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-black text-gray-900 dark:text-white truncate">
                                {badge.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {badge.description}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                              可领取
                            </span>
                          </div>
                          <div className="mt-3 px-3 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl">
                            <p className="text-xs font-black text-white text-center">
                              ✨ 已完成！点击领取
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
