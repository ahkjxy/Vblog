import { createClient } from '@/lib/supabase/server'

export default async function TagsPage() {
  const supabase = await createClient()

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">标签管理</h1>
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          新建标签
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">名称</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Slug</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tags?.map((tag) => (
              <tr key={tag.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{tag.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{tag.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(tag.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    编辑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!tags || tags.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            暂无标签
          </div>
        )}
      </div>
    </div>
  )
}
