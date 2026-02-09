import { useEffect, useState } from "react";
import { Language, useTranslation } from "../i18n/translations";

interface SplashProps {
  onComplete?: () => void;
  duration?: number;
  message?: string;
  language?: Language;
}

export function Splash({ onComplete, duration = 3000, message, language = 'zh' }: SplashProps) {
  const { t } = useTranslation(language);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1000);
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out bg-white ${
        isFadingOut ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      {/* 1. Bright Brand Gradient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#FFF0F5_0%,_#FDF2F8_60%,_#FFFFFF_100%)]"></div>
      
      {/* Decorative Orbs - Smooth Breathing Pulse */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#FF4D94]/10 rounded-full blur-[100px] animate-[deep-breath_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#7C4DFF]/10 rounded-full blur-[100px] animate-[deep-breath_10s_ease-in-out_infinite_reverse]" />

      {/* 2. Floating Crystal Shapes (Silky Smooth) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => {
          // Generate deterministic but random-looking values for stability during re-renders
          const left = (i * 123 + 55) % 90 + 5; 
          const top = (i * 234 + 22) % 80 + 10;
          const delay = (i * 37) % 5;
          const duration = (i * 19) % 3 + 6; // 6-9s slow duration
          const scale = ((i * 7) % 5 + 5) / 10; // 0.5 - 1.0 scale
          
          return (
            <div
              key={`shape-${i}`}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                fontSize: `${20 + (i * 5) % 20}px`,
                opacity: 0.6,
                transform: `scale(${scale})`,
                animation: `organic-float ${duration}s ease-in-out infinite`,
                animationDelay: `-${delay}s`, // Negative delay starts animation mid-cycle
                filter: 'drop-shadow(0 4px 8px rgba(255, 77, 148, 0.15))'
              }}
            >
              {['💎', '✨', '🌸', '🍭', '⭐', '🦄'][i % 6]}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* 3. Brand Identity Core */}
        <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
          
          {/* Rotating Rings - Smooth Continuous Spin */}
          <div className="absolute inset-0 border-[3px] border-dashed border-[#FF4D94]/30 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 border-[3px] border-dashed border-[#7C4DFF]/30 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
          
          {/* Central Gem Container - Gentle Hover */}
          <div className="w-36 h-36 rounded-[40px] bg-gradient-to-br from-white to-[#FFF0F5] shadow-[0_20px_50px_-10px_rgba(255,77,148,0.3)] flex flex-col items-center justify-center relative z-10 transform rotate-45 border border-white animate-[gentle-hover_4s_ease-in-out_infinite]">
            <div className="transform -rotate-45 text-6xl filter drop-shadow-xl">🦄</div>
            
            {/* Sparkle Glint */}
            <div className="absolute -top-3 -right-3 text-3xl animate-[twinkle_2s_ease-in-out_infinite] opacity-80">✨</div>
          </div>

          {/* Orbiting Satellites - Elliptical Smooth Paths */}
          <div className="absolute inset-[-20%] animate-[spin_12s_linear_infinite]">
            <div className="absolute top-1/2 -right-4 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[10px] animate-[spin_12s_linear_infinite_reverse]">⭐</div>
          </div>
        </div>

        {/* 4. Clear Typography */}
        <div className="text-center space-y-6">
          <div className="space-y-1 relative">
            <h1 className="text-5xl font-black tracking-tight text-[#0F172A] drop-shadow-sm animate-[fade-slide-up_0.8s_ease-out]">
              {language === 'zh' ? (
                <>
                  <span className="text-[#FF4D94]">{t.app.energyBank}</span>银行
                </>
              ) : (
                <span className="text-[#FF4D94]">{t.app.name}</span>
              )}
            </h1>
            <p className="text-xs font-bold text-[#7C4DFF] tracking-[0.4em] uppercase opacity-70 animate-[fade-slide-up_1s_ease-out]">
              MAGIC ADVENTURE
            </p>
          </div>

          {/* Brand Loading Bar - Smooth Expansion */}
          <div className="w-48 h-2 bg-[#F3F4F6] rounded-full overflow-hidden mx-auto mt-8 relative shadow-inner">
            <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] rounded-full animate-[loading-scan-smooth_2s_ease-in-out_infinite]" />
          </div>
          
          <p className="text-[10px] font-bold text-gray-400 animate-pulse">
            {message || t.app.loading}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes organic-float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -15px) rotate(5deg); }
          66% { transform: translate(-5px, -8px) rotate(-3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes deep-breath {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }
        @keyframes gentle-hover {
          0%, 100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(-10px); }
        }
        @keyframes loading-scan-smooth {
          0% { left: -35%; width: 20%; }
          50% { width: 50%; }
          100% { left: 115%; width: 20%; }
        }
        @keyframes twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
