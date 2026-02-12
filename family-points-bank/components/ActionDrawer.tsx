import { Icon } from './Icon';
import { Profile } from '../types';
import { Language, useTranslation } from '../i18n/translations';

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile;
  profiles: Profile[];
  theme: 'light' | 'dark';
  language: Language;
  onToggleTheme: () => void;
  onChangeLanguage: (lang: Language) => void;
  onOpenSearch?: () => void;
  onWishlist?: () => void;
  onRefresh?: () => void;
  onPrint: () => void;
  onLogout: () => void;
  onSwitchProfile?: (id: string) => void;
  isSyncing?: boolean;
}

export function ActionDrawer({
  isOpen,
  onClose,
  currentProfile,
  profiles,
  theme,
  language,
  onToggleTheme,
  onChangeLanguage,
  onOpenSearch,
  onWishlist,
  onRefresh,
  onPrint,
  onLogout,
  onSwitchProfile,
  isSyncing,
}: ActionDrawerProps) {
  const { t } = useTranslation(language);

  if (!isOpen) return null;

  const otherProfiles = profiles.filter(p => p.id !== currentProfile.id);

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* 抽屉内容 */}
      <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0F172A] shadow-2xl z-[101] overflow-y-auto animate-slide-in-right border-l border-gray-100 dark:border-white/10">
        {/* 头部 - 渐变装饰 */}
        <div className="sticky top-0 bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-transparent dark:from-[#FF4D94]/10 dark:via-[#7C4DFF]/10 border-b border-gray-100 dark:border-white/10 backdrop-blur-xl z-10">
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {t.drawer.title}
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                {currentProfile.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 快捷操作 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-1">
              {t.drawer.quickActions}
            </h4>
            <div className="space-y-2">
              {onOpenSearch && (
                <button
                  onClick={() => {
                    onOpenSearch();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-500/20 dark:hover:to-cyan-500/20 transition-all text-left group border border-blue-100/50 dark:border-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all">
                    <Icon name="search" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 dark:text-white text-sm">
                      {t.buttons.search}
                    </div>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-white/10 rounded text-[10px] border border-gray-200 dark:border-white/20">⌘K</kbd>
                    </div>
                  </div>
                </button>
              )}

              {onWishlist && (
                <button
                  onClick={() => {
                    onWishlist();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-500/20 dark:hover:to-rose-500/20 transition-all text-left group border border-pink-100/50 dark:border-pink-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:shadow-xl group-hover:shadow-pink-500/40 transition-all">
                    <Icon name="heart" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 dark:text-white text-sm">
                      {t.buttons.wishlist}
                    </div>
                  </div>
                </button>
              )}

              <a
                href="https://blog.familybank.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-500/20 dark:hover:to-indigo-500/20 transition-all text-left group border border-purple-100/50 dark:border-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                onClick={onClose}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all">
                  <Icon name="book-open" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-gray-900 dark:text-white text-sm">
                    {t.buttons.blog}
                  </div>
                </div>
                <Icon name="external-link" size={14} className="text-gray-400 dark:text-gray-500" />
              </a>
            </div>
          </div>

          {/* 工具 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-1">
              {t.drawer.tools}
            </h4>
            <div className="space-y-2">
              {onRefresh && (
                <button
                  onClick={() => {
                    onRefresh();
                    onClose();
                  }}
                  disabled={isSyncing}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 flex items-center justify-center ${isSyncing ? 'animate-spin' : ''}`}>
                    <Icon name="refresh-cw" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                      {t.buttons.refresh}
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onPrint();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-left border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <Icon name="printer" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {t.buttons.print}
                  </div>
                </div>
              </button>

              {/* 主题切换 */}
              <button
                onClick={() => {
                  onToggleTheme();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-left border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {theme === 'dark' ? t.buttons.themeLight : t.buttons.themeDark}
                  </div>
                </div>
              </button>

              {/* 语言切换 */}
              <div className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 flex items-center justify-center">
                    <Icon name="globe" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-sm">
                      {t.common.language}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pl-[52px]">
                  <button
                    onClick={() => onChangeLanguage('zh')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                      language === 'zh'
                        ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg shadow-[#FF4D94]/30'
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => onChangeLanguage('en')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                      language === 'en'
                        ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg shadow-[#FF4D94]/30'
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 切换成员 */}
          {otherProfiles.length > 0 && onSwitchProfile && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-1">
                {t.drawer.account}
              </h4>
              <div className="space-y-2">
                {otherProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onSwitchProfile(profile.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-left border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                  >
                    <div className={`w-10 h-10 rounded-lg ${profile.avatarColor} flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md`}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        profile.name.slice(0, 2)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                        {profile.name}
                      </div>
                      <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {profile.balance} {t.common.balance}
                      </div>
                    </div>
                    <Icon name="arrow-right" size={16} className="text-gray-400 dark:text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 退出登录 */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 hover:from-rose-100 hover:to-red-100 dark:hover:from-rose-900/30 dark:hover:to-red-900/30 transition-all text-left border border-rose-100 dark:border-rose-800/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Icon name="log-out" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-rose-600 dark:text-rose-400 text-sm">
                  {t.buttons.logout}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
