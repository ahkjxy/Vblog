import { ExternalLink, Sparkles } from 'lucide-react'

interface FamilyBankCTAProps {
  variant?: 'default' | 'compact' | 'banner'
}

export function FamilyBankCTA({ variant = 'default' }: FamilyBankCTAProps) {
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-[#FF4D94] via-[#FF6B9D] to-[#7C4DFF] text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-3 text-sm md:text-base">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-medium">体验元气银行家庭积分管理系统</span>
          <a
            href="https://www.familybank.chat/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-1.5 bg-white text-[#FF4D94] rounded-full font-semibold hover:bg-orange-50 transition-all hover:scale-105"
          >
            立即体验
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          <span>元气银行</span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">体验家庭积分管理系统</h3>
        <p className="text-gray-600 mb-4 text-sm">
          让家庭激励变得简单高效
        </p>
        <a
          href="https://www.familybank.chat/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all"
        >
          立即体验
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#FF4D94] via-[#FF6B9D] to-[#7C4DFF] rounded-3xl p-12 text-white shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>元气银行 - 家庭积分管理系统</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          让家庭激励变得简单高效
        </h2>
        
        <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
          通过游戏化的方式激励家庭成员养成良好习惯，让孩子在快乐中成长，让家庭关系更加和谐
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://www.familybank.chat/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#FF4D94] rounded-full font-bold text-lg hover:bg-orange-50 transition-all hover:scale-110 hover:shadow-2xl group"
          >
            <span>立即免费体验</span>
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <div className="text-sm text-white/80">
            ✨ 无需注册 · 即刻体验
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>任务管理</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>积分兑换</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>成长记录</span>
          </div>
        </div>
      </div>
    </div>
  )
}
