import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen, ArrowRight } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
  
  // 为每个分类获取文章数量
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      // 获取该分类下的文章ID
      const { data: postCategories } = await supabase
        .from('post_categories')
        .select('post_id')
        .eq('category_id', category.id)
      
      const postIds = postCategories?.map(pc => pc.post_id) || []
      
      // 统计已发布且审核通过的文章数量
      if (postIds.length === 0) {
        return { ...category, postCount: 0 }
      }
      
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .in('id', postIds)
        .eq('status', 'published')
        .eq('review_status', 'approved')
      
      return { ...category, postCount: count || 0 }
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs sm:text-sm font-black text-[#FF4D94] mb-6 shadow-sm border border-[#FF4D94]/20">
              <FolderOpen className="w-4 h-4" />
              分类目录
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
              文章分类
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
              浏览不同主题的文章内容
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {categoriesWithCount && categoriesWithCount.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {categoriesWithCount.map((category, index) => {
                const gradients = [
                  { from: 'from-purple-500', to: 'to-pink-500', bg: 'from-purple-100 to-pink-100' },
                  { from: 'from-pink-500', to: 'to-rose-500', bg: 'from-pink-100 to-rose-100' },
                  { from: 'from-purple-600', to: 'to-indigo-500', bg: 'from-purple-100 to-indigo-100' },
                  { from: 'from-fuchsia-500', to: 'to-pink-500', bg: 'from-fuchsia-100 to-pink-100' },
                ]
                const gradient = gradients[index % gradients.length]
                
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF4D94]/30 h-full flex flex-col">
                      <div className={`w-14 h-14 bg-gradient-to-br ${gradient.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                        <FolderOpen className={`w-7 h-7 bg-gradient-to-br ${gradient.from} ${gradient.to} bg-clip-text text-transparent`} style={{WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text'}} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black mb-3 group-hover:text-[#FF4D94] transition-colors">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-sm sm:text-base text-gray-600 mb-6 line-clamp-2 flex-1 leading-relaxed font-medium">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider">
                          {category.postCount} 篇文章
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF4D94] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-[#FF4D94]/20">
              <div className="max-w-md mx-auto px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                  <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4D94]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">暂无分类</h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium">还没有创建任何分类</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
