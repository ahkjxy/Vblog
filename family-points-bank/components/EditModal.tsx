import { Modal } from './Modal';
import { Icon } from './Icon';

interface EditModalProps {
  editingItem: { type: 'task' | 'reward'; item: any } | null;
  onClose: () => void;
  onSave: (type: 'task' | 'reward', item: any) => void;
  onUpdate: (payload: { type: 'task' | 'reward'; item: any }) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving?: boolean;
}

export function EditModal({ editingItem, onClose, onSave, onUpdate, fileInputRef, onImageChange, saving = false }: EditModalProps) {
  if (!editingItem) return null;

  const { type, item } = editingItem;
  const updateItem = (patch: Record<string, any>) => onUpdate({ ...editingItem, item: { ...item, ...patch } });

  return (
    <Modal isOpen={!!editingItem} onClose={onClose} maxWidth="max-w-lg">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">{type === 'task' ? 'Task Entry' : 'Reward Store'}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {item.id ? '编辑内容' : (type === 'task' ? '新增任务' : '新增奖品')}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">完善详细信息以持续同步记录</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Icon name="x" size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (saving) return; onSave(type, item); }} className="space-y-6">
          
          {/* Image Upload (Reward Only) */}
          {type === 'reward' && (
            <div>
              <label className="label-pop">奖品图示</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-full h-40 bg-gray-50 dark:bg-white/5 rounded-[24px] border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF4D94]/50 transition-all overflow-hidden"
              >
                {item.imageUrl ? (
                  <>
                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-xs uppercase tracking-widest">更换图片</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#FF4D94] transition-colors">
                    <Icon name="reward" size={24} />
                    <span className="text-xs font-bold">点击上传图片</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={onImageChange} accept="image/*" className="hidden" />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label-pop">标题说明</label>
            <input 
              required 
              value={item.title || ''} 
              onChange={e => updateItem({ title: e.target.value })} 
              className="input-pop"
              placeholder="输入一个名称..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Points */}
            <div>
              <label className="label-pop">能量数值</label>
              <input 
                type="number" 
                required 
                value={item.points || 0} 
                onChange={e => updateItem({ points: parseInt(e.target.value) || 0 })} 
                className="input-pop text-right font-mono"
              />
            </div>

            {/* Type/Frequency */}
            {type === 'task' ? (
              <div>
                <label className="label-pop">周期</label>
                <select
                  value={item.frequency || '每日'}
                  onChange={e => updateItem({ frequency: e.target.value })}
                  className="input-pop"
                >
                  {['每日', '每次', '每周', '每月'].map(opt => (
                    <option key={opt} value={opt} className="text-gray-900">{opt}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="label-pop">类别</label>
                <select 
                  value={item.type || '实物奖品'} 
                  onChange={e => updateItem({ type: e.target.value })} 
                  className="input-pop"
                >
                  <option className="text-gray-900">实物奖品</option>
                  <option className="text-gray-900">特权奖励</option>
                </select>
              </div>
            )}
          </div>

          {/* Task Category Grid */}
          {type === 'task' && (
            <div>
              <label className="label-pop">所属分类</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'learning', label: '学习', icon: '📗' },
                  { id: 'chores', label: '家务', icon: '🧹' },
                  { id: 'discipline', label: '自律', icon: '⏰' },
                  { id: 'penalty', label: '处罚', icon: '⚠️' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateItem({ category: cat.id })}
                    className={`py-3 rounded-[16px] border transition-all flex flex-col items-center gap-1 ${
                      item.category === cat.id 
                        ? 'border-[#FF4D94] bg-[#FF4D94]/5 text-[#FF4D94]' 
                        : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] font-bold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="label-pop">规则描述</label>
            <textarea 
              value={item.description || ''} 
              onChange={e => updateItem({ description: e.target.value })} 
              className="input-pop h-24 resize-none leading-relaxed" 
              placeholder="详细说明下这个规则..." 
            />
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-3 pt-6 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-base btn-secondary flex-1"
            >
              放弃
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-base btn-primary flex-1"
            >
              {saving ? '同步中...' : '确认发布'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
