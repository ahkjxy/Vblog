import { Icon } from "./Icon";
import { Modal } from "./Modal";

interface LotteryRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LotteryRulesModal({ isOpen, onClose }: LotteryRulesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center z-10"
        >
          <Icon name="close" size={20} />
        </button>

        {/* 标题 */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/10 text-[#FF4D94] text-xs font-black uppercase tracking-wider mb-4">
            <div className="w-2 h-2 rounded-full bg-[#FF4D94] animate-pulse"></div>
            抽奖规则
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            🎰 幸运转盘规则说明
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            了解如何参与抽奖,赢取更多元气值
          </p>
        </div>

        {/* 规则内容 */}
        <div className="space-y-6">
          {/* 1. 抽奖方式 */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-6 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black text-lg">
                1
              </div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                抽奖方式
              </h4>
            </div>
            <div className="space-y-3 lg:ml-12">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="reward" size={14} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">
                    🏆 徽章奖励抽奖
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    每次获得成就徽章时,自动获得一次免费抽奖机会。每个徽章仅可抽奖一次。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="plus" size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">
                    💎 积分兑换抽奖
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    消耗 <span className="font-bold text-[#FF4D94]">10积分</span> 可兑换一次抽奖机会,每天最多兑换 <span className="font-bold text-[#7C4DFF]">3次</span>,每日0点重置。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 奖励分布 */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-6 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black text-lg">
                2
              </div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                奖励分布
              </h4>
            </div>
            <div className="space-y-3 lg:ml-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { range: "0", label: "再接再厉", probability: "30%", color: "gray", icon: "🍀" },
                  { range: "1-5", label: "元气值", probability: "40%", color: "emerald", icon: "🌱" },
                  { range: "6-10", label: "元气值", probability: "20%", color: "blue", icon: "💧" },
                  { range: "11-15", label: "元气值", probability: "10%", color: "amber", icon: "💎" },
                ].map((tier, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl ${tier.color === 'gray' ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10' : `bg-${tier.color}-50 dark:bg-${tier.color}-500/10 border border-${tier.color}-100 dark:border-${tier.color}-500/20`}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-2xl">{tier.icon}</span>
                       <div className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-white/10 text-[10px] font-black uppercase">
                        {tier.probability}
                       </div>
                    </div>
                    <p className={`text-lg font-black ${tier.color === 'gray' ? 'text-gray-400' : `text-${tier.color}-600 dark:text-${tier.color}-400`}`}>
                      {tier.range} {tier.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>
                    期望值: <span className="font-black">4.1</span> 元气值 | 
                    抽奖属性: <span className="font-black">概率随机</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 3. 使用技巧 */}
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent p-6 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black text-lg">
                3
              </div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                使用技巧
              </h4>
            </div>
            <div className="space-y-2 lg:ml-12">
              {[
                "💡 优先使用徽章奖励抽奖,完全免费",
                "🎯 每天坚持兑换3次,长期收益可观",
                "📈 积分充足时,兑换抽奖期望收益为正",
                "🏆 完成更多任务获得徽章,解锁更多免费机会",
                "⏰ 每天0点重置兑换次数,记得及时使用",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 注意事项 */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 p-6 rounded-2xl border border-red-100 dark:border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-lg">
                ⚠️
              </div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white">
                注意事项
              </h4>
            </div>
            <div className="space-y-2 lg:ml-12">
              {[
                "每个徽章的抽奖机会仅限一次,请珍惜使用",
                "积分兑换抽奖会立即扣除10积分,请确保余额充足",
                "每日兑换次数在0点重置,未使用次数不会累积",
                "抽奖结果由系统随机生成,公平公正",
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white font-black hover:brightness-110 transition-all shadow-lg"
          >
            我知道了
          </button>
        </div>
    </Modal>
  );
}
