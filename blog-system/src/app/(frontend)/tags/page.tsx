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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <Tag className="w-4 h-4" />
              标签云
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              文章标签
            </h1>
            <p className="text-xl text-gray-600">
              通过标签快速找到相关主题的文章
            </p>
          </div>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {tags && tags.length > 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-lg">
              <div className="flex flex-wrap gap-4 justify-center">
                {tags.map((tag, index) => {
                  const count = tag.post_tags?.length || 0
                  const size = count > 10 ? 'text-2xl px-8 py-4' : count > 5 ? 'text-xl px-7 py-3.5' : 'text-base px-6 py-3'
                  
                  const gradients = [
                    'from-purple-500 to-pink-500',
                    'from-pink-500 to-rose-500',
                    'from-purple-600 to-indigo-500',
                    'from-fuchsia-500 to-pink-500',
                  ]
                  const gradient = gradients[index % gradients.length]
                  
                  return (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="group"
                    >
                      <div className={`${size} bg-gradient-to-r ${gradient} text-white rounded-full hover:shadow-2xl hover:scale-110 transition-all font-semibold`}>
                        <span className="drop-shadow-sm">
                          #{tag.name}
                        </span>
                        <span className="text-sm ml-2 opacity-90">
                          ({count})
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-purple-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Tag className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">暂无标签</h3>
                <p className="text-gray-600 text-lg">还没有创建任何标签</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
