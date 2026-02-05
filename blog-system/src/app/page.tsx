import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold mb-6">
          欢迎使用博客系统
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          基于 Next.js 14 和 Supabase 构建的现代全栈博客平台
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            浏览文章
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            登录后台
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="font-semibold mb-2">富文本编辑</h3>
            <p className="text-sm text-gray-600">
              强大的 TipTap 编辑器，支持图片、格式化等
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-semibold mb-2">安全认证</h3>
            <p className="text-sm text-gray-600">
              Supabase 提供的企业级认证和权限管理
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">实时更新</h3>
            <p className="text-sm text-gray-600">
              实时数据同步，无需刷新页面
            </p>
          </div>
        </div>

        <div className="mt-16 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-2">🚀 首次使用？</h3>
          <p className="text-sm text-gray-700 mb-4">
            请先在 Supabase 中运行数据库 schema，然后创建管理员账户
          </p>
          <Link
            href="/auth/signup"
            className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            立即注册 →
          </Link>
        </div>
      </div>
    </div>
  )
}
