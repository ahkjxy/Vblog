import { createClient } from '@/lib/supabase/server'
import { Image, Upload, Trash2, Search } from 'lucide-react'

export default async function MediaPage() {
  const supabase = await createClient()
  
  // 这里可以添加媒体库的查询逻辑
  // const { data: media } = await supabase.storage.from('media').list()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">媒体库</h1>
        <p className="text-gray-600">管理你的图片和文件</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">上传文件</h2>
          <button className="px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-lg transition-all font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            上传图片
          </button>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#FF4D94] transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-[#FF4D94]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">拖拽文件到这里</h3>
          <p className="text-gray-600 text-sm">或点击选择文件上传</p>
          <p className="text-gray-500 text-xs mt-2">支持 JPG, PNG, GIF, WebP (最大 5MB)</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索媒体文件..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6">所有文件</h2>
        
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Image className="w-10 h-10 text-[#FF4D94]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">暂无媒体文件</h3>
          <p className="text-gray-600 mb-6">开始上传你的第一个文件</p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-full hover:shadow-lg transition-all font-medium inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            上传文件
          </button>
        </div>
      </div>
    </div>
  )
}
