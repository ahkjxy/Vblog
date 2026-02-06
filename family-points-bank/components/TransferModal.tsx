import { useState } from "react";
import { Modal } from "./Modal";
import { Profile } from "../types";
import { Icon } from "./Icon";
import { useToast } from "./Toast";

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  currentProfile: Profile;
  profiles: Profile[];
  onTransfer: (toProfileId: string, points: number, message: string) => Promise<void>;
}

export function TransferModal({
  open,
  onClose,
  currentProfile,
  profiles,
  onTransfer,
}: TransferModalProps) {
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [points, setPoints] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const availableProfiles = profiles.filter((p) => p.id !== currentProfile.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfileId) {
      showToast({ type: "error", title: "请选择接收成员" });
      return;
    }

    if (points <= 0) {
      showToast({ type: "error", title: "元气必须大于0" });
      return;
    }

    if (points > currentProfile.balance) {
      showToast({ type: "error", title: "元气不足", description: `当前余额：${currentProfile.balance}` });
      return;
    }

    setLoading(true);
    try {
      await onTransfer(selectedProfileId, points, message.trim());
      const toProfile = profiles.find((p) => p.id === selectedProfileId);
      showToast({
        type: "success",
        title: "转赠成功",
        description: `已向 ${toProfile?.name} 转赠 ${points} 元气值`,
      });
      setSelectedProfileId("");
      setPoints(1);
      setMessage("");
      onClose();
    } catch (error) {
      showToast({ type: "error", title: "转赠失败", description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="max-w-lg">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">元气转赠</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">赠送元气能量</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">将您的剩余能量分享给其他成员</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Icon name="x" size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Selection */}
          <div>
            <label className="label-pop">选择接收成员</label>
            <div className="grid grid-cols-1 gap-3">
              {availableProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all ${
                    selectedProfileId === profile.id
                      ? "border-[#FF4D94] bg-[#FF4D94]/5"
                      : "border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${profile.avatarColor || 'bg-gray-400'} flex items-center justify-center text-white text-lg font-bold shadow-sm`}
                  >
                     {profile.name.slice(-1)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-base font-bold ${selectedProfileId === profile.id ? 'text-[#FF4D94]' : 'text-gray-900 dark:text-white'}`}>
                      {profile.name}
                    </p>
                  </div>
                  {selectedProfileId === profile.id && (
                    <Icon name="check" size={20} className="text-[#FF4D94]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label-pop">转赠数量</label>
            <div className="relative group">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
                max={currentProfile.balance}
                className="w-full px-8 py-4 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-[24px] font-black text-xl points-font outline-none focus:ring-2 focus:ring-[#FF4D94] transition-all shadow-inner"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">元气</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setPoints(Math.min(50, currentProfile.balance))}
                className="px-4 py-2 bg-white dark:bg-white/10 rounded-full text-xs font-bold text-gray-500 hover:text-[#FF4D94] transition-colors"
              >
                50 元气
              </button>
              <button
                type="button"
                onClick={() => setPoints(currentProfile.balance)}
                className="px-4 py-2 bg-white dark:bg-white/10 rounded-full text-xs font-bold text-gray-500 hover:text-[#FF4D94] transition-colors"
              >
                MAX 元气
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="label-pop">留言说明</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="写点什么鼓励的话吧..."
              rows={2}
              maxLength={100}
              className="input-pop resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-3 pt-6 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-secondary flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProfileId || points <= 0}
              className="btn-base btn-primary flex-1"
            >
              {loading ? '正在同步...' : '确认转赠'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
