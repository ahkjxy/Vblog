import { Mail, MessageSquare, Github, Twitter, Send, Sparkles } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs sm:text-sm font-black text-[#FF4D94] mb-6 shadow-sm border border-[#FF4D94]/20">
              <Send className="w-4 h-4" />
              联系我们
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
              我们很乐意听到<br className="hidden sm:block" />您的声音
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              有任何问题或建议？选择最适合您的联系方式
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 md:space-y-20">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF4D94]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-gray-900">邮件联系</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                发送邮件给我们，我们会在 24 小时内回复
              </p>
              <a 
                href="mailto:ahkjxy@qq.com" 
                className="inline-flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-sm sm:text-base transition-colors"
              >
                ahkjxy@qq.com
                <Send className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-[#7C4DFF]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-gray-900">在线客服</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                工作日 9:00-18:00 在线为您服务
              </p>
              <button className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black text-sm sm:text-base hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                开始对话
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Github className="w-6 h-6 sm:w-7 sm:h-7 text-[#7C4DFF]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-gray-900">GitHub</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                查看我们的开源项目和技术文档
              </p>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-[#7C4DFF] hover:text-[#FF4D94] font-black text-sm sm:text-base transition-colors"
              >
                访问 GitHub
                <Github className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Twitter className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF4D94]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-gray-900">社交媒体</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                关注我们获取最新动态和更新
              </p>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-sm sm:text-base transition-colors"
              >
                关注我们
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 border border-gray-100 shadow-lg">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">常见问题</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">快速找到您需要的答案</p>
            </div>
            
            <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
              <div className="border-l-4 border-[#FF4D94] pl-4 sm:pl-6">
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">如何开始使用元气银行？</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                  只需注册账户，创建家庭空间，添加成员，设置任务和奖励即可开始使用。整个过程不超过 5 分钟。
                </p>
              </div>
              
              <div className="border-l-4 border-[#7C4DFF] pl-4 sm:pl-6">
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">元气银行是免费的吗？</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                  是的，元气银行是一个<strong className="text-[#FF4D94]">完全免费的公益平台</strong>。所有功能都可以免费使用，没有任何付费限制。我们的目标是让每个家庭都能享受到优质的家庭教育管理工具。
                </p>
              </div>
              
              <div className="border-l-4 border-[#FF4D94] pl-4 sm:pl-6">
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">为什么网站上有广告？</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                  为了维持平台的持续运营和发展，我们会展示少量广告。所有广告都经过严格筛选，确保不影响您的使用体验。广告收入将用于服务器维护和功能改进。
                </p>
              </div>
              
              <div className="border-l-4 border-[#7C4DFF] pl-4 sm:pl-6">
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">数据安全吗？</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                  我们使用 Supabase 云服务，采用企业级加密和安全措施，确保您的数据安全。
                </p>
              </div>
              
              <div className="border-l-4 border-[#FF4D94] pl-4 sm:pl-6">
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">支持多少个家庭成员？</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                  没有限制！您可以添加任意数量的家庭成员，所有功能都完全免费开放。
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-3xl p-8 sm:p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">还有其他问题？</h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
                我们的支持团队随时准备为您提供帮助
              </p>
              <a
                href="mailto:ahkjxy@qq.com"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#FF4D94] rounded-2xl font-black text-sm sm:text-base md:text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                发送邮件
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
