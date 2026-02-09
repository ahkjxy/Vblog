import { useState } from 'react';
import { Profile } from '../types';
import { Icon } from './Icon';
import { ThemeMode } from './ThemeProvider';
import { ActionDrawer } from './ActionDrawer';
import { Language, useTranslation } from '../i18n/translations';

interface HeaderBarProps {
  activeTab: 'dashboard' | 'earn' | 'redeem' | 'history' | 'settings' | 'doc' | 'achievements';
  currentProfile: Profile;
  isAdmin: boolean;
  theme: ThemeMode;
  language: Language;
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Language) => void;
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

export function HeaderBar({ 
  activeTab, 
  currentProfile, 
  isAdmin, 
  theme, 
  language,
  onToggleTheme, 
  onChangeLanguage,
  onPrint, 
  onLogout, 
  onTransfer, 
  onWishlist, 
  onSwitchProfile, 
  profiles, 
  chatUnreadCount, 
  onToggleChat, 
  onRefresh, 
  isSyncing, 
  onOpenSearch 
}: HeaderBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t, replace } = useTranslation(language);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 mb-4 sm:mb-6 lg:mb-8 shadow-sm">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* 左侧：标题区域 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-lg lg:text-2xl font-black text-gray-900 dark:text-white font-display leading-tight tracking-tight truncate">
                {activeTab === 'dashboard' && replace(t.pageTitle.dashboard, { name: currentProfile.name })}
                {activeTab === 'earn' && t.pageTitle.earn}
                {activeTab === 'redeem' && t.pageTitle.redeem}
                {activeTab === 'history' && t.pageTitle.history}
                {activeTab === 'settings' && t.pageTitle.settings}
                {activeTab === 'achievements' && t.pageTitle.achievements}
              </h2>
              {isSyncing && (
                <div className="hidden sm:flex flex-shrink-0 w-4 h-4 border-2 border-[#FF4D94] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <p className="hidden sm:block text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium truncate mt-0.5">
              {activeTab === 'dashboard' && t.pageDesc.dashboard}
              {activeTab === 'earn' && t.pageDesc.earn}
              {activeTab === 'redeem' && t.pageDesc.redeem}
              {activeTab === 'history' && t.pageDesc.history}
              {activeTab === 'settings' && t.pageDesc.settings}
              {activeTab === 'achievements' && t.pageDesc.achievements}
            </p>
          </div>

          {/* 右侧：操作按钮区域 - 移动端显示常用功能 + 更多按钮 */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-shrink-0">
            {/* 转赠按钮 - 始终显示 */}
            {onTransfer && (
              <button
                onClick={onTransfer}
                title={t.buttons.transfer}
                className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl lg:rounded-2xl hover:brightness-110 transition-all flex items-center justify-center shadow-lg shadow-[#FF4D94]/20 hover:shadow-xl hover:shadow-[#FF4D94]/30 hover:scale-105 active:scale-95"
              >
                <Icon name="gift" size={16} className="lg:hidden" />
                <Icon name="gift" size={18} className="hidden lg:block" />
              </button>
            )}

            {/* 聊天按钮 - 移动端显示 */}
            {onToggleChat && (
              <button
                onClick={onToggleChat}
                title={t.buttons.chat}
                className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-xl lg:rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#FF4D94] hover:text-[#FF4D94] transition-all flex items-center justify-center shadow-sm relative"
              >
                <Icon name="message-circle" size={16} className="lg:hidden" />
                <Icon name="message-circle" size={18} className="hidden lg:block" />
                {chatUnreadCount && chatUnreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-[8px] sm:text-[9px] font-black text-white bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center rounded-full shadow-lg ring-1 sm:ring-2 ring-white dark:ring-gray-900">
                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                  </span>
                ) : null}
              </button>
            )}

            {/* 工具按钮组 */}
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-100/50 dark:bg-white/5 rounded-xl lg:rounded-2xl">
              {/* 主题切换按钮 */}
              <button
                onClick={onToggleTheme}
                title={t.buttons.theme}
                className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-[#7C4DFF] hover:shadow-md transition-all flex items-center justify-center"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} className="lg:hidden" />
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} className="hidden lg:block" />
              </button>

              {/* 更多按钮 - 打开抽屉 */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                title={t.buttons.more}
                className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-[#7C4DFF] hover:shadow-md transition-all flex items-center justify-center"
              >
                <Icon name="more-vertical" size={14} className="lg:hidden" />
                <Icon name="more-vertical" size={16} className="hidden lg:block" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 抽屉菜单 */}
      <ActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentProfile={currentProfile}
        profiles={profiles}
        theme={theme}
        language={language}
        onToggleTheme={onToggleTheme}
        onChangeLanguage={onChangeLanguage}
        onOpenSearch={onOpenSearch}
        onWishlist={onWishlist}
        onRefresh={onRefresh}
        onPrint={onPrint}
        onLogout={onLogout}
        onSwitchProfile={onSwitchProfile}
        isSyncing={isSyncing}
      />
    </>
  );
}
