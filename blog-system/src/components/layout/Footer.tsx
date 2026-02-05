import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t mt-auto bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">元气银行</h3>
            <p className="text-sm text-gray-600">
              家庭积分管理系统，让激励变得简单高效
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-sm">产品</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/blog" className="hover:text-gray-900 transition-colors">文章</Link></li>
              <li><Link href="/categories" className="hover:text-gray-900 transition-colors">分类</Link></li>
              <li><Link href="/tags" className="hover:text-gray-900 transition-colors">标签</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-sm">资源</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/docs" className="hover:text-gray-900 transition-colors">文档</Link></li>
              <li><Link href="/api" className="hover:text-gray-900 transition-colors">API</Link></li>
              <li><Link href="/support" className="hover:text-gray-900 transition-colors">支持</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-sm">公司</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-gray-900 transition-colors">关于</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900 transition-colors">联系</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">隐私政策</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} 元气银行. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              GitHub
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
