import { Zap, Target, Heart, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于我们',
  description: '了解元气银行的使命、愿景和核心价值观。我们致力于通过科技的力量，帮助每个家庭建立积极的激励机制，让孩子在快乐中成长。',
  openGraph: {
    title: '关于我们 | 元气银行博客',
    description: '了解元气银行的使命、愿景和核心价值观',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <Sparkles className="w-4 h-4" />
              关于我们
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              让家庭激励变得<br />简单高效
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              元气银行是一个专为家庭设计的积分管理系统，通过游戏化的方式激励家庭成员养成良好习惯
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Mission */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">我们的使命</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                通过科技的力量，帮助每个家庭建立积极的激励机制，让孩子在快乐中成长，让家庭关系更加和谐
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">核心价值观</h2>
              <p className="text-gray-600 text-lg">指引我们前进的核心理念</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">简单易用</h3>
                <p className="text-gray-600 leading-relaxed">
                  我们相信好的产品应该简单直观，让每个家庭成员都能轻松上手，无需复杂的学习过程
                </p>
              </div>

              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">以人为本</h3>
                <p className="text-gray-600 leading-relaxed">
                  我们关注每个家庭的独特需求，提供灵活的配置选项，让系统真正服务于家庭
                </p>
              </div>

              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">持续创新</h3>
                <p className="text-gray-600 leading-relaxed">
                  我们不断探索新的技术和方法，为用户提供更好的体验和更强大的功能
                </p>
              </div>

              <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-fuchsia-200 hover:shadow-2xl transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-fuchsia-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">用心服务</h3>
                <p className="text-gray-600 leading-relaxed">
                  我们倾听用户的声音，快速响应反馈，用心打磨每一个细节，让产品更贴近用户需求
                </p>
              </div>
            </div>
          </div>

          {/* Story */}
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-gray-100 shadow-lg">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">我们的故事</h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                元气银行诞生于一个普通家庭的需求。作为父母，我们希望通过积极的方式激励孩子养成良好的生活习惯，
                但传统的奖励方式往往难以持续，也缺乏系统性的记录和管理。
              </p>
              <p>
                于是，我们决定开发一个简单易用的家庭积分管理系统。通过游戏化的设计，让孩子在完成任务、
                养成习惯的过程中获得成就感，同时也让家长能够更好地跟踪和管理激励机制。
              </p>
              <p>
                今天，元气银行已经帮助数百个家庭建立了积极的激励体系，我们将继续努力，
                为更多家庭带来便利和快乐。
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4">加入我们的社区</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                开始使用元气银行，让家庭激励变得更加简单高效
              </p>
              <Link
                href="https://www.familybank.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
              >
                立即免费体验
                <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
