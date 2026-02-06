import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
}

interface PillTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: any) => void;
  className?: string;
}

export function PillTabs({ tabs, activeId, onChange, className = "" }: PillTabsProps) {
  return (
    <div className={`relative z-10 flex overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-[24px] border border-gray-100/50 dark:border-transparent ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-5 py-2.5 rounded-[20px] text-[13px] font-black transition-all duration-300 ${
              isActive
                ? "bg-white dark:bg-gray-800 text-[#FF4D94] shadow-sm shadow-gray-200/50 dark:shadow-none scale-[1.02]"
                : "text-gray-500 dark:text-gray-400 hover:text-[#FF4D94] dark:hover:text-[#FF4D94]"
            }`}
          >
            {tab.icon && (
              <span className="text-base leading-none shrink-0 group-hover:scale-110 transition-transform">
                {tab.icon}
              </span>
            )}
            <span className="truncate tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
