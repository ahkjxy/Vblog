import { Task, Profile } from "../types";
import { Icon } from "./Icon";
import { PillTabs } from "./PillTabs";
import { Pagination } from "./Pagination";
import { calculateLevelInfo, getProfileTotalEarned } from "../utils/leveling";
import { useState, useMemo, useEffect } from "react"; // Added missing imports

interface EarnSectionProps {
  tasks: Task[];
  onSelectTask: (payload: { title: string; points: number; type: "earn" | "penalty" }) => void;
  currentProfile: Profile;
}

export function EarnSection({ tasks, onSelectTask, currentProfile }: EarnSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categoryTabs = [
    { id: "all", label: "全部任务", icon: "✨" },
    { id: "learning", label: "学习习惯", icon: "📘" },
    { id: "chores", label: "家务帮手", icon: "🧹" },
    { id: "discipline", label: "自律养成", icon: "⏰" },
    { id: "penalty", label: "违规警示", icon: "⚠️" },
  ];

  const getMeta = (cat: string) => {
    switch (cat) {
      case "learning":
        return {
          chip: "📘",
          tone: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
        };
      case "chores":
        return {
          chip: "🧹",
          tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
        };
      case "discipline":
        return {
          chip: "⏰",
          tone: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
        };
      case "penalty":
        return {
          chip: "⚠️",
          tone: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
        };
      default:
        return {
          chip: "✨",
          tone: "text-[#FF4D94] bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400",
        };
    }
  };

  const filtered = useMemo<Task[]>(() => {
    const sorted = [...tasks].sort((a, b) => b.points - a.points); // Sort by highest points first
    if (activeTab === "all") return sorted;
    return sorted.filter((t: Task) => t.category === activeTab);
  }, [activeTab, tasks]);

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

  const stats = useMemo(() => {
    const total = tasks.length;
    const daily = tasks.filter((t) => (t.frequency || "").includes("日")).length;
    const highValue = tasks.filter((t) => t.points >= 5).length;
    return { total, daily, highValue };
  }, [tasks]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-4 sm:p-6 lg:p-8 mobile-card">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 blur-[60px] rounded-full"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="flex-1 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D94]/10 text-[#FF4D94] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] animate-pulse"></div>
                任务中心
              </div>
              <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                元气任务工场
              </h3>
            </div>
            
            {/* 个人进度看板 - 精致重构版 */}
            <div className="flex items-center gap-5 p-5 rounded-[32px] bg-gray-50/80 dark:bg-white/5 border border-white/40 dark:border-white/5 max-w-lg shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] group/progress relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D94]/5 to-transparent opacity-0 group-hover/progress:opacity-100 transition-opacity duration-700" />
               
               <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-transform group-hover/progress:scale-110 bg-white dark:bg-gray-800 ${calculateLevelInfo(getProfileTotalEarned(currentProfile)).color} relative z-10`}>
                  <Icon name={calculateLevelInfo(getProfileTotalEarned(currentProfile)).icon as any} size={28} />
               </div>
               <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest opacity-80">{calculateLevelInfo(getProfileTotalEarned(currentProfile)).name}</p>
                    <p className="text-[10px] font-black tabular-nums text-[#FF4D94] bg-[#FF4D94]/10 px-2 py-0.5 rounded-full">LV.{calculateLevelInfo(getProfileTotalEarned(currentProfile)).level}</p>
                  </div>
                  <div className="h-2 w-full bg-white dark:bg-black/40 rounded-full overflow-hidden p-[1px] shadow-inner">
                     <div 
                       className="h-full bg-gradient-to-r from-[#FF4D94] via-[#FF7AB8] to-[#7C4DFF] rounded-full transition-all duration-1000 relative" 
                       style={{ width: `${calculateLevelInfo(getProfileTotalEarned(currentProfile)).progress}%` }}
                     >
                       <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite] -skew-x-12" />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex gap-3 lg:gap-4 lg:min-w-[420px] mb-2">
            {[
              { label: "任务库", val: stats.total, sub: "总数", color: "text-gray-900 dark:text-white" },
              { label: "每日必做", val: stats.daily, sub: "每日", color: "text-emerald-500" },
              { label: "高额挑战", val: stats.highValue, sub: "高额", color: "text-[#7C4DFF]" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex-1 bg-white dark:bg-black/20 p-5 rounded-[28px] border border-gray-100 dark:border-white/5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  {s.label}
                </p>
                <p className={`text-2xl lg:text-3xl font-black points-font ${s.color}`}>
                  {s.val}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter opacity-50 mt-1">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-1 px-1 rounded-[24px] lg:rounded-[32px] bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <PillTabs
            tabs={categoryTabs}
            activeId={activeTab}
            onChange={setActiveTab}
            className="!mt-0"
          />
        </div>
      </div>

      {/* Task Grid - Single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {paginatedData.map((task: Task) => {
          const meta = getMeta(task.category);
          const isPenalty = task.category === "penalty";
          return (
            <button
              key={task.id}
              onClick={() =>
                onSelectTask({
                  title: task.title,
                  points: task.points,
                  type: isPenalty ? "penalty" : "earn",
                })
              }
              className={`group relative text-left w-full p-3.5 sm:p-4 rounded-[20px] sm:rounded-[24px] bg-white dark:bg-[#0F172A] border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] active:scale-[0.96] mobile-card animate-in fade-in slide-in-from-bottom-2 ${
                isPenalty
                  ? "border-gray-100 dark:border-white/5 hover:border-rose-200"
                  : "border-gray-100 dark:border-white/5 hover:border-[#FF4D94]/30"
              }`}
            >
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base sm:text-xl shadow-inner transition-transform group-hover:rotate-12 duration-500 ${meta.tone}`}
                >
                  {meta.chip}
                </div>
                <div
                  className={`px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black points-font shadow-sm ${
                    task.points > 0
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                  }`}
                >
                  {task.points > 0 ? "+" : ""}
                  {task.points}
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight group-hover:text-[#FF4D94] transition-colors line-clamp-1 leading-tight">
                  {task.title}
                </h4>
                <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-1 sm:line-clamp-2 leading-snug">
                  {task.description || "完成后请点击记录"}
                </p>
              </div>

              <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                  {task.frequency || "随时"}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-[#FF4D94] group-hover:text-white transition-all">
                  <Icon name="plus" size={10} className="sm:hidden" />
                  <Icon name="plus" size={12} className="hidden sm:block" />
                </div>
              </div>
            </button>
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
        />
      )}

      {filtered.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-white/50 dark:bg-white/5 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
          <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-4xl opacity-50">
            📋
          </div>
          <p className="text-lg font-black text-gray-400 uppercase tracking-widest">
            暂无该分类任务
          </p>
        </div>
      )}
    </div>
  );
}
