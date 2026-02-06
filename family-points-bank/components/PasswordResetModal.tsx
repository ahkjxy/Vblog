import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';

interface PasswordResetModalProps {
  open: boolean;
  onClose: () => void;
}

export function PasswordResetModal({ open, onClose }: PasswordResetModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !confirm.trim()) return showToast({ type: 'error', title: '请输入新密码并确认' });
    if (password !== confirm) return showToast({ type: 'error', title: '两次输入不一致' });
    if (password.length < 6) return showToast({ type: 'error', title: '密码至少 6 位' });
    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      showToast({ type: 'success', title: '密码已更新', description: '请重新登录' });
      setTimeout(() => onClose(), 800);
    } catch (err) {
      showToast({ type: 'error', title: (err as Error)?.message || '重置失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content no-scrollbar max-w-md">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-2 lg:hidden shrink-0" />
        <div className="space-y-1 text-center">
          <p className="text-xs font-bold uppercase text-[#FF4D94] tracking-[0.4em] mb-1">Reset Password</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">设置新密码</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">请输入新密码并确认，重启元气生活。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <label className="label-pop">新密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-pop"
              placeholder="至少 6 位"
              disabled={loading}
            />
          </div>
          <div>
            <label className="label-pop">验证密码</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-pop"
              placeholder="再次输入"
              disabled={loading}
            />
          </div>


          
          <div className="flex gap-3 pt-6 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-base btn-secondary flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-primary flex-[1.5]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : '确认更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
