import { Book, Zap, Settings, ShoppingBag, History, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <Book className="w-4 h-4" />
              文档中心
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              元气银行使用文档
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              完整的功能说明和操作指南，帮助您快速上手元气银行
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Quick Start */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-8">快速开始</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { num: '1', title: '注册账号', desc: '创建您的元气银行账号，开始家庭积分管理之旅' },
                  { num: '2', title: '添加家庭成员', desc: '在设置中添加家庭成员，为每个人创建独立账户' },
                  { num: '3', title: '设置任务和奖励', desc: '配置日常任务和奖励商品，建立激励机制' },
                  { num: '4', title: '开始使用', desc: '记录任务完成情况，兑换奖励，享受家庭激励的乐趣' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-white text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-lg">{step.title}</h3>
                      <p className="text-white/90 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">核心功能</h2>
              <p className="text-gray-600 text-lg">强大的功能帮助您管理家庭积分</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Zap,
                  title: '元气任务',
                  desc: '创建和管理日常任务，完成任务即可获得元气积分。支持自定义任务类型、积分值和结算周期。',
                  features: ['自定义任务分类', '灵活的积分设置', '多种结算周期'],
                  gradient: 'from-purple-100 to-pink-100',
                  color: 'text-purple-600'
                },
                {
                  icon: ShoppingBag,
                  title: '梦想商店',
                  desc: '使用积分兑换心仪的奖励。支持实物奖励和特权奖励，让激励更有吸引力。',
                  features: ['丰富的奖励类型', '库存管理', '兑换记录追踪'],
                  gradient: 'from-pink-100 to-rose-100',
                  color: 'text-pink-600'
                },
                {
                  icon: History,
                  title: '能量账单',
                  desc: '查看完整的积分变动记录，包括任务完成、奖励兑换、违规扣减等所有交易。',
                  features: ['详细的交易记录', '多维度筛选', '数据导出功能'],
                  gradient: 'from-indigo-100 to-purple-100',
                  color: 'text-indigo-600'
                },
                {
                  icon: Settings,
                  title: '系统设置',
                  desc: '管理员可以配置系统规则、管理家庭成员、设置权限等。',
                  features: ['成员管理', '权限控制', '规则配置'],
                  gradient: 'from-fuchsia-100 to-pink-100',
                  color: 'text-fuchsia-600'
                },
              ].map((feature) => (
                <div key={feature.title} className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-gray-100 shadow-lg">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">技术规范</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-6 text-purple-600 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  前端技术
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {['React 18 + TypeScript', 'Next.js 15 (App Router)', 'Tailwind CSS', 'Radix UI 组件库'].map((tech) => (
                    <li key={tech} className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6 text-pink-600 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-pink-600 to-rose-600 rounded-full"></div>
                  后端技术
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {['Supabase (BaaS)', 'PostgreSQL 数据库', '实时数据同步', 'S3 对象存储'].map((tech) => (
                    <li key={tech} className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">常见问题</h2>
              <p className="text-gray-600 text-lg">快速找到您需要的答案</p>
            </div>
            
            <div className="space-y-6">
              {[
                { q: '如何添加新的任务类型？', a: '管理员可以在"系统设置"中添加新的任务分类和具体任务项，设置对应的积分值和结算周期。', color: 'border-purple-600' },
                { q: '积分可以转让给其他成员吗？', a: '可以的，现在增加了许愿和赠送功能，成员之间可以互相转让积分。', color: 'border-pink-600' },
                { q: '如何设置管理员权限？', a: '在"系统设置"的成员管理中，可以为特定成员分配管理员角色，管理员拥有完整的系统配置权限。', color: 'border-indigo-600' },
                { q: '数据会自动同步吗？', a: '是的，所有数据都实时同步到云端，多设备访问时数据保持一致，无需手动同步。', color: 'border-fuchsia-600' },
              ].map((faq, index) => (
                <div key={index} className={`bg-white rounded-2xl p-6 border-l-4 ${faq.color} shadow-sm hover:shadow-md transition-shadow`}>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4">需要更多帮助？</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                查看我们的 API 文档或联系技术支持团队
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/api"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg"
                >
                  API 文档
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-xl font-bold text-lg hover:bg-purple-800 transition-all border-2 border-white/30"
                >
                  联系支持
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
