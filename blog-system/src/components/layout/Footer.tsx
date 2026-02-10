import Link from 'next/link'
import { Heart, Github, Twitter, Mail, Sparkles, ExternalLink } from 'lucide-react'
import { PublicWelfareNotice } from '@/components/PublicWelfareNotice'

export function Footer() {
  return (
    <footer className="relative border-t border-purple-100 mt-auto bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Public Welfare Notice */}
        <div className="mb-12">
          <PublicWelfareNotice variant="footer" />
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                元气银行
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-sm">
              家庭积分管理系统，让激励变得简单高效。通过游戏化的方式帮助家庭成员养成良好习惯，让孩子在快乐中成长。
            </p>
            <a
              href="https://blog.familybank.chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all"
            >
              <span>立即体验</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          {/* Links Sections */}
          <div>
            <h4 className="font-bold mb-4 text-sm text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
              产品
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/blog" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                文章
              </Link></li>
              <li><Link href="/categories" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                分类
              </Link></li>
              <li><Link href="/tags" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                标签
              </Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
              资源
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/docs" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                文档
              </Link></li>
              <li><Link href="/api" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                API
              </Link></li>
              <li><Link href="/support" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                支持
              </Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
              公司
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                关于
              </Link></li>
              <li><Link href="/contact" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                联系
              </Link></li>
              <li><Link href="/privacy" className="hover:text-purple-600 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-600 transition-colors"></span>
                隐私政策
              </Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>© {new Date().getFullYear()} 元气银行</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> in China
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="w-9 h-9 rounded-lg bg-white border border-purple-100 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:border-purple-300 hover:shadow-md transition-all"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-lg bg-white border border-purple-100 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:border-purple-300 hover:shadow-md transition-all"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="w-9 h-9 rounded-lg bg-white border border-purple-100 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:border-purple-300 hover:shadow-md transition-all"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
