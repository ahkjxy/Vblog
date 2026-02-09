import { Reward, Profile } from '../types';
import { Icon } from './Icon';
import { Language } from '../i18n/translations';

interface RewardSettingsProps {
  rewards: Reward[];
  filter: '实物奖品' | '特权奖励' | 'all';
  selectedIds: Set<string>;
  onFilterChange: (value: '实物奖品' | '特权奖励' | 'all') => void;
  onToggle: (id: string) => void;
  onEdit: (reward: Reward) => void;
  onBatchDelete: () => void;
  isDeleting: boolean;
  onApproveWishlist?: (rewardId: string) => void;
  onRejectWishlist?: (rewardId: string) => void;
  profiles?: Profile[];
  language?: Language;
}

// 获取奖励类型标签的函数
function getRewardTypeLabel(type: string, language: Language = 'zh'): string {
  const labels: Record<Language, Record<string, string>> = {
    zh: {
      '实物奖品': '实物奖品',
      '特权奖励': '特权奖励',
      'all': '全部',
    },
    en: {
      '实物奖品': 'Physical Rewards',
      '特权奖励': 'Privilege Rewards',
      'all': 'All',
    },
  };
  return labels[language][type] || type;
}

// 获取状态标签的函数
function getStatusLabel(status: string, language: Language = 'zh'): string {
  const labels: Record<Language, Record<string, string>> = {
    zh: {
      'active': '已上架',
      'pending': '待审核',
      'rejected': '已拒绝',
    },
    en: {
      'active': 'Active',
      'pending': 'Pending',
      'rejected': 'Rejected',
    },
  };
  return labels[language][status] || status;
}

const REWARD_COLORS: Record<string, string> = {
  '实物奖品': 'bg-orange-100 text-orange-700',
  '特权奖励': 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS: Record<string, string> = {
  'active': 'bg-emerald-100 text-emerald-700',
  'pending': 'bg-amber-100 text-amber-700',
  'rejected': 'bg-rose-100 text-rose-700',
};

export function RewardSettings({
  rewards,
  filter,
  selectedIds,
  onFilterChange,
  onToggle,
  onEdit,
  onBatchDelete,
  isDeleting,
  onApproveWishlist,
  onRejectWishlist,
  profiles = [],
  language = 'zh',
}: RewardSettingsProps) {
  const filters: ('实物奖品' | '特权奖励' | 'all')[] = ['all', '实物奖品', '特权奖励'];

  // 包含所有状态的奖励（包括 rejected）
  const filteredRewards = filter === 'all' ? rewards : rewards.filter(r => r.type === filter);

  const getRequesterName = (reward: Reward) => {
    if (!reward.requestedBy) return null;
    const requester = profiles.find(p => p.id === reward.requestedBy);
    return requester?.name || (language === 'zh' ? '某人' : 'Someone');
  };

  // 翻译文本
  const allText = language === 'zh' ? '全部' : 'All';
  const deleteText = language === 'zh' ? `删除 ${selectedIds.size}` : `Delete ${selectedIds.size}`;
  const totalText = language === 'zh' ? `共 ${filteredRewards.length} 个奖品` : `${filteredRewards.length} rewards in total`;
  const selectAllText = language === 'zh' ? `全选奖品 (${selectedIds.size}/${rewards.length})` : `Select All (${selectedIds.size}/${rewards.length})`;
  const approveText = language === 'zh' ? '批准' : 'Approve';
  const rejectText = language === 'zh' ? '拒绝' : 'Reject';
  const wishText = language === 'zh' ? '的愿望' : '\'s wish';
  const pointsText = language === 'zh' ? '元气' : 'Points';

  // 状态标签
  const getStatusText = (status: string) => {
    const labels: Record<string, { zh: string; en: string }> = {
      'active': { zh: '已上架', en: 'Active' },
      'pending': { zh: '待审核', en: 'Pending' },
      'rejected': { zh: '已拒绝', en: 'Rejected' },
    };
    return labels[status]?.[language] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? allText : getRewardTypeLabel(f, language)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={onBatchDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
            >
              <Icon name="delete" size={14} className="inline-block mr-1" />
              {deleteText}
            </button>
          )}
          <span className="text-xs text-gray-500">
            {totalText}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRewards.map(reward => (
          <div
            key={reward.id}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(reward.id)}
              onChange={() => onToggle(reward.id)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {reward.imageUrl ? (
                <img src={reward.imageUrl} alt={reward.title} className="w-full h-full object-cover" />
              ) : (
                <Icon name="reward" size={24} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${REWARD_COLORS[reward.type] || 'bg-gray-100 text-gray-700'}`}>
                  {getRewardTypeLabel(reward.type, language)}
                </span>
                {reward.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[reward.status] || 'bg-gray-100 text-gray-700'}`}>
                    {getStatusText(reward.status)}
                  </span>
                )}
                {reward.requestedBy && getRequesterName(reward) && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    💝 {getRequesterName(reward)}{wishText}
                  </span>
                )}
                <span className="font-semibold text-gray-900 text-sm">{reward.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-[#FF4D94]">
                  {reward.points} {pointsText}
                </span>
              </div>
            </div>
            
            {/* 审核按钮 - 仅对 pending 状态显示 */}
            {reward.status === 'pending' && onApproveWishlist && onRejectWishlist && (
              <div className="flex gap-2">
                <button
                  onClick={() => onApproveWishlist(reward.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                  title={approveText}
                >
                  <Icon name="plus" size={14} />
                  {approveText}
                </button>
                <button
                  onClick={() => onRejectWishlist(reward.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                  title={rejectText}
                >
                  <Icon name="plus" size={14} className="rotate-45" />
                  {rejectText}
                </button>
              </div>
            )}
            
            <button
              onClick={() => onEdit(reward)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Icon name="edit" size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
