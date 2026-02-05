import { Book, Zap, Settings, ShoppingBag, History } from 'lucide-react'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 text-sm mb-6">
            <Book className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 font-medium">文档中心</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            元气银行使用文档
          </h1>
          <p className="text-xl text-gray-600">
            完整的功能说明和操作指南，帮助您快速上手元气银行
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-6">快速开始</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">注册账号</h3>
                <p className="text-gray-600">创建您的元气银行账号，开始家庭积分管理之旅</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">添加家庭成员</h3>
                <p className="text-gray-600">在设置中添加家庭成员，为每个人创建独立账户</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">设置任务和奖励</h3>
                <p className="text-gray-600">配置日常任务和奖励商品，建立激励机制</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">开始使用</h3>
                <p className="text-gray-600">记录任务完成情况，兑换奖励，享受家庭激励的乐趣</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">元气任务</h3>
              <p className="text-gray-600 mb-4">
                创建和管理日常任务，完成任务即可获得元气积分。支持自定义任务类型、积分值和结算周期。
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 自定义任务分类</li>
                <li>• 灵活的积分设置</li>
                <li>• 多种结算周期</li>
              </ul>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">梦想商店</h3>
              <p className="text-gray-600 mb-4">
                使用积分兑换心仪的奖励。支持实物奖励和特权奖励，让激励更有吸引力。
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 丰富的奖励类型</li>
                <li>• 库存管理</li>
                <li>• 兑换记录追踪</li>
              </ul>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <History className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">能量账单</h3>
              <p className="text-gray-600 mb-4">
                查看完整的积分变动记录，包括任务完成、奖励兑换、违规扣减等所有交易。
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 详细的交易记录</li>
                <li>• 多维度筛选</li>
                <li>• 数据导出功能</li>
              </ul>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">系统设置</h3>
              <p className="text-gray-600 mb-4">
                管理员可以配置系统规则、管理家庭成员、设置权限等。
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 成员管理</li>
                <li>• 权限控制</li>
                <li>• 规则配置</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="bg-white border rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8">技术规范</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-orange-600">前端技术</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 18 + TypeScript</li>
                <li>• Next.js 15 (App Router)</li>
                <li>• Tailwind CSS</li>
                <li>• Radix UI 组件库</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-orange-600">后端技术</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Supabase (BaaS)</li>
                <li>• PostgreSQL 数据库</li>
                <li>• 实时数据同步</li>
                <li>• S3 对象存储</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">常见问题</h2>
          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">如何添加新的任务类型？</h3>
              <p className="text-gray-600">
                管理员可以在"系统设置"中添加新的任务分类和具体任务项，设置对应的积分值和结算周期。
              </p>
            </div>
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">积分可以转让给其他成员吗？</h3>
              <p className="text-gray-600">
                目前系统不支持积分转让功能，每个成员的积分独立管理，确保激励机制的公平性。
              </p>
            </div>
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">如何设置管理员权限？</h3>
              <p className="text-gray-600">
                在&ldquo;系统设置&rdquo;的成员管理中，可以为特定成员分配管理员角色，管理员拥有完整的系统配置权限。
              </p>
            </div>
            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">数据会自动同步吗？</h3>
              <p className="text-gray-600">
                是的，所有数据都实时同步到云端，多设备访问时数据保持一致，无需手动同步。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">需要更多帮助？</h2>
            <p className="text-orange-50 mb-8 max-w-2xl mx-auto">
              查看我们的 API 文档或联系技术支持团队
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/api"
                className="inline-block px-8 py-3 bg-white text-orange-600 rounded-full hover:bg-orange-50 transition-all font-medium"
              >
                API 文档
              </Link>
              <Link
                href="/support"
                className="inline-block px-8 py-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all font-medium border-2 border-white"
              >
                联系支持
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
