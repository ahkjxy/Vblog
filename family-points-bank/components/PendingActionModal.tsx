import { Modal } from './Modal';
import { Icon } from './Icon';

interface PendingActionModalProps {
  pendingAction: { title: string; points: number; type: 'earn' | 'penalty' | 'redeem' } | null;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function PendingActionModal({ pendingAction, error, onCancel, onConfirm, loading = false }: PendingActionModalProps) {
  if (!pendingAction) return null;

  const isRedeem = pendingAction.type === 'redeem';

  return (
    <Modal isOpen={!!pendingAction} onClose={onCancel} maxWidth="max-w-md" className="!overflow-visible relative mt-8 lg:mt-0">
        {/* Floating Header Icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[60%] z-20">
          <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center shadow-xl rotate-6 hover:rotate-0 transition-transform duration-500 border-4 border-white dark:border-gray-800 ${
            pendingAction.points > 0 
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' 
              : 'bg-gradient-to-br from-rose-400 to-pink-600 text-white'
          }`}>
            <Icon name={pendingAction.type === 'redeem' ? 'reward' : 'plus'} size={40} />
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">操作确认</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">确认执行该事项?</h3>
        </div>

        <div className="text-center space-y-2 mb-8">
          <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">Action Entry</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">确认记录此项</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">正在为您同步云端账户...</p>
        </div>

        <div className="py-6 px-4 bg-gray-50 dark:bg-white/5 rounded-[32px] border border-transparent dark:border-white/5 text-center space-y-3 mb-6 shadow-inner">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{pendingAction.title}</p>
          <p className={`text-4xl font-black points-font ${isRedeem ? 'text-[#7C4DFF]' : pendingAction.points > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {pendingAction.points > 0 ? '+' : ''}{pendingAction.points} 元气
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-in slide-in-from-top-2 mb-4">
             ⚠️ {error}
          </div>
        )}

        <div className="flex flex-row gap-3 pt-6 mt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-base btn-secondary flex-1"
          >
            我再想想
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-base btn-primary flex-1"
          >
            {loading ? '同步中...' : '确认录入'}
          </button>
        </div>
    </Modal>
  );
}
