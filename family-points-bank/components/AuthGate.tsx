import React, { useEffect } from 'react';

export const AuthGate: React.FC = () => {
  useEffect(() => {
    // Optional: Auto-redirect if desired, but a landing page is safer to avoid loops
    // window.location.href = 'https://blog.familybank.chat/auth/unified?redirect=family';
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] dark:bg-[#0F172A] sm:px-6 py-12 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D94]/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C4DFF]/10 blur-[100px] rounded-full animate-pulse duration-[4000ms]"></div>
      
      <div className="w-full sm:max-w-[420px] bg-white sm:bg-white/80 dark:bg-[#0F172A] sm:dark:bg-[#1E293B]/80 backdrop-blur-3xl sm:rounded-[48px] sm:shadow-[0_32px_100px_-24px_rgba(0,0,0,0.12)] sm:dark:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] sm:border border-white/50 dark:border-white/5 p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10 mobile-card text-center">
        <div className="space-y-3">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] opacity-30 blur-2xl rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-[24px] flex items-center justify-center relative shadow-2xl shadow-[#FF4D94]/30 rotate-3 hover:rotate-0 transition-all duration-500 group overflow-hidden mx-auto">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 animate-shimmer-fast" />
              <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D94]">元 气 银 行</p>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mt-2">欢迎回来</h2>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-snug mt-2 max-w-[240px] mx-auto opacity-80">
              请通过统一登录页面进入系统
            </p>
          </div>
        </div>

        <a
          href="https://blog.familybank.chat/auth/unified?redirect=family"
          className="btn-base btn-primary w-full !py-4 shadow-xl shadow-[#FF4D94]/20 flex items-center justify-center gap-2"
        >
          <span>前往登录</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        <div className="pt-2">
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.3em] flex items-center justify-center gap-3 opacity-60">
            <span className="w-10 h-px bg-gray-100 dark:bg-gray-800"></span>
            FAMILY BANK
            <span className="w-10 h-px bg-gray-100 dark:bg-gray-800"></span>
          </p>
        </div>
      </div>
    </div>
  );
};
