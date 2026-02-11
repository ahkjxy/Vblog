<script setup lang="ts">
import { Upload, Search, Copy, Trash2, Eye, FileImage } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

interface MediaFile {
  name: string
  id: string
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
}

const files = ref<MediaFile[]>([])
const filteredFiles = ref<MediaFile[]>([])
const loading = ref(true)
const uploading = ref(false)
const uploadProgress = ref(0)
const searchQuery = ref('')
const selectedFiles = ref<Set<string>>(new Set())
const previewFile = ref<MediaFile | null>(null)
const isPreviewOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const fileToDelete = ref<MediaFile | null>(null)
const isDragging = ref(false)
const sortBy = ref<'newest' | 'oldest' | 'name'>('newest')
const userId = ref('')

const fileInputRef = ref<HTMLInputElement | null>(null)

// 获取用户 ID
onMounted(async () => {
  if (user.value) {
    userId.value = user.value.id
    await loadFiles()
  }
})

// 加载媒体文件
const loadFiles = async () => {
  try {
    if (!user.value) return

    const { data, error } = await client.storage
      .from('media')
      .list(user.value.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) throw error
    files.value = data || []
  } catch (err) {
    console.error('加载媒体文件失败:', err)
  } finally {
    loading.value = false
  }
}

// 搜索和排序
watch([files, searchQuery, sortBy], () => {
  const result = files.value.filter(file =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy.value === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  filteredFiles.value = result
})

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
  if (!user.value) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    const file = filesToUpload[0]
    
    // 验证文件
    const error = validateFile(file)
    if (error) {
      console.error(error)
      uploading.value = false
      return
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.value.id}/${fileName}`

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      uploadProgress.value = Math.min(uploadProgress.value + 10, 90)
    }, 100)

    const { error: uploadError } = await client.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (uploadError) throw uploadError

    await loadFiles()
  } catch (err) {
    console.error('上传失败:', err)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// 获取文件 URL
const getFileUrl = (file: MediaFile, uid: string) => {
  const { data } = client.storage
    .from('media')
    .getPublicUrl(`${uid}/${file.name}`)
  return data.publicUrl
}

// 复制 URL
const handleCopyUrl = async (file: MediaFile) => {
  if (!user.value) return
  
  const url = getFileUrl(file, user.value.id)
  try {
    await navigator.clipboard.writeText(url)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 删除文件
const handleDelete = async () => {
  if (!fileToDelete.value || !userId.value) return

  try {
    const { error } = await client.storage
      .from('media')
      .remove([`${userId.value}/${fileToDelete.value.name}`])

    if (error) throw error
    isDeleteDialogOpen.value = false
    await loadFiles()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

// 批量删除
const handleBulkDelete = async () => {
  if (selectedFiles.value.size === 0 || !userId.value) return

  try {
    const filesToDelete = Array.from(selectedFiles.value).map(name => `${userId.value}/${name}`)
    const { error } = await client.storage
      .from('media')
      .remove(filesToDelete)

    if (error) throw error
    selectedFiles.value = new Set()
    await loadFiles()
  } catch (err) {
    console.error('批量删除失败:', err)
  }
}

// 拖拽处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  handleUpload(droppedFiles || null)
}

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
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        媒体库
      </h1>
      <p class="text-gray-600">管理你的图片和文件</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Upload Section -->
      <div class="bg-white rounded-2xl p-8 border border-gray-100 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">上传文件</h2>
          <button
            @click="fileInputRef?.click()"
            :disabled="uploading"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2',
              'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
              'hover:from-purple-700 hover:to-pink-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            ]"
          >
            <Upload class="w-4 h-4" />
            {{ uploading ? '上传中...' : '选择文件' }}
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            @change="(e) => handleUpload((e.target as HTMLInputElement).files)"
            class="hidden"
          />
        </div>

        <div
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="!uploading && fileInputRef?.click()"
          :class="[
            'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400',
            uploading && 'pointer-events-none opacity-50'
          ]"
        >
          <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileImage class="w-8 h-8 text-purple-600" />
          </div>
          <template v-if="uploading">
            <h3 class="text-lg font-semibold mb-2">上传中...</h3>
            <div class="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mb-2">
              <div
                class="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                :style="{ width: `${uploadProgress}%` }"
              />
            </div>
            <p class="text-sm text-gray-600">{{ uploadProgress }}%</p>
          </template>
          <template v-else>
            <h3 class="text-lg font-semibold mb-2">拖拽文件到这里</h3>
            <p class="text-gray-600 text-sm">或点击选择文件上传</p>
            <p class="text-gray-500 text-xs mt-2">支持 JPG, PNG, GIF, WebP (最大 5MB)</p>
          </template>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索媒体文件..."
              class="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            v-model="sortBy"
            class="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">最新</option>
            <option value="oldest">最旧</option>
            <option value="name">名称</option>
          </select>
        </div>

        <div v-if="selectedFiles.size > 0" class="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <span class="text-sm text-gray-700">
            已选择 {{ selectedFiles.size }} 个文件
          </span>
          <button
            @click="handleBulkDelete"
            class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            批量删除
          </button>
        </div>
      </div>

      <!-- Media Grid -->
      <div v-if="filteredFiles.length === 0" class="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <ImageIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ searchQuery ? '未找到匹配的文件' : '暂无媒体文件' }}
        </h3>
        <p class="text-gray-600">
          {{ searchQuery ? '尝试使用其他关键词搜索' : '开始上传你的第一个文件' }}
        </p>
        <button
          v-if="!searchQuery"
          @click="fileInputRef?.click()"
          class="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          上传文件
        </button>
      </div>

      <div v-else class="bg-white rounded-2xl p-8 border border-gray-100">
        <h2 class="text-xl font-semibold mb-6">
          所有文件 ({{ filteredFiles.length }})
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-400 transition-all"
          >
            <!-- Checkbox -->
            <div class="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                :checked="selectedFiles.has(file.name)"
                @change="(e) => {
                  const newSelected = new Set(selectedFiles)
                  if ((e.target as HTMLInputElement).checked) {
                    newSelected.add(file.name)
                  } else {
                    newSelected.delete(file.name)
                  }
                  selectedFiles = newSelected
                }"
                class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                @click.stop
              />
            </div>

            <!-- Image -->
            <div
              class="aspect-square bg-gray-100 cursor-pointer"
              @click="() => {
                previewFile = file
                isPreviewOpen = true
              }"
            >
              <img
                :src="userId ? getFileUrl(file, userId) : ''"
                :alt="file.name"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="p-3">
              <p class="text-sm font-medium truncate mb-1">{{ file.name }}</p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize((file.metadata?.size as number) || 0) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                @click="() => {
                  previewFile = file
                  isPreviewOpen = true
                }"
                class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="预览"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button
                @click="handleCopyUrl(file)"
                class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="复制 URL"
              >
                <Copy class="w-4 h-4" />
              </button>
              <button
                @click="() => {
                  fileToDelete = file
                  isDeleteDialogOpen = true
                }"
                class="p-2 bg-white rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="删除"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Preview Modal -->
    <div
      v-if="isPreviewOpen && previewFile && userId"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="isPreviewOpen = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">图片预览</h3>
        <img
          :src="getFileUrl(previewFile, userId)"
          :alt="previewFile.name"
          class="w-full rounded-lg mb-4"
        />
        <div class="space-y-2">
          <p class="text-sm"><strong>文件名:</strong> {{ previewFile.name }}</p>
          <p class="text-sm"><strong>大小:</strong> {{ formatFileSize((previewFile.metadata?.size as number) || 0) }}</p>
          <p class="text-sm"><strong>类型:</strong> {{ (previewFile.metadata?.mimetype as string) || '未知' }}</p>
          <p class="text-sm"><strong>上传时间:</strong> {{ formatDate(previewFile.created_at) }}</p>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="isPreviewOpen = false"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
          <button
            @click="handleCopyUrl(previewFile)"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            复制 URL
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="isDeleteDialogOpen && fileToDelete"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="isDeleteDialogOpen = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">删除文件</h3>
        <p class="text-gray-600 mb-6">
          确定要删除文件"{{ fileToDelete.name }}"吗？此操作无法撤销。
        </p>
        <div class="flex gap-3">
          <button
            @click="isDeleteDialogOpen = false"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
