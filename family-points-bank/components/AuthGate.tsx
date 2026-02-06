import { useEffect, useState } from 'react';
import { AUTH_REDIRECT } from '../constants';
import { supabase } from '../supabaseClient';
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import { PasswordResetModal } from './PasswordResetModal';

type Mode = 'password' | 'magic';

export const AuthGate: React.FC = () => {
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { showToast } = useToast();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    const pw = password.trim();
    if (!em || !pw) {
      showToast({ type: 'error', title: '请输入邮箱和密码' });
      return;
    }
    setLoading(true);

    // 1. 尝试登录
    try {
      const { data, error: signErr } = await supabase.auth.signInWithPassword({ email: em, password: pw });
      
      if (!signErr && data?.session) {
        showToast({ type: 'success', title: '登录成功，正在进入...' });
        return; // Success
      }

      // 如果是其他错误（如"Email not confirmed"），直接提示
      const isCredentialError = signErr?.message === "Invalid login credentials";
      if (signErr && !isCredentialError) {
        showToast({ type: 'error', title: signErr.message });
        return;
      }

      // 2. 如果是凭证错误，可能是用户不存在（需要注册）或者是密码错误
      // 我们尝试注册来区分这两种情况
      
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ 
        email: em, 
        password: pw, 
        options: { emailRedirectTo: AUTH_REDIRECT } 
      });

      if (signUpErr) {
        // 注册失败
        if (signUpErr.message?.includes('User already registered') || signUpErr.message?.includes('Database error')) {
           // 注册报"用户已存在"，说明最初的"Invalid login credentials"是因为密码错误
           showToast({ type: 'error', title: '密码错误', description: '如忘记密码请点击下方找回' });
        } else {
           // 其他注册错误
           showToast({ type: 'error', title: signUpErr.message });
        }
      } else {
        // 注册成功
        if (signUpData?.session) {
           showToast({ type: 'success', title: '注册并登录成功', description: '欢迎加入元气银行!' });
        } else {
           // 需要验证邮件（取决于 Supabase 设置）
           showToast({ type: 'info', title: '注册成功', description: '请前往邮箱验证链接以完成激活' });
        }
      }

    } catch (err) {
      showToast({ type: 'error', title: (err as Error)?.message || '操作失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!em) {
      showToast({ type: 'error', title: '请输入邮箱' });
      return;
    }
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email: em, options: { emailRedirectTo: AUTH_REDIRECT } });
      if (otpError) throw otpError;
      showToast({ type: 'info', title: '已发送登录链接', description: '请前往邮箱点击确认' });
    } catch (err) {
      showToast({ type: 'error', title: (err as Error)?.message || '发送失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    setResetEmail(email.trim());
    setShowResetRequest(true);
  };

  const handleSendReset = async () => {
    const em = resetEmail.trim();
    if (!em) {
      showToast({ type: 'error', title: '请输入邮箱' });
      return;
    }
    setResetLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: AUTH_REDIRECT });
      if (resetErr) throw resetErr;
      showToast({ type: 'success', title: '重置邮件已发送', description: '请查收邮箱并按链接设置新密码' });
      setShowResetRequest(false);
    } catch (err) {
      showToast({ type: 'error', title: (err as Error)?.message || '发送失败' });
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (type === 'recovery' && access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token });
      setShowReset(true);
      const cleaned = window.location.origin + window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, cleaned);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowReset(true);
      }
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] dark:bg-[#0F172A] sm:px-6 py-12 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D94]/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C4DFF]/10 blur-[100px] rounded-full animate-pulse duration-[4000ms]"></div>
      
      <div className="w-full sm:max-w-[420px] bg-white sm:bg-white/80 dark:bg-[#0F172A] sm:dark:bg-[#1E293B]/80 backdrop-blur-3xl sm:rounded-[48px] sm:shadow-[0_32px_100px_-24px_rgba(0,0,0,0.12)] sm:dark:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] sm:border border-white/50 dark:border-white/5 p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10 mobile-card">
        <div className="space-y-3 text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] opacity-30 blur-2xl rounded-full animate-pulse" />
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-[24px] flex items-center justify-center relative shadow-2xl shadow-[#FF4D94]/30 rotate-3 hover:rotate-0 transition-all duration-500 group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 animate-shimmer-fast" />
              <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D94]">系 统 入 口</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mt-1">欢迎进入元气银行</h2>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-snug mt-2 max-w-[240px] mx-auto opacity-80">开启家庭趣味积分系统，让努力可见。</p>
          </div>
        </div>

        <div className="flex gap-1.5 p-1 bg-gray-50 dark:bg-black/20 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-[#FF4D94]">
          <button
            className={`flex-1 py-3.5 rounded-[18px] transition-all duration-300 ${mode === 'password' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-500'}`}
            onClick={() => { setMode('password'); }}
          >密码登录 / 注册</button>
          <button
            className={`flex-1 py-3.5 rounded-[18px] transition-all duration-300 ${mode === 'magic' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-500'}`}
            onClick={() => { setMode('magic'); }}
          >魔法链接</button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="label-pop">电子邮箱</label>
              <input
                type="email"
                className="input-pop"
                placeholder="请输入您的邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label-pop">通行密码</label>
              <input
                type="password"
                className="input-pop"
                placeholder="请输入您的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-base btn-primary w-full !py-4 shadow-xl shadow-[#FF4D94]/20"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '一键登录'}
                </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleResetPassword}
                className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600 hover:text-[#7C4DFF] transition-colors pb-2"
              >忘记密码？点击点击找回</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMagic} className="space-y-4">
            <div>
              <label className="label-pop">验证邮箱</label>
              <input
                type="email"
                className="input-pop"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-primary w-full bg-gradient-to-r from-[#7C4DFF] to-[#9E7AFF] shadow-[0_12px_24px_-8px_rgba(124,77,255,0.4)]"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '发送魔法链接'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-3 opacity-60">
            <span className="w-10 h-px bg-gray-100 dark:bg-gray-800"></span>
            SUPABASE 安全支持
            <span className="w-10 h-px bg-gray-100 dark:bg-gray-800"></span>
          </p>
        </div>
      </div>

      <PasswordResetModal open={showReset} onClose={() => setShowReset(false)} />

      {showResetRequest && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowResetRequest(false)}></div>
          <div className="modal-content no-scrollbar max-w-[420px]">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-2 lg:hidden shrink-0" />
            
            <div className="flex justify-between items-start mb-6 text-left">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">Reset Portal</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">找回通行密码</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">我们将发送重置链接到您的注册邮箱</p>
              </div>
              <button 
                onClick={() => setShowResetRequest(false)} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Icon name="x" size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-5 mt-2">
              <div>
                <label className="label-pop">验证邮箱 / Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-pop"
                  placeholder="you@example.com"
                  disabled={resetLoading}
                />
              </div>



              <div className="flex flex-row gap-3 pt-6 mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetRequest(false)}
                  disabled={resetLoading}
                  className="btn-base btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={resetLoading}
                  className="btn-base btn-primary flex-1"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    '发送邮件'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
