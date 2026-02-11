import { Heart, Users, Sparkles } from 'lucide-react'

/**
 * 公益网站说明组件
 * 用于在网站各处展示公益性质和广告说明
 */
export function PublicWelfareNotice({ variant = 'default' }: { variant?: 'default' | 'compact' | 'footer' }) {
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-gray-900 mb-2">💝 公益平台 · 完全免费</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              元气银行是一个<strong className="text-purple-600">公益性家庭教育分享平台</strong>，所有功能完全免费，无需付费即可使用全部特性。
            </p>
            <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
              <h5 className="text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                关于广告
              </h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                为了维持平台的持续运营和发展，我们会在网站上展示少量广告。我们承诺：
              </p>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <span>所有广告都经过严格筛选，确保内容健康</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <span>广告位置经过精心设计，不影响阅读体验</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <span>广告收入将用于平台维护和功能改进</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          <h4 className="text-base font-bold text-gray-900">关于我们的公益使命</h4>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          元气银行致力于为所有家庭提供免费的教育管理工具和知识分享平台。我们相信，每个家庭都应该有机会获得优质的家庭教育资源。
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          为了维持平台的持续运营和发展，我们会在网站上展示少量广告。我们承诺：所有广告都经过严格筛选，确保不影响您的阅读体验。感谢您的理解与支持！
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white border border-purple-100 rounded-2xl p-8 shadow-sm">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">公益平台 · 完全免费</h3>
            <p className="text-sm text-purple-600 font-medium">Free for Everyone</p>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <p className="text-gray-700 leading-relaxed">
            元气银行是一个<strong className="text-purple-600">公益性家庭教育分享平台</strong>，我们的使命是帮助每个家庭建立积极的教育方式，让孩子在快乐中成长。
          </p>
          <p className="text-gray-700 leading-relaxed">
            平台的所有功能<strong className="text-pink-600">完全免费</strong>，无需付费即可使用全部特性。我们相信，优质的家庭教育资源应该惠及每一个家庭。
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 mb-1.5">关于广告</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                为了维持平台的持续运营和发展，我们会在网站上展示少量广告。我们承诺：
              </p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <span>所有广告都经过严格筛选，确保内容健康</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <span>广告位置经过精心设计，不影响阅读体验</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <span>广告收入将用于平台维护和功能改进</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-purple-500" />
            <span>服务千万家庭</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2 text-gray-600">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>永久免费使用</span>
          </div>
        </div>
      </div>
    </div>
  )
}
