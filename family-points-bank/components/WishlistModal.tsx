import { useState } from "react";
import { Modal } from "./Modal";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import { Language, useTranslation } from "../i18n/translations";

interface WishlistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, points: number, type: "实物奖品" | "特权奖励", imageUrl?: string) => Promise<void>;
  language?: Language;
}

export function WishlistModal({ open, onClose, onSubmit, language = 'zh' }: WishlistModalProps) {
  const { t } = useTranslation(language);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState<number>(10);
  const [type, setType] = useState<"实物奖品" | "特权奖励">("实物奖品");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({ type: "error", title: t.wishlistModal.enterWishName });
      return;
    }
    if (points <= 0) {
      showToast({ type: "error", title: t.wishlistModal.pointsMustBePositive });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(title.trim(), points, type, imageUrl || undefined);
      showToast({ type: "success", title: t.wishlistModal.wishSubmitted, description: t.wishlistModal.waitingApproval });
      setTitle("");
      setPoints(10);
      setType("实物奖品");
      setImageUrl("");
      onClose();
    } catch (error) {
      showToast({ type: "error", title: t.wishlistModal.submitFailed, description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="max-w-[440px]">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">{t.wishlistModal.title}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.wishlistModal.subtitle}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.wishlistModal.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Icon name="x" size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 ml-4 tracking-[0.2em]">{t.wishlistModal.wishName}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.wishlistModal.wishNamePlaceholder}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-[24px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#FF4D94] transition-all shadow-inner"
              maxLength={50}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 ml-4 tracking-[0.2em]">{t.wishlistModal.requiredPoints}</label>
            <div className="relative group">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
                max={10000}
                className="w-full px-8 py-4 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-[24px] font-black text-xl points-font outline-none focus:ring-2 focus:ring-[#FF4D94] transition-all shadow-inner"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">
                {t.app.points}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 ml-4 tracking-[0.2em]">{t.wishlistModal.rewardCategory}</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: '实物奖品', label: t.wishlistModal.physicalReward, icon: '🎁' },
                { id: '特权奖励', label: t.wishlistModal.privilegeReward, icon: '⭐' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id as any)}
                  className={`py-4 px-6 rounded-[28px] border-2 transition-all flex flex-col items-center gap-2 ${
                    type === opt.id
                      ? 'border-[#FF4D94] bg-[#FF4D94]/5 shadow-[0_8px_16px_-4px_rgba(255,77,148,0.2)]'
                      : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className={`text-[11px] font-black tracking-widest ${type === opt.id ? 'text-[#FF4D94]' : 'text-gray-400 dark:text-gray-500'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 ml-4 tracking-[0.2em]">{t.wishlistModal.imagePreview}</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {imageUrl ? (
                  <img src={imageUrl} alt="预览" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="plus" size={24} className="text-gray-300" />
                )}
              </div>
              <label className="flex-1 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:border-[#FF4D94] transition-all flex items-center justify-center gap-2 text-gray-500">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imageUrl ? t.wishlistModal.changeImage : t.wishlistModal.uploadImage}
              </label>
            </div>
          </div>

          <div className="flex flex-row gap-3 pt-6 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-secondary flex-1"
            >
              {t.wishlistModal.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-primary flex-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Icon name="check" size={16} />
              )}
              {loading ? t.wishlistModal.submitting : t.wishlistModal.submitWish}
            </button>
          </div>
        </form>
    </Modal>
  );
}
