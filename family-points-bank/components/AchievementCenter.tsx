import { Profile } from "../types";
import { BadgeSection } from "./BadgeSection";
import { Icon } from "./Icon";

interface AchievementCenterProps {
  currentProfile: Profile;
  familyId: string;
  onRefresh?: () => Promise<void>;
}

export function AchievementCenter({ currentProfile, familyId, onRefresh }: AchievementCenterProps) {
  const badgeCount = currentProfile.badges?.length || 0;
  const level = currentProfile.level || 1;
  const balance = currentProfile.balance || 0;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm p-6 sm:p-8 mobile-card">
        {/* Background Decoration */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          {/* Title Section */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF4D94]/10 text-[#FF4D94] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] animate-pulse"></div>
              成就徽章
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-2">
              成就徽章中心
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              已获得 {badgeCount} 个徽章，继续加油！
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* 已获得徽章 */}
            <div className="bg-gradient-to-br from-[#FF4D94]/5 to-[#FF4D94]/10 dark:bg-white/10 p-4 sm:p-5 rounded-2xl border border-[#FF4D94]/20 dark:border-white/10 transition-all hover:border-[#FF4D94]/40 dark:hover:border-[#FF4D94]/30 hover:shadow-md hover:shadow-[#FF4D94]/10 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#FF6BA9] dark:bg-white/20 text-white mb-3 mx-auto shadow-lg shadow-[#FF4D94]/20 group-hover:scale-110 transition-transform">
                <Icon name="reward" size={20} />
              </div>
              <p className="text-[10px] font-bold text-[#FF4D94]/70 dark:text-gray-400 uppercase tracking-widest text-center mb-1">
                已获得
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#FF4D94] dark:text-gray-200 text-center points-font">
                {badgeCount}
              </p>
            </div>

            {/* 当前等级 */}
            <div className="bg-gradient-to-br from-[#7C4DFF]/5 to-[#7C4DFF]/10 dark:bg-white/10 p-4 sm:p-5 rounded-2xl border border-[#7C4DFF]/20 dark:border-white/10 transition-all hover:border-[#7C4DFF]/40 dark:hover:border-[#7C4DFF]/30 hover:shadow-md hover:shadow-[#7C4DFF]/10 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#7C4DFF] to-[#9D6FFF] dark:bg-white/20 text-white mb-3 mx-auto shadow-lg shadow-[#7C4DFF]/20 group-hover:scale-110 transition-transform">
                <Icon name="award" size={20} />
              </div>
              <p className="text-[10px] font-bold text-[#7C4DFF]/70 dark:text-gray-400 uppercase tracking-widest text-center mb-1">
                当前等级
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#7C4DFF] dark:text-gray-200 text-center points-font">
                {level}
              </p>
            </div>

            {/* 元气余额 */}
            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 dark:bg-white/10 p-4 sm:p-5 rounded-2xl border border-emerald-500/20 dark:border-white/10 transition-all hover:border-emerald-500/40 dark:hover:border-emerald-400/30 hover:shadow-md hover:shadow-emerald-500/10 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 dark:bg-white/20 text-white mb-3 mx-auto shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Icon name="shield" size={20} />
              </div>
              <p className="text-[10px] font-bold text-emerald-500/70 dark:text-gray-400 uppercase tracking-widest text-center mb-1">
                元气余额
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-gray-200 text-center points-font">
                {balance}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Section */}
      <BadgeSection 
        profile={currentProfile}
        familyId={familyId}
        onBadgeClaimed={() => {}}
      />
    </div>
  );
}
