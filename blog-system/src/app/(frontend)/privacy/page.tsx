import { Shield, Lock, Eye, Cookie, UserCheck, Baby, RefreshCw, Mail } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: '1. 信息收集',
      content: '我们收集以下类型的信息：',
      items: [
        '账户信息：用户名、邮箱地址',
        '使用数据：任务记录、积分变动、兑换历史',
        '设备信息：IP 地址、浏览器类型、操作系统'
      ]
    },
    {
      icon: Shield,
      title: '2. 信息使用',
      content: '我们使用收集的信息用于：',
      items: [
        '提供和改进我们的服务',
        '处理您的请求和交易',
        '发送服务通知和更新',
        '分析使用趋势和优化用户体验',
        '防止欺诈和滥用'
      ]
    },
    {
      icon: UserCheck,
      title: '3. 信息共享',
      content: '我们不会出售、交易或出租您的个人信息给第三方。我们可能在以下情况下共享信息：',
      items: [
        '经您同意',
        '为提供服务所必需（如云服务提供商）',
        '遵守法律要求',
        '保护我们的权利和安全'
      ]
    },
    {
      icon: Lock,
      title: '4. 数据安全',
      content: '我们采取以下措施保护您的数据：',
      items: [
        '使用 SSL/TLS 加密传输',
        '数据库加密存储',
        '定期安全审计',
        '访问控制和权限管理',
        '定期备份'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1oMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>隐私保护</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">隐私政策</h1>
            <p className="text-xl text-white/90 mb-4">我们重视并保护您的隐私</p>
            <p className="text-sm text-white/70">最后更新：2024年1月</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {sections.map((section, index) => {
              const Icon = section.icon
              const gradients = [
                { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-50' },
                { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-50' },
                { from: 'from-purple-600', to: 'to-indigo-500', bg: 'bg-purple-50' },
                { from: 'from-fuchsia-500', to: 'to-pink-500', bg: 'bg-fuchsia-50' }
              ]
              const gradient = gradients[index % gradients.length]
              
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">{section.title}</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">{section.content}</p>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} mt-2 flex-shrink-0`}></div>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Additional Sections */}
          <div className="space-y-8">
            {/* Cookie Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Cookie className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Cookie 使用</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">我们使用 Cookie 和类似技术来：</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {['保持您的登录状态', '记住您的偏好设置', '分析网站使用情况', '提供个性化体验'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500"></div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    💡 您可以通过浏览器设置管理 Cookie 偏好。
                  </p>
                </div>
              </div>
            </div>

            {/* User Rights Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">6. 您的权利</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">您有权：</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['访问您的个人信息', '更正不准确的信息', '删除您的账户和数据', '导出您的数据', '反对或限制某些数据处理'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-700 bg-green-50 rounded-lg p-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Children Privacy Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Baby className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">7. 儿童隐私</h2>
                  <p className="text-gray-700 leading-relaxed">
                    我们的服务面向家庭使用。家长或监护人负责管理儿童账户和数据。
                    我们不会在未经家长同意的情况下收集 13 岁以下儿童的个人信息。
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Updates Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">8. 政策更新</h2>
                  <p className="text-gray-700 leading-relaxed">
                    我们可能会不时更新本隐私政策。重大变更时，我们会通过邮件或网站通知您。
                    继续使用我们的服务即表示您接受更新后的政策。
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-8 shadow-xl text-white">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">9. 联系我们</h2>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    如对本隐私政策有任何疑问，请联系我们：
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-white/70 mb-1">邮箱</div>
                        <div className="font-semibold">ahkjxy@qq.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-white/70 mb-1">地址</div>
                        <div className="font-semibold">中国</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
