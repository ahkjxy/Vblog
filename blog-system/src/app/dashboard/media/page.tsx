'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Image as ImageIcon, Upload, Search, Copy, Trash2, Eye } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface MediaFile {
  name: string
  id: string
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<MediaFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [userId, setUserId] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { success, error: showError } = useToast()

  // 获取用户 ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUserId()
  }, [])

  // 加载媒体文件
  const loadFiles = async () => {
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
      setFiles(data || [])
    } catch (err) {
      showError('加载媒体文件失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  // 搜索和排序
  useEffect(() => {
    const result = files.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // 排序
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        return a.name.localeCompare(b.name)
      }
    })

    setFilteredFiles(result)
  }, [files, searchQuery, sortBy])

  // 验证文件
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return '不支持的文件类型。请上传 JPEG、PNG、GIF 或 WebP 格式的图片。'
    }

    if (file.size > maxSize) {
      return '文件大小超过 5MB 限制。'
    }

    return null
  }

  // 上传文件
  const handleUpload = async (filesToUpload: FileList | null) => {
    if (!filesToUpload || filesToUpload.length === 0) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      showError('请先登录')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const file = filesToUpload[0]
      
      // 验证文件
      const error = validateFile(file)
      if (error) {
        showError(error)
        setUploading(false)
        return
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadError) throw uploadError

      success('文件上传成功')
      loadFiles()
    } catch (err) {
      const error = err as { message?: string }
      showError(error.message || '上传失败')
      console.error(err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 获取文件 URL
  const getFileUrl = (file: MediaFile, userId: string) => {
    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(`${userId}/${file.name}`)
    return data.publicUrl
  }

  // 复制 URL
  const handleCopyUrl = async (file: MediaFile) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const url = getFileUrl(file, user.id)
    try {
      await navigator.clipboard.writeText(url)
      success('URL 已复制到剪贴板')
    } catch (err) {
      showError('复制失败')
    }
  }

  // 删除文件
  const handleDelete = async () => {
    if (!fileToDelete || !userId) return

    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([`${userId}/${fileToDelete.name}`])

      if (error) throw error

      success('文件已删除')
      setIsDeleteDialogOpen(false)
      loadFiles()
    } catch (err) {
      showError('删除失败')
      console.error(err)
    }
  }

  // 批量删除
  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0 || !userId) return

    try {
      const filesToDelete = Array.from(selectedFiles).map(name => `${userId}/${name}`)
      const { error } = await supabase.storage
        .from('media')
        .remove(filesToDelete)

      if (error) throw error

      success(`已删除 ${selectedFiles.size} 个文件`)
      setSelectedFiles(new Set())
      loadFiles()
    } catch (err) {
      showError('批量删除失败')
      console.error(err)
    }
  }

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleUpload(files)
  }, [handleUpload])

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          媒体库
        </h1>
        <p className="text-gray-600">管理你的图片和文件</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">上传文件</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2',
              'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
              'hover:from-purple-700 hover:to-pink-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Upload className="w-4 h-4" />
            {uploading ? '上传中...' : '选择文件'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400',
            uploading && 'pointer-events-none opacity-50'
          )}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-purple-600" />
          </div>
          {uploading ? (
            <>
              <h3 className="text-lg font-semibold mb-2">上传中...</h3>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">拖拽文件到这里</h3>
              <p className="text-gray-600 text-sm">或点击选择文件上传</p>
              <p className="text-gray-500 text-xs mt-2">支持 JPG, PNG, GIF, WebP (最大 5MB)</p>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索媒体文件..."
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">最新</option>
            <option value="oldest">最旧</option>
            <option value="name">名称</option>
          </select>
        </div>

        {selectedFiles.size > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm text-gray-700">
              已选择 {selectedFiles.size} 个文件
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={searchQuery ? '未找到匹配的文件' : '暂无媒体文件'}
          description={searchQuery ? '尝试使用其他关键词搜索' : '开始上传你的第一个文件'}
          action={!searchQuery ? {
            label: '上传文件',
            onClick: () => fileInputRef.current?.click()
          } : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">
            所有文件 ({filteredFiles.length})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const url = userId ? getFileUrl(file, userId) : ''
              return (
                <div
                  key={file.id}
                  className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-all"
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.name)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedFiles)
                        if (e.target.checked) {
                          newSelected.add(file.name)
                        } else {
                          newSelected.delete(file.name)
                        }
                        setSelectedFiles(newSelected)
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Image */}
                  <div
                    className="aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setPreviewFile(file)
                      setIsPreviewOpen(true)
                    }}
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate mb-1">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize((file.metadata?.size as number) || 0)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setPreviewFile(file)
                        setIsPreviewOpen(true)
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(file)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="复制 URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setFileToDelete(file)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="p-2 bg-white rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && userId && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="图片预览"
          size="lg"
        >
          <ModalBody>
            <img
              src={getFileUrl(previewFile, userId)}
              alt={previewFile.name}
              className="w-full rounded-lg"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm"><strong>文件名:</strong> {previewFile.name}</p>
              <p className="text-sm"><strong>大小:</strong> {formatFileSize((previewFile.metadata?.size as number) || 0)}</p>
              <p className="text-sm"><strong>类型:</strong> {(previewFile.metadata?.mimetype as string) || '未知'}</p>
              <p className="text-sm"><strong>上传时间:</strong> {formatDate(previewFile.created_at)}</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => handleCopyUrl(previewFile)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              复制 URL
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="删除文件"
        message={`确定要删除文件"${fileToDelete?.name}"吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
