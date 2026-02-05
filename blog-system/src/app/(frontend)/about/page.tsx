import { Zap, Users, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 text-sm mb-6">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 font-medium">关于我们</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            让家庭激励变得简单高效
          </h1>
          <p className="text-xl text-gray-600">
            元气银行是一个专为家庭设计的积分管理系统，通过游戏化的方式激励家庭成员养成良好习惯。
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-4 text-center">我们的使命</h2>
          <p className="text-lg text-gray-700 text-center max-w-2xl mx-auto">
            通过科技的力量，帮助每个家庭建立积极的激励机制，让孩子在快乐中成长，让家庭关系更加和谐。
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">核心价值观</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">简单易用</h3>
              <p className="text-gray-600">
                我们相信好的产品应该简单直观，让每个家庭成员都能轻松上手，无需复杂的学习过程。
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">以人为本</h3>
              <p className="text-gray-600">
                我们关注每个家庭的独特需求，提供灵活的配置选项，让系统真正服务于家庭。
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">持续创新</h3>
              <p className="text-gray-600">
                我们不断探索新的技术和方法，为用户提供更好的体验和更强大的功能。
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">用心服务</h3>
              <p className="text-gray-600">
                我们倾听用户的声音，快速响应反馈，用心打磨每一个细节，让产品更贴近用户需求。
              </p>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold mb-6">我们的故事</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            元气银行诞生于一个普通家庭的需求。作为父母，我们希望通过积极的方式激励孩子养成良好的生活习惯，
            但传统的奖励方式往往难以持续，也缺乏系统性的记录和管理。
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            于是，我们决定开发一个简单易用的家庭积分管理系统。通过游戏化的设计，让孩子在完成任务、
            养成习惯的过程中获得成就感，同时也让家长能够更好地跟踪和管理激励机制。
          </p>
          <p className="text-gray-600 leading-relaxed">
            今天，元气银行已经帮助数百个家庭建立了积极的激励体系，我们将继续努力，
            为更多家庭带来便利和快乐。
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">加入我们的社区</h2>
            <p className="text-orange-50 mb-8 max-w-2xl mx-auto">
              开始使用元气银行，让家庭激励变得更加简单高效
            </p>
            <a
              href="/auth/signup"
              className="inline-block px-8 py-3 bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-all font-medium"
            >
              免费开始
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
