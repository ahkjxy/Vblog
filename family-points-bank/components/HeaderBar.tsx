import { Profile } from '../types';
import { Icon } from './Icon';
import { ThemeMode } from './ThemeProvider';

interface HeaderBarProps {
  activeTab: 'dashboard' | 'earn' | 'redeem' | 'history' | 'settings' | 'doc' | 'achievements';
  currentProfile: Profile;
  isAdmin: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onPrint: () => void;
  onLogout: () => void;
  onTransfer?: () => void;
  onWishlist?: () => void;
  onSwitchProfile?: (id: string) => void;
  profiles: Profile[];
  chatUnreadCount?: number;
  onToggleChat?: () => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  onOpenSearch?: () => void;
}

export function HeaderBar({ activeTab, currentProfile, isAdmin, theme, onToggleTheme, onPrint, onLogout, onTransfer, onWishlist, onSwitchProfile, profiles, chatUnreadCount, onToggleChat, onRefresh, isSyncing, onOpenSearch }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/40 dark:border-white/5 px-4 lg:px-6 py-4 mb-6 lg:mb-8 rounded-b-[32px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white font-display leading-tight tracking-tight">
              {activeTab === 'dashboard' && `您好, ${currentProfile.name} 👋`}
              {activeTab === 'earn' && '元气任务'}
              {activeTab === 'redeem' && '梦想商店'}
              {activeTab === 'history' && '能量账单'}
              {activeTab === 'settings' && '系统配置中心'}
              {activeTab === 'achievements' && '个人成就荣誉'}
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">
            {activeTab === 'dashboard' && '查看您的当前元气值与近期动态'}
            {activeTab === 'earn' && '完成任务即可获得更多元气能量'}
            {activeTab === 'redeem' && '挑选心仪的梦想奖励'}
            {activeTab === 'history' && '追踪每一笔元气能量的流动'}
            {activeTab === 'settings' && '管理银行核心规则与成员名单'}
            {activeTab === 'achievements' && '见证成长足迹，解锁更多可能'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 lg:gap-3">
          {/* Quick Profile Switcher */}
          <div className="flex -space-x-2 mr-2">
            {profiles.slice(0, 4).map(p => (
              <div key={p.id} className="tooltip-container">
                <button
                  onClick={() => onSwitchProfile?.(p.id)}
                  className={`w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 shadow-md flex items-center justify-center overflow-hidden ${
                    currentProfile.id === p.id 
                      ? 'border-[#FF4D94] z-10 scale-105' 
                      : 'border-white dark:border-gray-800'
                  }`}
                >
                  <div className={`w-full h-full flex items-center justify-center text-white text-[11px] font-black ${p.avatarColor || 'bg-gray-400'}`}>
                    {p.name.slice(-1)}
                  </div>
                </button>
                <div className="tooltip-cute">切换到 {p.name}</div>
              </div>
            ))}
            {profiles.length > 4 && (
              <button 
                onClick={() => onSwitchProfile?.(currentProfile.id)}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 border-2 border-white dark:border-gray-800 flex items-center justify-center text-gray-400 text-[10px] font-black hover:bg-gray-200 transition-all"
              >
                +{profiles.length - 4}
              </button>
            )}
          </div>

          {onTransfer && (
            <div className="tooltip-container">
              <button
                onClick={onTransfer}
                className="h-12 w-12 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
              >
                <Icon name="gift" size={20} />
              </button>
              <div className="tooltip-cute text-[#FF4D94]">转赠元气</div>
            </div>
          )}
          
          {onWishlist && (
            <div className="tooltip-container">
              <button
                onClick={onWishlist}
                className="h-12 w-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center shadow-sm"
              >
                <Icon name="reward" size={18} />
              </button>
              <div className="tooltip-cute">添加许愿</div>
            </div>
          )}

          {onToggleChat && (
            <div className="tooltip-container">
              <button
                onClick={onToggleChat}
                className="h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#FF4D94] hover:text-[#FF4D94] transition-all flex items-center justify-center shadow-sm relative group"
              >
                <Icon name="message-circle" size={18} />
                {chatUnreadCount && chatUnreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[9px] font-black text-white bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center rounded-full shadow-lg ring-2 ring-white dark:ring-gray-900 group-hover:scale-110 transition-transform animate-bounce">
                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                  </span>
                ) : null}
              </button>
              <div className="tooltip-cute font-black text-[#FF4D94]">聊天同步</div>
            </div>
          )}

          {onOpenSearch && (
            <div className="tooltip-container">
              <button
                onClick={onOpenSearch}
                className="h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-all flex items-center justify-center shadow-sm relative group"
              >
                <Icon name="search" size={18} />
                <span className="hidden lg:block absolute -bottom-1 -right-1 px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[8px] font-black text-gray-400 border border-white dark:border-gray-700">⌘K</span>
              </button>
              <div className="tooltip-cute">全局搜索</div>
            </div>
          )}

          {/* Blog Link */}
          <div className="tooltip-container">
            <a
              href="https://blog.familybank.chat"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 dark:from-[#FF4D94]/20 dark:to-[#7C4DFF]/20 border border-[#FF4D94]/20 dark:border-[#FF4D94]/30 text-[#FF4D94] hover:border-[#FF4D94] hover:shadow-lg hover:shadow-[#FF4D94]/20 transition-all flex items-center justify-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] opacity-0 group-hover:opacity-10 transition-opacity" />
              <Icon name="book-open" size={18} />
            </a>
            <div className="tooltip-cute text-[#FF4D94]">访问博客</div>
          </div>

          {onRefresh && (
            <div className="tooltip-container">
              <button
                onClick={onRefresh}
                disabled={isSyncing}
                className={`h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#10B981] hover:text-[#10B981] transition-all flex items-center justify-center shadow-sm relative group ${isSyncing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Icon name="refresh-cw" size={18} className={isSyncing ? "animate-spin" : ""} />
              </button>
              <div className="tooltip-cute">手动刷新</div>
            </div>
          )}

          <div className="flex items-center gap-1.5 p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl">
            {isAdmin && (
              <div className="tooltip-container">
                <button
                  onClick={onPrint}
                  className="h-10 w-10 rounded-[14px] bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-[#7C4DFF] hover:shadow-md transition-all flex items-center justify-center"
                >
                  <Icon name="print" size={16} />
                </button>
                <div className="tooltip-cute">打印报表</div>
              </div>
            )}
            <div className="tooltip-container">
              <button
                onClick={onToggleTheme}
                className="h-10 w-10 rounded-[14px] bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-[#7C4DFF] hover:shadow-md transition-all flex items-center justify-center"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
              </button>
              <div className="tooltip-cute">{theme === 'dark' ? '日间模式' : '夜间模式'}</div>
            </div>
            <div className="tooltip-container">
              <button
                onClick={onLogout}
                className="h-10 w-10 rounded-[14px] bg-white dark:bg-white/10 text-rose-500 hover:bg-rose-50 hover:shadow-md transition-all flex items-center justify-center"
              >
                <Icon name="logout" size={16} />
              </button>
              <div className="tooltip-cute text-rose-500">退出登录</div>
            </div>
          </div>

          <div className="flex-1 lg:flex-none pl-3 pr-5 py-2.5 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-[24px] shadow-[0_12px_24px_-8px_rgba(255,77,148,0.4)] flex items-center gap-3.5 min-w-[160px] group hover:scale-[1.02] transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-xl shadow-inner group-hover:rotate-12 transition-transform">⚡</div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">账户元气值</span>
              <span className="text-2xl font-black text-white points-font">{currentProfile.balance}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
