import { Mail, MessageSquare, Github, Twitter, Send, Sparkles } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <Send className="w-4 h-4" />
              联系我们
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              我们很乐意听到<br />您的声音
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              有任何问题或建议？选择最适合您的联系方式
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">邮件联系</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                发送邮件给我们，我们会在 24 小时内回复
              </p>
              <a 
                href="mailto:ahkjxy@qq.com" 
                className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 font-semibold transition-colors"
              >
                ahkjxy@qq.com
                <Send className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">在线客服</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                工作日 9:00-18:00 在线为您服务
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
                开始对话
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Github className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">GitHub</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                查看我们的开源项目和技术文档
              </p>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-purple-600 font-semibold transition-colors"
              >
                访问 GitHub
                <Github className="w-4 h-4" />
              </a>
            </div>

            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-fuchsia-200 hover:shadow-2xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Twitter className="w-7 h-7 text-fuchsia-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">社交媒体</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                关注我们获取最新动态和更新
              </p>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-fuchsia-600 hover:text-pink-600 font-semibold transition-colors"
              >
                关注我们
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-gray-100 shadow-lg">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">常见问题</h2>
              <p className="text-gray-600 text-lg">快速找到您需要的答案</p>
            </div>
            
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="border-l-4 border-purple-600 pl-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">如何开始使用元气银行？</h3>
                <p className="text-gray-600 leading-relaxed">
                  只需注册账户，创建家庭空间，添加成员，设置任务和奖励即可开始使用。整个过程不超过 5 分钟。
                </p>
              </div>
              
              <div className="border-l-4 border-pink-600 pl-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">元气银行是免费的吗？</h3>
                <p className="text-gray-600 leading-relaxed">
                  是的，我们提供免费版本供家庭使用。如需更多高级功能，可以升级到专业版。
                </p>
              </div>
              
              <div className="border-l-4 border-indigo-600 pl-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">数据安全吗？</h3>
                <p className="text-gray-600 leading-relaxed">
                  我们使用 Supabase 云服务，采用企业级加密和安全措施，确保您的数据安全。
                </p>
              </div>
              
              <div className="border-l-4 border-fuchsia-600 pl-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">支持多少个家庭成员？</h3>
                <p className="text-gray-600 leading-relaxed">
                  免费版支持最多 6 个家庭成员，专业版支持无限成员。
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4">还有其他问题？</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                我们的支持团队随时准备为您提供帮助
              </p>
              <a
                href="mailto:ahkjxy@qq.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
              >
                发送邮件
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
