import { MessageCircle, Mail, Phone, Clock, HelpCircle, Zap, Book, Code } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 text-sm mb-6">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 font-medium">技术支持</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            我们随时为您提供帮助
          </h1>
          <p className="text-xl text-gray-600">
            遇到问题？我们的支持团队随时准备为您解答
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">在线客服</h3>
            <p className="text-gray-600 mb-4">实时聊天支持</p>
            <a 
              href="/contact"
              className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors inline-block"
            >
              开始对话
            </a>
          </div>

          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">邮件支持</h3>
            <p className="text-gray-600 mb-4">24小时内回复</p>
            <a 
              href="mailto:ahkjxy@qq.com"
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors inline-block"
            >
              发送邮件
            </a>
          </div>

          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">电话支持</h3>
            <p className="text-gray-600 mb-4">工作日 9:00-18:00</p>
            <a 
              href="tel:400-123-4567"
              className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors inline-block"
            >
              400-123-4567
            </a>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-12 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">服务时间</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>在线客服：</strong>每天 9:00 - 22:00</p>
                <p><strong>邮件支持：</strong>7×24 小时（24小时内回复）</p>
                <p><strong>电话支持：</strong>工作日 9:00 - 18:00</p>
                <p className="text-sm text-gray-600 mt-4">
                  节假日可能会影响响应时间，我们会尽快处理您的问题
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">常见问题快速解决</h2>
          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">无法登录账号</h3>
                  <p className="text-gray-600 mb-2">
                    请检查邮箱和密码是否正确。如果忘记密码，可以使用&ldquo;忘记密码&rdquo;功能重置。
                  </p>
                  <a href="/auth/login" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    前往登录页 →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">积分没有更新</h3>
                  <p className="text-gray-600 mb-2">
                    请刷新页面或检查网络连接。系统会自动同步数据，通常几秒内即可完成。
                  </p>
                  <a 
                    href="/dashboard"
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    前往控制台 →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">如何修改个人信息</h3>
                  <p className="text-gray-600 mb-2">
                    登录后进入&ldquo;系统设置&rdquo;，在成员管理中可以修改个人信息和头像。
                  </p>
                  <a href="/dashboard/settings" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    前往设置 →
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">数据安全问题</h3>
                  <p className="text-gray-600 mb-2">
                    我们使用企业级加密技术保护您的数据，所有数据都存储在安全的云端服务器。
                  </p>
                  <a href="/privacy" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    查看隐私政策 →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white border rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">更多资源</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="/docs"
              className="p-6 border rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <Book className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold mb-2 group-hover:text-orange-600">使用文档</h3>
              <p className="text-sm text-gray-600">完整的功能说明和操作指南</p>
            </a>
            <a 
              href="/api"
              className="p-6 border rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <Code className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold mb-2 group-hover:text-orange-600">API 文档</h3>
              <p className="text-sm text-gray-600">开发者接口文档和示例</p>
            </a>
            <a 
              href="/contact"
              className="p-6 border rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <MessageCircle className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold mb-2 group-hover:text-orange-600">联系我们</h3>
              <p className="text-sm text-gray-600">获取更多帮助和反馈</p>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">还有其他问题？</h2>
            <p className="text-orange-50 mb-8 max-w-2xl mx-auto">
              我们的支持团队随时准备为您提供帮助
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-all font-medium"
            >
              联系支持团队
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
