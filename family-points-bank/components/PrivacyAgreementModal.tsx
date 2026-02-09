import { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { Language } from '../i18n/translations';
import { supabase } from '../supabaseClient';

interface PrivacyAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  familyId: string;
  language?: Language;
}

export function PrivacyAgreementModal({
  isOpen,
  onClose,
  onAgree,
  familyId,
  language = 'zh',
}: PrivacyAgreementModalProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    zh: {
      title: '隐私政策与用户协议',
      subtitle: '请仔细阅读并同意以下条款',
      version: '版本 1.0.0',
      lastUpdated: '最后更新：2026年2月9日',
      sections: {
        intro: {
          title: '欢迎使用元气银行',
          content: '元气银行（以下简称"本应用"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。',
        },
        dataCollection: {
          title: '1. 信息收集',
          content: [
            '• 账户信息：家庭名称、成员姓名、头像等',
            '• 使用数据：任务完成记录、奖励兑换记录、元气交易记录',
            '• 设备信息：设备类型、操作系统、IP地址（用于安全验证）',
            '• 反馈信息：您提交的反馈和建议',
          ],
        },
        dataUsage: {
          title: '2. 信息使用',
          content: [
            '• 提供和改进应用服务',
            '• 个性化用户体验',
            '• 数据分析和统计（匿名化处理）',
            '• 安全防护和欺诈检测',
            '• 响应用户反馈和技术支持',
          ],
        },
        dataStorage: {
          title: '3. 数据存储与安全',
          content: [
            '• 数据存储在 Supabase 云端服务器（符合 GDPR 标准）',
            '• 采用行级安全策略（RLS）保护数据隔离',
            '• 所有数据传输使用 HTTPS 加密',
            '• 定期备份，防止数据丢失',
            '• 您可以随时导出或删除您的数据',
          ],
        },
        dataSharing: {
          title: '4. 信息共享',
          content: [
            '• 我们不会出售您的个人信息',
            '• 仅在家庭成员之间共享必要的数据',
            '• 超级管理员可以查看反馈留言（用于技术支持）',
            '• 法律要求的情况下可能需要披露信息',
          ],
        },
        userRights: {
          title: '5. 您的权利',
          content: [
            '• 访问权：查看您的所有个人数据',
            '• 更正权：修改不准确的个人信息',
            '• 删除权：注销账户并删除所有数据',
            '• 导出权：以 JSON 格式导出您的数据',
            '• 撤回同意权：随时撤回对数据处理的同意',
          ],
        },
        children: {
          title: '6. 儿童隐私保护',
          content: [
            '• 本应用适合家庭使用，包括儿童',
            '• 儿童账户应由家长或监护人创建和管理',
            '• 我们不会主动收集 13 岁以下儿童的个人信息',
            '• 家长可以随时查看、修改或删除儿童的数据',
          ],
        },
        changes: {
          title: '7. 政策变更',
          content: [
            '• 我们可能会不时更新本隐私政策',
            '• 重大变更会通过应用内通知告知您',
            '• 继续使用应用即表示接受更新后的政策',
          ],
        },
        contact: {
          title: '8. 联系我们',
          content: [
            '如果您对本隐私政策有任何疑问或建议，请通过应用内反馈功能联系我们。',
          ],
        },
      },
      agreement: '我已阅读并同意《隐私政策与用户协议》',
      agreeButton: '同意并继续',
      disagreeButton: '不同意',
      mustAgree: '您必须同意隐私政策才能使用本应用',
      agreementSuccess: '感谢您的同意',
      agreementFailed: '同意失败，请重试',
    },
    en: {
      title: 'Privacy Policy & User Agreement',
      subtitle: 'Please read and agree to the following terms',
      version: 'Version 1.0.0',
      lastUpdated: 'Last Updated: February 9, 2026',
      sections: {
        intro: {
          title: 'Welcome to Family Bank',
          content: 'Family Bank (hereinafter referred to as "the App") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information.',
        },
        dataCollection: {
          title: '1. Information Collection',
          content: [
            '• Account Information: Family name, member names, avatars, etc.',
            '• Usage Data: Task completion records, reward redemption records, points transaction records',
            '• Device Information: Device type, operating system, IP address (for security verification)',
            '• Feedback Information: Feedback and suggestions you submit',
          ],
        },
        dataUsage: {
          title: '2. Information Usage',
          content: [
            '• Provide and improve app services',
            '• Personalize user experience',
            '• Data analysis and statistics (anonymized)',
            '• Security protection and fraud detection',
            '• Respond to user feedback and technical support',
          ],
        },
        dataStorage: {
          title: '3. Data Storage & Security',
          content: [
            '• Data stored on Supabase cloud servers (GDPR compliant)',
            '• Row-level security (RLS) policies for data isolation',
            '• All data transmission uses HTTPS encryption',
            '• Regular backups to prevent data loss',
            '• You can export or delete your data at any time',
          ],
        },
        dataSharing: {
          title: '4. Information Sharing',
          content: [
            '• We will not sell your personal information',
            '• Only share necessary data among family members',
            '• Super admin can view feedback messages (for technical support)',
            '• May disclose information when required by law',
          ],
        },
        userRights: {
          title: '5. Your Rights',
          content: [
            '• Access Right: View all your personal data',
            '• Correction Right: Modify inaccurate personal information',
            '• Deletion Right: Delete account and all data',
            '• Export Right: Export your data in JSON format',
            '• Withdrawal Right: Withdraw consent for data processing at any time',
          ],
        },
        children: {
          title: '6. Children\'s Privacy Protection',
          content: [
            '• This app is suitable for family use, including children',
            '• Children\'s accounts should be created and managed by parents or guardians',
            '• We do not actively collect personal information from children under 13',
            '• Parents can view, modify, or delete children\'s data at any time',
          ],
        },
        changes: {
          title: '7. Policy Changes',
          content: [
            '• We may update this Privacy Policy from time to time',
            '• Significant changes will be notified through in-app notifications',
            '• Continued use of the app indicates acceptance of the updated policy',
          ],
        },
        contact: {
          title: '8. Contact Us',
          content: [
            'If you have any questions or suggestions about this Privacy Policy, please contact us through the in-app feedback feature.',
          ],
        },
      },
      agreement: 'I have read and agree to the Privacy Policy & User Agreement',
      agreeButton: 'Agree and Continue',
      disagreeButton: 'Disagree',
      mustAgree: 'You must agree to the Privacy Policy to use this app',
      agreementSuccess: 'Thank you for your agreement',
      agreementFailed: 'Agreement failed, please try again',
    },
  };

  const text = t[language];

  const handleAgree = async () => {
    if (!isAgreed) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 记录隐私协议同意
      const { error } = await supabase.from('privacy_agreements').insert({
        family_id: familyId,
        version: '1.0.0',
        ip_address: null, // 可以通过 API 获取
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
      });

      if (error) throw error;

      // 保存到 localStorage
      localStorage.setItem(`privacy_agreed_${familyId}`, 'true');
      localStorage.setItem(`privacy_version_${familyId}`, '1.0.0');

      onAgree();
    } catch (error) {
      console.error('Privacy agreement error:', error);
      alert(text.agreementFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#7C4DFF] to-[#FF4D94] rounded-[24px] flex items-center justify-center shadow-lg">
            <Icon name="settings" size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {text.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {text.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>{text.version}</span>
            <span>•</span>
            <span>{text.lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 text-left">
          {/* Intro */}
          <div className="p-6 bg-gradient-to-br from-[#7C4DFF]/5 to-[#FF4D94]/5 rounded-[24px] border border-[#7C4DFF]/10">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
              {text.sections.intro.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {text.sections.intro.content}
            </p>
          </div>

          {/* Sections */}
          {Object.entries(text.sections)
            .filter(([key]) => key !== 'intro')
            .map(([key, section]) => (
              <div key={key} className="space-y-2">
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  {section.title}
                </h3>
                {Array.isArray(section.content) ? (
                  <ul className="space-y-1.5">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
        </div>

        {/* Agreement Checkbox */}
        <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[24px] border-2 border-gray-200 dark:border-white/10">
          <label className="flex items-start gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-1 w-6 h-6 rounded-lg border-2 border-gray-300 text-[#7C4DFF] focus:ring-[#7C4DFF] focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#7C4DFF] transition-colors">
              {text.agreement}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-[20px] bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          >
            {text.disagreeButton}
          </button>
          <button
            onClick={handleAgree}
            disabled={!isAgreed || isSubmitting}
            className="flex-1 py-4 px-6 rounded-[20px] bg-gradient-to-r from-[#7C4DFF] to-[#FF4D94] text-white font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                {text.agreeButton}
              </>
            )}
          </button>
        </div>

        {!isAgreed && (
          <p className="text-xs text-center text-rose-500 font-bold">
            ⚠️ {text.mustAgree}
          </p>
        )}
      </div>
    </Modal>
  );
}
