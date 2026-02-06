import React, { useEffect, useMemo, useState } from 'react';
import { Transaction } from '../types';
import { formatDateTime } from '../utils/datetime';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from './Icon';
import { PillTabs } from './PillTabs';
import { Pagination } from './Pagination';

type HistoryTab = 'all' | 'earn' | 'penalty' | 'redeem' | 'transfer' | 'lottery' | 'exchange' | 'system';

interface HistorySectionProps {
  history: Transaction[];
  isAdmin?: boolean;
  onDeleteTransactions?: (ids: string[]) => Promise<boolean>;
}

export function HistorySection({ history, isAdmin = false, onDeleteTransactions }: HistorySectionProps) {
  const { showToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    tone?: 'primary' | 'danger';
    onConfirm: () => void;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');

  const historyTabs = [
    { id: 'all', label: '全部', icon: '🧾' },
    { id: 'earn', label: '收入', icon: '💰' },
    { id: 'penalty', label: '支出', icon: '⚠️' },
    { id: 'redeem', label: '商城', icon: '🎁' },
    { id: 'lottery', label: '抽奖', icon: '🎡' },
    { id: 'transfer', label: '转赠', icon: '💝' },
    { id: 'system', label: '系统', icon: '⚙️' },
  ];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const canDelete = isAdmin && typeof onDeleteTransactions === 'function';
  const closeConfirm = () => setConfirmDialog(null);

  const filtered = useMemo(() => {
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    if (activeTab === 'all') return sorted;
    return sorted.filter(h => h.type === activeTab);
  }, [activeTab, history]);

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
    const total = history.length;
    const earn = history.filter(h => h.type === 'earn' || h.type === 'lottery' || h.type === 'system');
    const penalty = history.filter(h => h.type === 'penalty' || h.type === 'exchange');
    const redeem = history.filter(h => h.type === 'redeem');
    const transfers = history.filter(h => h.type === 'transfer');
    const now = Date.now();
    const week = history.filter(h => now - h.timestamp <= 7 * 24 * 60 * 60 * 1000).length;
    const sum = (list: Transaction[]) => list.reduce((s, h) => s + h.points, 0);
    return {
      total,
      week,
      earnCount: earn.length,
      earnPoints: sum(earn),
      penaltyCount: penalty.length,
      penaltyPoints: sum(penalty),
      redeemCount: redeem.length,
      redeemPoints: sum(redeem),
      transferCount: transfers.length,
      net: sum(history),
    };
  }, [history]);

  const renderTypeBadge = (type: Transaction['type']) => {
    const map: Record<Transaction['type'], { label: string; cls: string; icon: string }> = {
      earn: { label: '收入', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent', icon: 'plus' },
      penalty: { label: '支出', cls: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-transparent', icon: 'penalty' },
      redeem: { label: '兑换', cls: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-transparent', icon: 'reward' },
      transfer: { label: '转赠', cls: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-transparent', icon: 'history' },
      lottery: { label: '抽奖', cls: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-transparent', icon: 'reward' },
      exchange: { label: '兑换抽奖', cls: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-transparent', icon: 'history' },
      system: { label: '系统奖励', cls: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-transparent', icon: 'plus' },
    };
    const item = map[type] || map['earn'];
    return <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.cls}`}>{item.label}</span>;
  };

  useEffect(() => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set<string>();
      filtered.forEach((h: Transaction) => {
        if (prev.has(h.id)) next.add(h.id);
      });
      return next;
    });
  }, [filtered]);

  const toggleSelect = (id: string) => {
    if (!canDelete) return;
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!canDelete) return;
    setSelectedIds(new Set(filtered.map((h: Transaction) => h.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchDelete = async () => {
    if (!canDelete || !onDeleteTransactions) return;
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from(selectedIds);
    setConfirmDialog({
      title: `删除选中的 ${idsToDelete.length} 条账单？`,
      description: '删除后会同步更新余额，且不可恢复。',
      confirmText: '确认删除',
      tone: 'danger',
      onConfirm: async () => {
        setIsDeleting(true);
        const ok = await onDeleteTransactions(idsToDelete);
        if (ok) {
          setSelectedIds(new Set());
          showToast({ type: 'success', title: '账单已成功清理' });
        }
        setIsDeleting(false);
        closeConfirm();
      },
    });
  };

  const selectedCount = selectedIds.size;
  const allSelected = filtered.length > 0 && selectedCount === filtered.length;

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Refined Stats Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-white/5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-8 lg:p-10 mobile-card">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 blur-[60px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D94]/10 text-[#FF4D94] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] animate-pulse"></div>
              交易日志
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-1.5 sm:mb-2">
              梦想商店
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
              用努力赚来的元气能量，去兑换那些期待已久的梦想吧！
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            {[
              { label: '全部记录', val: stats.total, color: 'text-gray-900 dark:text-white' },
              { label: '本周活跃', val: stats.week, color: 'text-blue-500' },
              { label: '净能量', val: `${stats.net > 0 ? '+' : ''}${stats.net}`, color: stats.net >= 0 ? 'text-emerald-500' : 'text-rose-500' },
              { label: '兑换数', val: stats.redeemCount, color: 'text-[#7C4DFF]' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-[24px] border border-gray-100 dark:border-transparent text-center">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 truncate">{s.label}</p>
                <p className={`text-xl font-black points-font ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        <PillTabs
          tabs={historyTabs}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as HistoryTab)}
          className="mt-8 lg:mt-10"
        />
      </div>

      {/* Admin Action Bar */}
      {canDelete && selectedCount > 0 && (
        <div className="flex items-center justify-between px-8 py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-gray-900 rounded-[24px] shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#FF4D94] flex items-center justify-center text-xs font-black">{selectedCount}</div>
            <span className="text-sm font-black uppercase tracking-widest">已选记录</span>
          </div>
          <div className="flex gap-3 flex-1 justify-end max-w-[280px]">
            <button 
              onClick={clearSelection} 
              className="btn-base btn-secondary flex-1"
            >
              取消
            </button>
            <button 
              onClick={handleBatchDelete} 
              disabled={isDeleting}
              className="btn-base bg-rose-500 text-white flex-[1.5] shadow-lg shadow-rose-500/20"
            >
              {isDeleting ? '中...' : '永久删除'}
            </button>
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="space-y-3 sm:space-y-4">
        {paginatedData.map((h: Transaction, idx: number) => (
          <div
            key={h.id}
            onClick={() => canDelete && toggleSelect(h.id)}
            className={`group relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-[28px] sm:rounded-[40px] bg-white dark:bg-[#0F172A] border transition-all duration-300 cursor-pointer mobile-card animate-in fade-in slide-in-from-bottom-2 ${
              selectedIds.has(h.id)
                ? "border-[#FF4D94] shadow-[0_15px_30px_-10px_rgba(255,77,148,0.2)] scale-[1.01]"
                : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg dark:hover:shadow-none"
            }`}
          >
            {/* Type Indicator Dot (Vertical Bar Effect) */}
            <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all ${
              h.points > 0 ? "bg-emerald-400" : "bg-rose-400"
            } ${selectedIds.has(h.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}></div>

            {/* Type Icon */}
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-[28px] flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:scale-105 ${
              h.type === 'earn' || h.type === 'system' || h.type === 'lottery' ? 'bg-emerald-50/50 text-emerald-500 dark:bg-emerald-500/10' : 
              h.type === 'penalty' || h.type === 'exchange' ? 'bg-rose-50/50 text-rose-500 dark:bg-rose-500/10' : 
              'bg-indigo-50/50 text-[#7C4DFF] dark:bg-indigo-500/10'
            }`}>
              <Icon 
                name={h.type === 'redeem' ? 'reward' : h.type === 'lottery' ? 'reward' : h.type === 'penalty' || h.type === 'exchange' ? 'penalty' : 'plus'} 
                size={window.innerWidth < 640 ? 20 : 28} 
              />
            </div>

            {/* Info Container */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {renderTypeBadge(h.type)}
                <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest tabular-nums font-mono">
                  {formatDateTime(h.timestamp)}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate pr-2 tracking-tight group-hover:text-[#FF4D94] transition-colors leading-snug">
                {h.title}
              </h4>
            </div>

            {/* Points / Value */}
            <div className="text-right shrink-0">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl sm:text-3xl font-black points-font ${h.points > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {h.points > 0 ? '+' : ''}{h.points}
                </span>
                <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pb-1">
                  元气
                </span>
              </div>
              <p className="text-[8px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] transform -translate-y-1">能量记录</p>
            </div>

            {/* Selection UI (Desktop) */}
            {canDelete && (
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                selectedIds.has(h.id) ? 'bg-[#FF4D94] border-[#FF4D94] scale-110' : 'bg-transparent border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 scale-90'
              }`}>
                {selectedIds.has(h.id) && <Icon name="check" size={10} className="text-white" />}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center gap-4 bg-white/50 dark:bg-white/5 rounded-[40px] border border-dashed border-gray-200 dark:border-white/10">
            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-4xl opacity-50">📑</div>
            <p className="text-lg font-black text-gray-400 uppercase tracking-widest">目前没有任何账单记录</p>
          </div>
        )}
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

      {confirmDialog && (
        <ConfirmDialog
          open
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          tone={confirmDialog.tone === "primary" ? "info" : "danger"}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirm}
        />
      )}
    </div>
  );
}
