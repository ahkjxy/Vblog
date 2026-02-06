import { Icon } from "./Icon";

interface MobileNavProps {
  activeTab: "dashboard" | "earn" | "redeem" | "history" | "settings" | "achievements";
  onChangeTab: (tab: MobileNavProps["activeTab"]) => void;
  isAdmin: boolean;
}

export function MobileNav({ activeTab, onChangeTab, isAdmin }: MobileNavProps) {
  const tabs = [
    { id: "dashboard", label: "概览", icon: "home" },
    { id: "earn", label: "任务", icon: "plus" },
    { id: "redeem", label: "商店", icon: "reward" },
    { id: "history", label: "账单", icon: "history" },
    { id: "achievements", label: "成就", icon: "reward" },
    ...(isAdmin ? [{ id: "settings", label: "管理", icon: "settings" }] : []),
  ];

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-40 mx-auto w-[92%] max-w-sm lg:hidden pointer-events-none">
      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-white/40 dark:border-white/5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-1.5 flex items-stretch gap-1 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as MobileNavProps["activeTab"])}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3.5 rounded-[1.8rem] transition-all duration-500 relative group ${
                isActive
                  ? "bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white shadow-xl shadow-[#FF4D94]/30 scale-[1.02] -translate-y-1"
                  : "text-gray-400 dark:text-gray-600 hover:text-[#FF4D94]"
              }`}
            >
              <div className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-active:scale-90'}`}>
                <Icon name={tab.icon} size={20} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${isActive ? 'opacity-100 mt-0.5' : 'opacity-60 scale-90'}`}>{tab.label}</span>
              {isActive && (
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-sm animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
