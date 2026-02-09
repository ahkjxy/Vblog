import { Icon } from "./Icon";
import { Language, useTranslation } from "../i18n/translations";

interface MobileNavProps {
  activeTab: "dashboard" | "earn" | "redeem" | "history" | "settings" | "achievements";
  onChangeTab: (tab: MobileNavProps["activeTab"]) => void;
  isAdmin: boolean;
  language?: Language;
}

export function MobileNav({ activeTab, onChangeTab, isAdmin, language = 'zh' }: MobileNavProps) {
  const { t } = useTranslation(language);

  const tabs = [
    { id: "dashboard", label: t.nav.dashboard, icon: "home" },
    { id: "earn", label: t.nav.earn, icon: "plus" },
    { id: "redeem", label: t.nav.redeem, icon: "reward" },
    { id: "history", label: t.nav.history, icon: "history" },
    { id: "achievements", label: t.nav.achievements, icon: "reward" },
    ...(isAdmin ? [{ id: "settings", label: t.nav.settings, icon: "settings" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom">
      {/* 背景模糊层 */}
      <div className="absolute inset-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5" />
      
      {/* 导航内容 */}
      <div className="relative px-4 pb-safe">
        <div className="flex items-stretch justify-around h-20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id as MobileNavProps["activeTab"])}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group min-w-0 ${
                  isActive ? '' : 'active:scale-95'
                }`}
              >
                {/* 激活指示器 */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] rounded-full shadow-lg shadow-[#FF4D94]/30" />
                )}
                
                {/* 图标容器 */}
                <div className={`relative transition-all duration-300 ${
                  isActive 
                    ? 'scale-110' 
                    : 'scale-100 group-active:scale-90'
                }`}>
                  {/* 激活背景光晕 */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D94]/20 to-[#7C4DFF]/20 blur-xl rounded-full scale-150" />
                  )}
                  
                  {/* 图标 */}
                  <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg shadow-[#FF4D94]/30'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-active:bg-gray-200 dark:group-active:bg-white/10'
                  }`}>
                    <Icon name={tab.icon} size={isActive ? 22 : 20} />
                  </div>
                </div>
                
                {/* 标签文字 */}
                <span className={`text-[10px] font-black uppercase tracking-wider transition-all duration-300 truncate max-w-full px-1 ${
                  isActive 
                    ? 'text-gray-900 dark:text-white scale-100' 
                    : 'text-gray-400 dark:text-gray-500 scale-95'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
