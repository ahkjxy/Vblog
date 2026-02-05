import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white p-1.5">
            <Logo className="w-full h-full" />
          </div>
          <span className="text-xl font-semibold tracking-tight">元气银行</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
            文档
          </Link>
          <Link href="/categories" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
            分类
          </Link>
          <Link href="/tags" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
            标签
          </Link>
          <Link 
            href="/auth/login" 
            className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-lg transition-all"
          >
            登录
          </Link>
        </nav>
      </div>
    </header>
  )
}
