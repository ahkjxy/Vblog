import { Icon } from './Icon';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, confirmText = '确认', cancelText = '取消', tone = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal isOpen={open} onClose={onCancel} maxWidth="max-w-[420px]">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-xl rotate-3 transition-transform hover:rotate-0 duration-500 ${
            tone === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'
          }`}>
            <Icon name={tone === 'danger' ? 'trash' : 'info'} size={40} />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">Confirmation</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
            {description && <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[280px] mx-auto leading-relaxed">{description}</p>}
          </div>

          <div className="flex flex-row w-full gap-3 pt-4">
            <button
              onClick={onCancel}
              className="btn-base btn-secondary flex-1"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`btn-base flex-1 text-white shadow-lg ${
                tone === 'danger' 
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
                  : 'btn-primary'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
    </Modal>
  );
}
