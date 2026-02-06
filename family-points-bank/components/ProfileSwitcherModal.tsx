import { Modal } from './Modal';
import { Profile } from '../types';
import { Icon } from './Icon';
import { calculateLevelInfo, getProfileTotalEarned, ROLE_LABELS } from '../utils/leveling';

interface ProfileSwitcherModalProps {
  open: boolean;
  profiles: Profile[];
  currentProfileId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function ProfileSwitcherModal({ open, profiles, currentProfileId, onSelect, onClose }: ProfileSwitcherModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="max-w-[400px]">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1 text-left">
            <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">Account System</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">切换账户身份</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">选择您要进入的家庭通行证</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Icon name="x" size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-2">
          {profiles.map(p => (
            <button 
              key={p.id}
              onClick={() => { onSelect(p.id); onClose(); }}
              className={`w-full flex items-center gap-4 p-3 rounded-[28px] transition-all duration-300 group ${
                currentProfileId === p.id 
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-[0_12px_24px_-8px_rgba(255,77,148,0.5)]' 
                  : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-[18px] overflow-hidden flex items-center justify-center font-black text-white text-lg ${p.avatarColor || 'bg-gray-400'} border-2 ${
                  currentProfileId === p.id ? 'border-white/40' : 'border-transparent group-hover:border-[#FF4D94]/30'
                } transition-all duration-300 shadow-md`}>
                   {p.name.slice(-1)}
                </div>
                {currentProfileId === p.id && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-200">
                    <Icon name="check" size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-left overflow-hidden flex-1">
                <p className={`text-sm font-black truncate ${currentProfileId === p.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                    currentProfileId === p.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}>
                    {ROLE_LABELS[p.role]}
                  </span>
                  <span className={`text-[8px] font-black points-font ${
                    currentProfileId === p.id ? 'text-white/80' : 'text-[#FF4D94]'
                  }`}>
                    {p.balance} 元气
                  </span>
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <Icon name={calculateLevelInfo(getProfileTotalEarned(p)).icon as any} size={8} className={currentProfileId === p.id ? 'text-white' : calculateLevelInfo(getProfileTotalEarned(p)).color} />
                    <span className={`text-[8px] font-black uppercase tracking-tighter ${currentProfileId === p.id ? 'text-white/90' : 'text-gray-400'}`}>
                      {calculateLevelInfo(getProfileTotalEarned(p)).name}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-gray-50 dark:bg-white/5 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#FF4D94] transition-all"
        >
          取消切换
        </button>
    </Modal>
  );
}
