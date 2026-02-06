import React, { useState, useMemo, useEffect, useRef } from 'react';
import { pinyin } from 'pinyin-pro';
import { Task, Reward, Profile } from '../types';
import { Icon } from './Icon';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  rewards: Reward[];
  profiles: Profile[];
  onGoTab: (tab: string) => void;
  onSelectTask: (payload: { title: string; points: number; type: 'earn' }) => void;
  onRedeem: (payload: { title: string; points: number; type: 'redeem' }) => void;
  onWishlist: () => void;
  onTransfer: () => void;
  onSwitchProfile: (id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  rewards,
  profiles,
  onGoTab,
  onSelectTask,
  onRedeem,
  onWishlist,
  onTransfer,
  onSwitchProfile,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navItems = [
    { id: 'dashboard', label: '银行仪表盘', icon: 'home', type: 'page', color: 'indigo' },
    { id: 'earn', label: '赚取元气任务', icon: 'plus', type: 'page', color: 'emerald' },
    { id: 'redeem', label: '梦想商店兑换', icon: 'reward', type: 'page', color: 'rose' },
    { id: 'history', label: '能量账单流水', icon: 'history', type: 'page', color: 'slate' },
    { id: 'settings', label: '系统设置', icon: 'settings', type: 'page', color: 'slate' },
    { id: 'achievements', label: '我的成就', icon: 'award', type: 'page', color: 'emerald' },
    { id: 'wishlist', label: '添加愿望清单', icon: 'heart', type: 'wishlist', color: 'rose' },
    { id: 'transfer', label: '转赠元气积分', icon: 'gift', type: 'transfer', color: 'indigo' },
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const checkMatch = (text: string) => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      if (lowerText.includes(q)) return true;
      const fullPinyin = pinyin(text, { toneType: 'none', type: 'array' }).join('').toLowerCase();
      if (fullPinyin.includes(q)) return true;
      const initials = pinyin(text, { pattern: 'initial', toneType: 'none', type: 'array' }).join('').toLowerCase();
      if (initials.includes(q)) return true;
      return false;
    };

    const matchedNav = navItems.filter(i => checkMatch(i.label));
    const matchedTasks = tasks.filter(t => checkMatch(t.title)).slice(0, 8);
    const matchedRewards = rewards.filter(r => checkMatch(r.title) && (r.status === 'active' || !r.status)).slice(0, 8);
    const matchedProfiles = profiles.filter(p => checkMatch(p.name)).slice(0, 5);

    return [
      ...matchedNav.map(i => ({ ...i, category: '常用操作' })),
      ...matchedProfiles.map(p => ({ id: p.id, label: p.name, type: 'profile', category: '家庭成员', avatarColor: p.avatarColor, original: p })),
      ...matchedTasks.map(t => ({ id: t.id, label: t.title, points: t.points, type: 'task', category: '赚取能量', original: t })),
      ...matchedRewards.map(r => ({ id: r.id, label: r.title, points: r.points, type: 'reward', category: '梦想商店', original: r })),
    ];
  }, [query, tasks, rewards, profiles]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle Auto-Scroll
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  const handleAction = (item: any) => {
    if (!item) return;
    if (item.type === 'page') onGoTab(item.id);
    else if (item.type === 'task') onSelectTask({ title: item.original.title, points: item.original.points, type: 'earn' });
    else if (item.type === 'reward') onRedeem({ title: item.original.title, points: -item.original.points, type: 'redeem' });
    else if (item.type === 'wishlist') onWishlist();
    else if (item.type === 'transfer') onTransfer();
    else if (item.type === 'profile') onSwitchProfile(item.id);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (results.length || 1)) % (results.length || 1));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) handleAction(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-[36px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col glass-card">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-50 dark:border-white/5 bg-gray-50/20 dark:bg-white/2">
          <div className="relative flex items-center group">
            <div className={`absolute left-5 transition-all duration-500 ${query ? 'text-[#FF4D94] scale-110' : 'text-gray-400 group-focus-within:text-[#FF4D94]'}`}>
              <Icon name={query ? 'zap' : 'search'} size={query ? 26 : 24} className={query ? 'animate-pulse' : ''} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索任务、商品、成员或操作..."
              className="w-full h-16 pl-16 pr-12 bg-white/50 dark:bg-black/20 rounded-[20px] text-xl font-black text-gray-900 dark:text-white placeholder:text-gray-400/60 outline-none focus:ring-4 focus:ring-[#FF4D94]/10 transition-all border border-transparent shadow-inner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-5 w-8 h-8 rounded-full bg-gray-200/50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Results Body */}
        <div 
          ref={scrollRef}
          className="max-h-[50vh] overflow-y-auto p-4 no-scrollbar min-h-[300px]"
        >
          {query.trim() === '' ? (
            <div className="space-y-8 py-6">
               <div className="px-3">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-[#FF4D94] uppercase tracking-[0.3em]">常用目的地</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {navItems.slice(0, 6).map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleAction(item)}
                        className="p-4 rounded-3xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-[#7C4DFF]/30 hover:bg-white dark:hover:bg-white/10 transition-all text-left flex items-center gap-4 group active:scale-95"
                      >
                        <div className={`w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${
                          item.color === 'indigo' ? 'bg-[#7C4DFF]/10 text-[#7C4DFF]' :
                          item.color === 'rose' ? 'bg-[#FF4D94]/10 text-[#FF4D94]' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                           <Icon name={item.icon} size={20} />
                        </div>
                        <span className="text-[13px] font-black text-gray-700 dark:text-gray-300 leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
               </div>
               <div className="px-3">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">快捷功能</p>
                  <div className="flex flex-wrap gap-2.5">
                    {navItems.slice(6).map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => handleAction(item)}
                        className={`px-5 py-3 rounded-[16px] text-xs font-black transition-all flex items-center gap-2 border border-transparent hover:-translate-y-0.5 active:scale-95 ${
                          item.id === 'wishlist' 
                            ? 'bg-[#FF4D94]/10 text-[#FF4D94] hover:bg-[#FF4D94] hover:text-white' 
                            : 'bg-[#7C4DFF]/10 text-[#7C4DFF] hover:bg-[#7C4DFF] hover:text-white'
                        }`}
                      >
                        <Icon name={item.icon} size={14} />
                        {item.label}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Usage Guide */}
               <div className="px-3 pt-4">
                  <div className="p-5 rounded-[24px] bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="zap" size={16} className="text-[#FF4D94]" />
                      <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">搜索指南 & 技巧</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">可搜索内容</p>
                        <ul className="space-y-1">
                          <li className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-[#FF4D94]"></div>
                             元气任务与梦想商店条目
                          </li>
                          <li className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-[#7C4DFF]"></div>
                             家庭成员姓名 (支持快速切号)
                          </li>
                          <li className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                             页面标题与快捷系统指令
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">高效触发技巧</p>
                        <ul className="space-y-1">
                          <li className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                             <span className="px-1 py-0.5 rounded bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px]">RW</span>
                             输入拼音首字母快速定位
                          </li>
                          <li className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                             <span className="px-1 py-0.5 rounded bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px]">Enter</span>
                             选中结果后按回车直接执行
                          </li>
                          <li className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                             <span className="px-1 py-0.5 rounded bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px]">↑↓</span>
                             全程键盘控制，无需鼠标
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6 py-2">
              {['常用操作', '家庭成员', '赚取能量', '梦想商店'].map(cat => {
                const catResults = results.filter(r => r.category === cat);
                if (catResults.length === 0) return null;
                
                return (
                  <div key={cat} className="space-y-1">
                    <p className="px-5 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mb-3">{cat}</p>
                    <div className="grid grid-cols-1 gap-1">
                      {catResults.map((item: any) => {
                        const itemIndex = results.indexOf(item);
                        const isActive = itemIndex === selectedIndex;
                        return (
                          <button
                            key={`${item.category}-${item.id}`}
                            data-selected={isActive}
                            onClick={() => handleAction(item)}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                            className={`flex items-center gap-5 p-4 rounded-[20px] transition-all text-left relative group ${
                              isActive 
                                ? 'bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/5 dark:from-white/10 dark:to-white/5 ring-1 ring-[#FF4D94]/20' 
                                : 'hover:bg-gray-50/50 dark:hover:bg-white/5'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-[#FF4D94] to-[#7C4DFF] rounded-full shadow-[0_0_15px_rgba(255,77,148,0.4)] animate-in slide-in-from-left duration-300"></div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                              isActive ? 'scale-110 shadow-lg' : 'shadow-sm group-hover:scale-105'
                            } ${
                              item.type === 'page' || item.type === 'wishlist' || item.type === 'transfer' ? 'bg-[#7C4DFF] text-white' :
                              item.type === 'task' ? 'bg-emerald-500 text-white' :
                              item.type === 'reward' ? 'bg-[#FF4D94] text-white' :
                              item.avatarColor || 'bg-slate-500 text-white'
                            } ${item.type === 'profile' ? 'text-xl font-black rotate-[-3deg]' : ''}`}>
                              {item.type === 'profile' ? (
                                item.label.slice(-1)
                              ) : (
                                <Icon name={item.icon || (item.type === 'task' ? 'plus' : 'reward')} size={22} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className={`text-base font-black transition-colors ${isActive ? 'text-[#FF4D94] dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                {item.label}
                              </h4>
                              {item.points && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[11px] font-black points-font ${
                                    item.type === 'task' ? 'text-emerald-500' : 'text-[#FF4D94]'
                                  }`}>
                                    {item.type === 'task' ? '+' : '-'}{Math.abs(item.points)} 元气值
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase">{item.type === 'task' ? '完成任务' : '兑换物品'}</span>
                                </div>
                              )}
                              {item.type === 'profile' && (
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">快速切换到此账户</p>
                              )}
                              {item.type === 'page' && (
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">跳转到系统页面</p>
                              )}
                            </div>

                            {isActive && (
                              <div className="flex items-center gap-2.5 pr-2">
                                <div className="hidden sm:flex bg-gray-900 dark:bg-white/10 text-white px-2.5 py-1 rounded-lg items-center gap-1.5 shadow-xl animate-in slide-in-from-right duration-300">
                                   <span className="text-[10px] font-black tracking-widest">ENTER</span>
                                   <Icon name="arrow-down" size={12} className="-rotate-90 text-[#FF4D94]" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                 <Icon name="search" size={40} className="text-gray-300 animate-pulse" />
              </div>
              <p className="text-xl font-black text-gray-800 dark:text-white tracking-tight">未发现匹配项</p>
              <p className="text-sm text-gray-400 mt-2 font-medium">请尝试搜索其他关键词或拼音首字母</p>
            </div>
          )}
        </div>

        {/* Improved Dashboard Footer */}
        <div className="p-5 bg-gray-100/50 dark:bg-white/2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1">
                <span className="w-6 h-6 flex items-center justify-center rounded bg-gray-900 dark:bg-white/10 text-[10px] font-black text-white shadow-lg shadow-black/20">↑</span>
                <span className="w-6 h-6 flex items-center justify-center rounded bg-gray-900 dark:bg-white/10 text-[10px] font-black text-white shadow-lg shadow-black/20">↓</span>
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">选择</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-1 rounded bg-gray-900 dark:bg-white/10 text-[10px] font-black text-white uppercase shadow-lg shadow-black/20">Enter</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">确认</span>
            </div>
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="px-2 py-1 rounded bg-gray-900 dark:bg-white/10 text-[10px] font-black text-white uppercase shadow-lg shadow-black/20">Esc</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">返回</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-gray-800"></div>
             </div>
             <p className="text-[9px] font-black text-[#FF4D94] uppercase tracking-[0.25em]">Alpha Pinyin v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};
