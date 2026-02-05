import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          元气银行
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            文章
          </Link>
          <Link href="/categories" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            分类
          </Link>
          <Link href="/tags" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            标签
          </Link>
          <Link 
            href="/auth/login" 
            className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all"
          >
            登录
          </Link>
        </nav>
      </div>
    </header>
  )
}
