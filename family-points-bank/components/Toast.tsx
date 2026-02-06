import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export type ToastType = 'info' | 'success' | 'error' | 'loading';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number; // 0 = persist until手动关闭
}

interface ToastItem extends Required<Pick<ToastOptions, 'title'>> {
  id: string;
  type: ToastType;
  description?: string;
  duration: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random()}`);

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: (id: string) => void }) {
  const iconName = toast.type === 'success' ? 'check' : toast.type === 'error' ? 'penalty' : toast.type === 'info' ? 'info' : null;
  const accentColor = toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#F43F5E' : toast.type === 'info' ? '#0EA5E9' : '#64748B';

  return (
    <div className="pointer-events-auto group relative w-[340px] md:w-[400px]">
      {/* Premium Glow Effect */}
      <div 
        className="absolute -inset-1 blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-3xl"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className={`relative flex items-center gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-2xl p-4 overflow-hidden animate-in slide-in-from-right-10 duration-500`}>
        {/* Progress Bar for Auto-dismiss */}
        {toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20 w-full">
            <div 
              className="h-full bg-current transition-all linear" 
              style={{ 
                width: '100%',
                animation: `shrink ${toast.duration}ms linear forwards`
              }} 
            />
          </div>
        )}

        <div className="shrink-0 relative">
          {toast.type === 'loading' ? (
            <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm" style={{ backgroundColor: `${accentColor}15` }}>
              <div 
                className="absolute inset-0 opacity-40 animate-pulse" 
                style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }}
              />
              <Icon name={iconName || 'info'} size={20} className="relative z-10" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h5 className="text-[13px] font-black text-gray-900 dark:text-white leading-tight mb-0.5 tracking-tight">
            {toast.title}
          </h5>
          {toast.description && (
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-normal line-clamp-2">
              {toast.description}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(toast.id)}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-300 hover:text-gray-500 transition-all active:scale-90"
        >
          <Icon name="close" size={12} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const { title, description, type = 'info' } = options;
    const duration = options.duration === undefined ? (type === 'loading' ? 0 : 4000) : options.duration;
    const id = genId();
    setToasts(prev => [...prev.slice(-3), { id, title, description, type, duration }]);
    if (duration > 0) {
      window.setTimeout(() => dismissToast(id), duration);
    }
    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[1000000] flex flex-col gap-4 items-center md:items-end pointer-events-none w-full md:w-auto px-6">
          {toasts.map(toast => (
            <ToastCard key={toast.id} toast={toast} onClose={dismissToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
