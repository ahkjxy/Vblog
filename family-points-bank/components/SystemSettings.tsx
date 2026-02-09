import { useState } from 'react';
import { Icon } from './Icon';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';
import { FeedbackModal } from './FeedbackModal';
import { supabase } from '../supabaseClient';
import { Language } from '../i18n/translations';

interface SystemSettingsProps {
  currentSyncId?: string;
  currentProfileId?: string;
  profileName?: string;
  language: Language;
  onLogout: () => void;
  onExportData?: () => void;
  appVersion?: string;
}

export function SystemSettings({
  currentSyncId,
  currentProfileId,
  profileName = 'User',
  language,
  onLogout,
  onExportData,
  appVersion = '1.0.0',
}: SystemSettingsProps) {
  const { showToast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description?: string;
    onConfirm: () => void;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  // 检查是否是超级管理员
  const isSuperAdmin = currentSyncId === '79ed05a1-e0e5-4d8c-9a79-d8756c488171';

  const t = {
    zh: {
      title: '系统设置',
      subtitle: '管理应用偏好设置与账户安全',
      accountSecurity: '账户与安全',
      deleteAccount: '注销账户',
      deleteAccountDesc: '永久删除家庭所有数据',
      deleteAccountConfirm: '⚠️ 确认注销账户？',
      deleteAccountConfirmDesc: '此操作将永久删除该家庭的所有数据，包括成员、任务、奖励、交易记录等，且无法恢复！',
      deleteAccountSuccess: '账户已注销',
      appearance: '外观设置',
      language: '语言',
      chinese: '简体中文',
      english: 'English',
      theme: '主题模式',
      lightMode: '日间模式',
      darkMode: '夜间模式',
      dataManagement: '数据管理',
      downloadAndroid: '下载安卓版',
      downloadAndroidDesc: '下载家庭积分银行 APK 安装包',
      exportData: '导出数据',
      exportDataDesc: '导出家庭数据为 JSON 文件',
      clearCache: '清除缓存',
      clearCacheDesc: '清理本地缓存数据',
      clearCacheConfirm: '确认清除缓存？',
      clearCacheSuccess: '缓存已清除',
      feedback: '反馈与建议',
      feedbackDesc: '向管理员发送反馈或查看回复',
      feedbackAdmin: '反馈管理',
      feedbackAdminDesc: '查看和回复用户反馈',
      systemInfo: '系统信息',
      familyId: '家庭 ID',
      version: '应用版本',
      confirm: '确认',
      cancel: '取消',
      copy: '复制',
      copied: '已复制',
      deleting: '删除中...',
    },
    en: {
      title: 'System Settings',
      subtitle: 'Manage app preferences and account security',
      accountSecurity: 'Account & Security',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Permanently delete all family data',
      deleteAccountConfirm: '⚠️ Confirm Delete Account?',
      deleteAccountConfirmDesc: 'This will permanently delete all family data including members, tasks, rewards, transactions, etc. This action cannot be undone!',
      deleteAccountSuccess: 'Account deleted',
      appearance: 'Appearance',
      language: 'Language',
      chinese: '简体中文',
      english: 'English',
      theme: 'Theme Mode',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      dataManagement: 'Data Management',
      downloadAndroid: 'Download Android',
      downloadAndroidDesc: 'Download Family Bank APK installer',
      exportData: 'Export Data',
      exportDataDesc: 'Export family data as JSON',
      clearCache: 'Clear Cache',
      clearCacheDesc: 'Clear local cache data',
      clearCacheConfirm: 'Confirm Clear Cache?',
      clearCacheSuccess: 'Cache cleared',
      feedback: 'Feedback & Suggestions',
      feedbackDesc: 'Send feedback to admin or view replies',
      feedbackAdmin: 'Feedback Management',
      feedbackAdminDesc: 'View and reply to user feedback',
      systemInfo: 'System Information',
      familyId: 'Family ID',
      version: 'App Version',
      confirm: 'Confirm',
      cancel: 'Cancel',
      copy: 'Copy',
      copied: 'Copied',
      deleting: 'Deleting...',
    },
  };

  const text = t[language];

  const handleDeleteAccount = () => {
    setConfirmDialog({
      title: text.deleteAccountConfirm,
      description: text.deleteAccountConfirmDesc,
      onConfirm: async () => {
        if (!currentSyncId) {
          showToast({ type: 'error', title: 'No family ID found' });
          return;
        }
        
        setIsDeleting(true);
        try {
          // 调用删除家庭数据的函数
          const { error } = await supabase.rpc('delete_family_data', {
            target_family_id: currentSyncId
          });
          
          if (error) throw error;
          
          // 注销登录
          await supabase.auth.signOut();
          
          showToast({ type: 'success', title: text.deleteAccountSuccess });
          
          // 清除本地数据
          localStorage.clear();
          
          // 跳转到登录页
          onLogout();
        } catch (error) {
          console.error('Delete account error:', error);
          showToast({ 
            type: 'error', 
            title: 'Delete failed', 
            description: (error as Error).message 
          });
        } finally {
          setIsDeleting(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleClearCache = () => {
    setConfirmDialog({
      title: text.clearCacheConfirm,
      description: text.clearCacheDesc,
      onConfirm: () => {
        try {
          const keysToKeep = ['theme', 'language', 'syncId'];
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
              localStorage.removeItem(key);
            }
          });
          showToast({ type: 'success', title: text.clearCacheSuccess });
        } catch (error) {
          showToast({ type: 'error', title: 'Failed to clear cache' });
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleCopyFamilyId = () => {
    if (currentSyncId) {
      navigator.clipboard.writeText(currentSyncId);
      showToast({ type: 'success', title: text.copied });
    }
  };

  const handleExportData = () => {
    if (onExportData) {
      onExportData();
      showToast({ type: 'success', title: 'Data exported' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {text.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* Account & Security */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          {text.accountSecurity}
        </h4>
        
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="w-full flex items-center justify-between p-4 rounded-[20px] bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all group disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center">
              <Icon name="trash" size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {text.deleteAccount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {text.deleteAccountDesc}
              </p>
            </div>
          </div>
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          ) : (
            <Icon name="chevron-right" size={20} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Feedback & Support */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          {isSuperAdmin ? text.feedbackAdmin : text.feedback}
        </h4>
        
        <button
          onClick={() => setFeedbackModalOpen(true)}
          className="w-full flex items-center justify-between p-4 rounded-[20px] bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 border border-[#7C4DFF]/20 hover:from-[#7C4DFF]/20 hover:to-[#FF4D94]/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#FF4D94] flex items-center justify-center">
              <Icon name="chat" size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {isSuperAdmin ? text.feedbackAdmin : text.feedback}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isSuperAdmin ? text.feedbackAdminDesc : text.feedbackDesc}
              </p>
            </div>
          </div>
          <Icon name="chevron-right" size={20} className="text-gray-400 group-hover:text-[#7C4DFF] transition-colors" />
        </button>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          {text.dataManagement}
        </h4>
        
        <a
          href="https://blog.familybank.chat/download/family-bank.apk"
          download
          className="w-full flex items-center justify-between p-4 rounded-[20px] bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-500/10 dark:to-blue-500/10 border border-emerald-200 dark:border-emerald-500/20 hover:from-emerald-100 hover:to-blue-100 dark:hover:from-emerald-500/20 dark:hover:to-blue-500/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <Icon name="download" size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{text.downloadAndroid}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{text.downloadAndroidDesc}</p>
            </div>
          </div>
          <Icon name="chevron-right" size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
        </a>

        {onExportData && (
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 rounded-[20px] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                <Icon name="download" size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{text.exportData}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{text.exportDataDesc}</p>
              </div>
            </div>
            <Icon name="chevron-right" size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </button>
        )}

        <button
          onClick={handleClearCache}
          className="w-full flex items-center justify-between p-4 rounded-[20px] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
              <Icon name="refresh" size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{text.clearCache}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{text.clearCacheDesc}</p>
            </div>
          </div>
          <Icon name="chevron-right" size={20} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
        </button>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
          {text.systemInfo}
        </h4>
        
        {currentSyncId && (
          <div className="p-4 rounded-[20px] bg-gray-50 dark:bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{text.familyId}</p>
              <button
                onClick={handleCopyFamilyId}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 text-xs font-bold text-[#7C4DFF] hover:bg-[#7C4DFF] hover:text-white transition-all"
              >
                {text.copy}
              </button>
            </div>
            <code className="block p-3 rounded-xl bg-white dark:bg-black/20 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {currentSyncId}
            </code>
          </div>
        )}

        <div className="p-4 rounded-[20px] bg-gray-50 dark:bg-white/5">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{text.version}</p>
          <p className="text-lg font-black text-[#FF4D94] points-font">v{appVersion}</p>
        </div>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          open
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={text.confirm}
          cancelText={text.cancel}
          tone="danger"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {feedbackModalOpen && currentSyncId && currentProfileId && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          familyId={currentSyncId}
          profileId={currentProfileId}
          profileName={profileName}
          isSuperAdmin={isSuperAdmin}
          language={language}
        />
      )}
    </div>
  );
}
