import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Tag } from 'lucide-react'

export default async function TagsPage() {
  const supabase = await createClient()
  
  const { data: tags } = await supabase
    .from('tags')
    .select('*, post_tags(count)')
    .order('name', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs sm:text-sm font-black text-[#FF4D94] mb-6 shadow-sm border border-[#FF4D94]/20">
              <Tag className="w-4 h-4" />
              标签云
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
              文章标签
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
              通过标签快速找到相关主题的文章
            </p>
          </div>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          {tags && tags.length > 0 ? (
            <div className="bg-white rounded-3xl p-6 sm:p-12 md:p-16 border border-gray-100 shadow-lg">
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                {tags.map((tag, index) => {
                  const count = tag.post_tags?.length || 0
                  const size = count > 10 
                    ? 'text-lg sm:text-xl md:text-2xl px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4' 
                    : count > 5 
                    ? 'text-base sm:text-lg md:text-xl px-3 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3.5' 
                    : 'text-sm sm:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3'
                  
                  const gradients = [
                    'from-[#FF4D94] to-[#7C4DFF]',
                    'from-[#7C4DFF] to-[#9E7AFF]',
                    'from-[#FF4D94] to-[#FF6BA8]',
                    'from-[#7C4DFF] to-[#FF4D94]',
                  ]
                  const gradient = gradients[index % gradients.length]
                  
                  return (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="group"
                    >
                      <div className={`${size} bg-gradient-to-r ${gradient} text-white rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all font-black`}>
                        <span className="drop-shadow-sm">
                          #{tag.name}
                        </span>
                        <span className="text-xs sm:text-sm ml-1 sm:ml-2 opacity-90">
                          ({count})
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-[#FF4D94]/20">
              <div className="max-w-md mx-auto px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                  <Tag className="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4D94]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">暂无标签</h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium">还没有创建任何标签</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
