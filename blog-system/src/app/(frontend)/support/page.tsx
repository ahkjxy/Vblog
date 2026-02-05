import { MessageCircle, Mail, Phone, Clock, HelpCircle, Zap, Book, Code, Sparkles, ArrowRight, Send } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <HelpCircle className="w-4 h-4" />
              技术支持
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              我们随时为您<br />提供帮助
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              遇到问题？我们的支持团队随时准备为您解答
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: '在线客服',
                desc: '实时聊天支持',
                action: '开始对话',
                href: '/contact',
                gradient: 'from-purple-100 to-pink-100',
                color: 'text-purple-600',
                btnColor: 'from-purple-600 to-pink-600'
              },
              {
                icon: Mail,
                title: '邮件支持',
                desc: '24小时内回复',
                action: '发送邮件',
                href: 'mailto:ahkjxy@qq.com',
                gradient: 'from-pink-100 to-rose-100',
                color: 'text-pink-600',
                btnColor: 'from-pink-600 to-rose-600'
              },
              {
                icon: Phone,
                title: '电话支持',
                desc: '工作日 9:00-18:00',
                action: '400-123-4567',
                href: 'tel:400-123-4567',
                gradient: 'from-indigo-100 to-purple-100',
                color: 'text-indigo-600',
                btnColor: 'from-indigo-600 to-purple-600'
              },
            ].map((method) => (
              <div key={method.title} className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all text-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${method.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                  <method.icon className={`w-7 h-7 ${method.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{method.title}</h3>
                <p className="text-gray-600 mb-6">{method.desc}</p>
                <a 
                  href={method.href}
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${method.btnColor} text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all`}
                >
                  {method.action}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Support Hours */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">服务时间</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: '在线客服', time: '每天 9:00 - 22:00' },
                    { label: '邮件支持', time: '7×24 小时（24小时内回复）' },
                    { label: '电话支持', time: '工作日 9:00 - 18:00' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="font-bold mb-2">{item.label}</div>
                      <div className="text-sm text-white/90">{item.time}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/80 mt-6">
                  节假日可能会影响响应时间，我们会尽快处理您的问题
                </p>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">常见问题快速解决</h2>
              <p className="text-gray-600 text-lg">快速找到常见问题的解决方案</p>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  title: '无法登录账号',
                  desc: '请检查邮箱和密码是否正确。如果忘记密码，可以使用"忘记密码"功能重置。',
                  link: '/auth/login',
                  linkText: '前往登录页',
                  color: 'border-purple-600'
                },
                {
                  title: '积分没有更新',
                  desc: '请刷新页面或检查网络连接。系统会自动同步数据，通常几秒内即可完成。',
                  link: '/dashboard',
                  linkText: '前往控制台',
                  color: 'border-pink-600'
                },
                {
                  title: '如何修改个人信息',
                  desc: '登录后进入"系统设置"，在成员管理中可以修改个人信息和头像。',
                  link: '/dashboard/settings',
                  linkText: '前往设置',
                  color: 'border-indigo-600'
                },
                {
                  title: '数据安全问题',
                  desc: '我们使用企业级加密技术保护您的数据，所有数据都存储在安全的云端服务器。',
                  link: '/privacy',
                  linkText: '查看隐私政策',
                  color: 'border-fuchsia-600'
                },
              ].map((issue) => (
                <div key={issue.title} className={`bg-white rounded-2xl p-8 border-l-4 ${issue.color} shadow-sm hover:shadow-lg transition-shadow`}>
                  <div className="flex items-start gap-4">
                    <Zap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{issue.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{issue.desc}</p>
                      <Link href={issue.link} className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 font-semibold transition-colors">
                        {issue.linkText}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-gray-100 shadow-lg">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">更多资源</h2>
              <p className="text-gray-600 text-lg">探索更多帮助资源</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Book,
                  title: '使用文档',
                  desc: '完整的功能说明和操作指南',
                  href: '/docs',
                  gradient: 'from-purple-100 to-pink-100',
                  color: 'text-purple-600'
                },
                {
                  icon: Code,
                  title: 'API 文档',
                  desc: '开发者接口文档和示例',
                  href: '/api',
                  gradient: 'from-pink-100 to-rose-100',
                  color: 'text-pink-600'
                },
                {
                  icon: MessageCircle,
                  title: '联系我们',
                  desc: '获取更多帮助和反馈',
                  href: '/contact',
                  gradient: 'from-indigo-100 to-purple-100',
                  color: 'text-indigo-600'
                },
              ].map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="group p-8 border border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-2xl transition-all"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${resource.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <resource.icon className={`w-7 h-7 ${resource.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">{resource.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{resource.desc}</p>
                </Link>
              ))}
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
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
              >
                联系支持团队
                <Send className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
