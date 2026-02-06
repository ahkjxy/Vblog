'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, Check } from 'lucide-react'

interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

interface MediaFile {
  name: string
  url: string
  created_at: string
}

export function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadFiles()
    }
  }, [isOpen])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.storage
        .from('media')
        .list(user.id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      const filesWithUrls = data.map((file: { name: string; created_at?: string }) => {
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`${user.id}/${file.name}`)
        
        return {
          name: file.name,
          url: publicUrl,
          created_at: file.created_at || ''
        }
      })

      setFiles(filesWithUrls)
    } catch (error) {
      console.error('加载文件失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      await loadFiles()
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            媒体库
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload */}
        <div className="p-6 border-b">
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>{uploading ? '上传中...' : '上传图片'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Upload className="w-16 h-16 mb-4 text-gray-300" />
              <p>还没有上传任何图片</p>
              <p className="text-sm">点击上方按钮上传图片</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.url}
                  onClick={() => setSelectedUrl(file.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedUrl === file.url
                      ? 'border-purple-600 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedUrl === file.url && (
                    <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedUrl ? '已选择 1 张图片' : '请选择一张图片'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedUrl}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              插入图片
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
