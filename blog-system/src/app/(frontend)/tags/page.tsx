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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-orange-600 mb-4">
              标签云
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">文章标签</h1>
            <p className="text-xl text-gray-600">
              通过标签快速找到相关主题的文章
            </p>
          </div>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          {tags && tags.length > 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100">
              <div className="flex flex-wrap gap-4 justify-center">
                {tags.map((tag) => {
                  const count = tag.post_tags?.length || 0
                  const size = count > 10 ? 'text-2xl' : count > 5 ? 'text-xl' : 'text-base'
                  
                  return (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="group"
                    >
                      <div className={`${size} px-6 py-3 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-full hover:shadow-lg hover:scale-110 transition-all`}>
                        <span className="font-medium text-orange-600 group-hover:text-orange-700">
                          #{tag.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({count})
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">暂无标签</h3>
                <p className="text-gray-600">还没有创建任何标签</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
