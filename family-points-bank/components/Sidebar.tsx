import { Icon } from "./Icon";
import { Profile } from "../types";
import { calculateLevelInfo, getProfileTotalEarned, ROLE_LABELS } from "../utils/leveling";

interface SidebarProps {
  activeTab: "dashboard" | "earn" | "redeem" | "history" | "settings" | "achievements";
  onChangeTab: (tab: SidebarProps["activeTab"]) => void;
  isAdmin: boolean;
  currentProfile: Profile;
  onToggleProfileSwitcher?: () => void;
}

export function Sidebar({
  activeTab,
  onChangeTab,
  isAdmin,
  currentProfile,
  onToggleProfileSwitcher,
}: SidebarProps) {
  const levelInfo = calculateLevelInfo(getProfileTotalEarned(currentProfile));

  return (
    <aside className="glass-sidebar w-64 flex flex-col p-6 h-screen sticky top-0 shrink-0 overflow-hidden border-r border-white/20 dark:border-white/5 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-10 group cursor-pointer">
        <div className="w-11 h-11 bg-gradient-to-br from-[#FF4D94] via-[#FF7AB8] to-[#7C4DFF] rounded-2xl flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(255,77,148,0.5)] group-hover:scale-110 transition-transform duration-300">
          <Icon name="reward" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            元气银行
          </h1>
          <p className="text-[10px] font-bold text-[#FF4D94] uppercase tracking-[0.2em] opacity-80">
            让家庭更美好
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pb-4">
        {[
          { id: "dashboard", icon: "home", label: "账户概览" },
          { id: "earn", icon: "plus", label: "元气任务" },
          { id: "redeem", icon: "reward", label: "梦想商店" },
          { id: "history", icon: "history", label: "能量账单" },
          { id: "achievements", icon: "reward", label: "成就中心" },
          ...(isAdmin ? [{ id: "settings", icon: "settings", label: "系统配置" }] : []),
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as SidebarProps["activeTab"])}
              className={`w-full h-12 flex items-center gap-3.5 px-4 rounded-2xl transition-all duration-300 font-display font-bold text-sm border ${
                isActive
                  ? "bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white border-transparent shadow-[0_8px_16px_-4px_rgba(255,77,148,0.3)]"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:bg-white/60 dark:hover:bg-white/5 hover:text-[#FF4D94] hover:border-[#FF4D94]/10 hover:translate-x-1"
              }`}
            >
              <div
                className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-[#FF4D94]"} transition-colors`}
              >
                <Icon name={tab.icon} size={19} />
              </div>
              <span className="truncate tracking-wide">{tab.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Profile Badge */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
        <button 
          onClick={onToggleProfileSwitcher}
          className="w-full text-left p-4 rounded-3xl bg-gray-50/80 dark:bg-white/5 border border-transparent hover:border-[#FF4D94]/20 hover:bg-white dark:hover:bg-white/10 transition-all group/sidebar-me overflow-hidden relative shadow-sm"
        >
          <div className="absolute -right-8 -bottom-8 w-16 h-16 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5 blur-2xl group-hover/sidebar-me:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
               <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-white font-black text-sm shadow-md transition-transform group-hover/sidebar-me:scale-105 ${currentProfile.avatarColor || 'bg-gray-400'}`}>
                 {currentProfile.name.slice(-1)}
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">{currentProfile.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none flex items-center gap-1">
                    {ROLE_LABELS[currentProfile.role]}
                    <Icon name="settings" size={8} className="opacity-0 group-hover/sidebar-me:opacity-100 transition-opacity ml-1" />
                  </p>
               </div>
            </div>
            {/* ... */}
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-black/20 shadow-sm border border-gray-100 dark:border-white/5">
                  <Icon name={levelInfo.icon as any} size={10} className={levelInfo.color} />
                  <span className={`text-[8px] font-black uppercase ${levelInfo.color}`}>{levelInfo.name}</span>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-[#FF4D94] points-font leading-none">{currentProfile.balance} <span className="text-[7px] font-bold ml-0.5 mt-[-1px] align-middle">元气</span></p>
               </div>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
