import { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

interface LotteryWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (points: number) => void;
  source: 'badge' | 'exchange';
  badgeTitle?: string;
}

// 转盘扇区配置
const WHEEL_SEGMENTS = [
  { range: [0, 0], color: "from-gray-400 to-gray-500", label: "再接再厉", rotation: 0 },
  { range: [1, 5], color: "from-emerald-400 to-emerald-500", label: "1-5 BP", rotation: 45 },
  { range: [6, 10], color: "from-blue-400 to-blue-500", label: "6-10 BP", rotation: 90 },
  { range: [11, 15], color: "from-amber-400 to-amber-500", label: "11-15 BP", rotation: 135 },
  { range: [0, 0], color: "from-slate-400 to-slate-500", label: "谢谢参与", rotation: 180 },
  { range: [1, 5], color: "from-emerald-400 to-emerald-500", label: "1-5 BP", rotation: 225 },
  { range: [6, 10], color: "from-blue-400 to-blue-500", label: "6-10 BP", rotation: 270 },
  { range: [11, 15], color: "from-amber-400 to-amber-500", label: "11-15 BP", rotation: 315 },
];

export function LotteryWheel({ isOpen, onClose, onComplete, source, badgeTitle }: LotteryWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // 重置内部状态
      setIsSpinning(false);
      setRotation(0);
      setResult(null);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    setShowConfetti(false);

    // 抽奖结果 (前端展示用,实际结果由后端返回)
    const points = getRandomPoints();
    
    // 找到对应的扇区
    // 如果有多个相同范围的扇区，随机选一个
    const matchingSegments = WHEEL_SEGMENTS.map((s, i) => {
        if (points === 0) return s.range[0] === 0 ? i : -1;
        return (points >= s.range[0] && points <= s.range[1]) ? i : -1;
    }).filter(i => i !== -1);
    
    const segmentIndex = matchingSegments[Math.floor(Math.random() * matchingSegments.length)];
    const targetRotation = WHEEL_SEGMENTS[segmentIndex].rotation;
    
    // 计算旋转角度
    const spins = 5;
    const finalRotation = 360 * spins + (360 - targetRotation) + Math.random() * 20 - 10;
    
    setRotation(finalRotation);

    // 落地结果
    setTimeout(() => {
      setResult(points);
      if (points > 0) setShowConfetti(true);
      setIsSpinning(false);
    }, 3000);
  };

  const getRandomPoints = (): number => {
    const random = Math.random() * 100;
    // 30% 几率不中奖
    if (random < 30) return 0;
    // 40% 几率 1-5
    if (random < 70) return Math.floor(Math.random() * 5 + 1);
    // 20% 几率 6-10
    if (random < 90) return Math.floor(Math.random() * 5 + 6);
    // 10% 几率 11-15
    return Math.floor(Math.random() * 5 + 11);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={!isSpinning && result === null ? onClose : () => {}} 
      maxWidth="max-w-md"
      className="!bg-transparent !shadow-none !border-none sm:!p-0"
      hideMobileHandle={true}
    >
      <div className="relative bg-white dark:bg-[#0F172A] rounded-[48px] p-6 sm:p-8 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] flex flex-col justify-between overflow-visible border border-white/10">
        
        {/* 关闭按钮 */}
        {!isSpinning && result === null && (
          <button 
            onClick={onClose} 
            className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-white/5 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
          >
            <Icon name="x" size={20} className="text-gray-900 dark:text-white" />
          </button>
        )}

        {/* 标题栏 */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4D94]/10 text-[#FF4D94] text-[10px] font-black uppercase tracking-widest mb-2 mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] animate-pulse"></div>
            {source === 'badge' ? '徽章特殊奖励' : '积分兑换抽奖'}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight px-4">
            {source === 'badge' ? badgeTitle : '幸运能量转盘'}
          </h3>
          <div className="h-6 flex items-center justify-center mt-1">
            {result === null ? (
               <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                100% 惊喜好礼 · 赢取元气能量
              </p>
            ) : (
               <p className={`text-[11px] font-black animate-bounce ${result > 0 ? 'text-[#FF4D94]' : 'text-gray-400'}`}>
                {result > 0 ? '太棒了！恭喜中奖' : '再接再厉，下次准中'}
              </p>
            )}
          </div>
        </div>

        {/* 转盘主体 */}
        <div className="relative flex items-center justify-center flex-1 py-4 touch-none">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto transition-transform flex items-center justify-center">
            {/* 指针 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-[#FF4D94] drop-shadow-[0_4px_10px_rgba(255,77,148,0.5)] relative">
                <div className="absolute top-[-32px] left-[-4px] w-2 h-2 rounded-full bg-white shadow-sm animate-pulse"></div>
              </div>
            </div>

            {/* 转盘容器 */}
            <div
              className={`relative w-full h-full rounded-full overflow-hidden shadow-[0_20px_80px_-15px_rgba(0,0,0,0.3)] border-8 border-white dark:border-[#1E293B] ${isSpinning ? 'cursor-not-allowed' : 'cursor-default'}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none',
              }}
            >
              {WHEEL_SEGMENTS.map((segment, index) => (
                <div
                  key={index}
                  className={`absolute w-full h-full bg-gradient-to-br ${segment.color}`}
                  style={{
                    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)',
                    transform: `rotate(${segment.rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  <div
                    className="absolute top-[15%] left-[55%] text-white font-black text-[10px] sm:text-xs drop-shadow-lg whitespace-nowrap text-center"
                    style={{ 
                      transform: 'rotate(22.5deg)',
                      transformOrigin: 'center left'
                    }}
                  >
                    {segment.label}
                  </div>
                </div>
              ))}

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-[#1E293B] shadow-[0_4px_15px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.2)] flex items-center justify-center border-4 border-gray-50/50 dark:border-white/5 z-10">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#FF4D94]/5 flex items-center justify-center">
                  <Icon name="reward" size={24} className="text-[#FF4D94]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部动作区 */}
        <div className="mt-8 shrink-0 space-y-4">
            <div className="px-2">
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`btn-base w-full py-4 text-base tracking-widest relative overflow-hidden group gap-2 ${
                  isSpinning
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400'
                    : 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-[#FF4D94]/20'
                }`}
              >
                {isSpinning ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="font-black">正在抽取好运...</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                    <Icon name="reward" size={20} />
                    <span className="font-black">立即开启抽奖</span>
                  </>
                )}
              </button>
            </div>
        </div>

        {/* Result Popup Modal */}
        <Modal
          isOpen={result !== null}
          onClose={onClose}
          maxWidth="max-w-sm"
          className="!z-[60]" // Higher z-index to sit above the wheel modal
        >
          <div className="text-center p-4">
             <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${result && result > 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
               <Icon name={result && result > 0 ? "reward" : "history"} size={40} />
             </div>
             
             <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
               {result && result > 0 ? '恭喜获得奖励!' : '很抱歉，未中奖'}
             </h4>
             
             {result && result > 0 && (
                <div className="flex items-baseline justify-center gap-1.5 my-4">
                  <span className="text-7xl font-black text-[#FF4D94] tracking-tighter drop-shadow-sm">
                    {result}
                  </span>
                  <span className="text-lg font-bold text-gray-400 uppercase">BP</span>
                </div>
             )}

             <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
               {result && result > 0 ? '已自动存入您的账户，继续保持优秀！' : '运气就在转角，下次一定中！'}
             </p>

             <button
               onClick={() => result !== null && onComplete(result)}
               className="btn-base btn-primary w-full shadow-xl shadow-emerald-500/20"
             >
               开心收下
             </button>
          </div>
          
          {/* Confetti for result modal */}
          {result !== null && result > 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px] z-0">
               {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#FF4D94', '#7C4DFF', '#34D399', '#FBBF24'][Math.floor(Math.random() * 4)],
                    animationDuration: `${0.6 + Math.random()}s`,
                    animationDelay: `${Math.random() * 0.3}s`
                  }}
                />
               ))}
            </div>
          )}
        </Modal>

        {/* 烟花特效 */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[48px] z-50">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#FF4D94', '#7C4DFF', '#FFD700', '#00FF00', '#00F0FF'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 0.4}s`,
                  animationDuration: `${0.6 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
