import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*, post_categories(count)')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-orange-600 mb-4">
              分类目录
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">文章分类</h1>
            <p className="text-xl text-gray-600">
              浏览不同主题的文章内容
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all border border-gray-100 h-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FolderOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {category.post_categories?.length || 0} 篇文章
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">暂无分类</h3>
                <p className="text-gray-600">还没有创建任何分类</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
