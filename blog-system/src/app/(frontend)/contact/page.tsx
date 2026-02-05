import { Mail, MessageSquare, Github, Twitter } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            联系我们
          </h1>
          <p className="text-xl text-gray-600">
            有任何问题或建议？我们很乐意听到您的声音
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">邮件联系</h3>
            <p className="text-gray-600 mb-4">
              发送邮件给我们，我们会在 24 小时内回复
            </p>
            <a href="mailto:ahkjxy@qq.com" className="text-orange-600 hover:text-orange-700 font-medium">
              ahkjxy@qq.com
            </a>
          </div>

          <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">在线客服</h3>
            <p className="text-gray-600 mb-4">
              工作日 9:00-18:00 在线为您服务
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              开始对话
            </button>
          </div>

          <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <Github className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">GitHub</h3>
            <p className="text-gray-600 mb-4">
              查看我们的开源项目和技术文档
            </p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 font-medium">
              访问 GitHub
            </a>
          </div>

          <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Twitter className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">社交媒体</h3>
            <p className="text-gray-600 mb-4">
              关注我们获取最新动态和更新
            </p>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
              关注我们
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">常见问题</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">如何开始使用元气银行？</h3>
              <p className="text-gray-600">
                只需注册账户，创建家庭空间，添加成员，设置任务和奖励即可开始使用。整个过程不超过 5 分钟。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">元气银行是免费的吗？</h3>
              <p className="text-gray-600">
                是的，我们提供免费版本供家庭使用。如需更多高级功能，可以升级到专业版。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">数据安全吗？</h3>
              <p className="text-gray-600">
                我们使用 Supabase 云服务，采用企业级加密和安全措施，确保您的数据安全。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">支持多少个家庭成员？</h3>
              <p className="text-gray-600">
                免费版支持最多 6 个家庭成员，专业版支持无限成员。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
