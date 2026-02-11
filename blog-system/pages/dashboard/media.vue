<script setup lang="ts">
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Eye, 
  FileImage, 
  Check, 
  X,
  Loader2,
  Calendar,
  Grid,
  List as ListIcon,
  Download
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { user } = useAuth()
const { formatDate } = useUtils()

const files = ref<any[]>([])
const loading = ref(false)
const uploading = ref(false)
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedFiles = ref(new Set<string>())
const previewFile = ref<any>(null)
const isPreviewOpen = ref(false)

const loadFiles = async () => {
  if (!user.value) return
  loading.value = true
  try {
    const { data, error } = await client.storage
      .from('media')
      .list(user.value.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) throw error

    files.value = data.map(file => {
      const { data: { publicUrl } } = client.storage
        .from('media')
        .getPublicUrl(`${user.value?.id}/${file.name}`)
      
      return {
        ...file,
        url: publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'image/unknown'
      }
    })
  } catch (error) {
    console.error('加载文件失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFiles()
})

const handleUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !user.value) return

  uploading.value = true
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.value.id}/${fileName}`

    const { error: uploadError } = await client.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) throw uploadError
    await loadFiles()
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

const handleCopyUrl = (url: string) => {
  navigator.clipboard.writeText(url)
  alert('URL 已复制到剪贴板')
}

const handleDelete = async (fileName: string) => {
  if (!user.value || !confirm('确定要删除此文件吗？')) return
  try {
    const { error } = await client.storage
      .from('media')
      .remove([`${user.value.id}/${fileName}`])
    if (error) throw error
    await loadFiles()
  } catch (error) {
    alert('删除失败')
  }
}

const handleBulkDelete = async () => {
  if (!user.value || !confirm(`确定要批量删除 ${selectedFiles.value.size} 个文件吗？`)) return
  try {
    const paths = Array.from(selectedFiles.value).map(name => `${user.value?.id}/${name}`)
    const { error } = await client.storage.from('media').remove(paths)
    if (error) throw error
    selectedFiles.value.clear()
    await loadFiles()
  } catch (error) {
    alert('批量删除失败')
  }
}

const filteredFiles = computed(() => {
  return files.value.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent mb-2 tracking-tight">
          媒体资产库
        </h1>
        <p class="text-gray-500 font-medium">存取和管理您的创作素材</p>
      </div>
      
      <label class="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
        <Upload v-if="!uploading" class="w-5 h-5 transition-transform group-hover:-translate-y-1" />
        <Loader2 v-else class="w-5 h-5 animate-spin" />
        {{ uploading ? '正在同步...' : '上传新资产' }}
        <input type="file" @change="handleUpload" class="hidden" accept="image/*" :disabled="uploading" />
      </label>
    </div>

    <!-- Toolbar Area -->
    <div class="bg-white rounded-[40px] border border-gray-100 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
       <div class="w-full md:max-w-md relative group">
          <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-pink transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索素材名称..." 
            class="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all focus:bg-white"
          />
       </div>

       <div class="flex items-center gap-4">
          <div class="bg-gray-50 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-100">
             <button @click="viewMode = 'grid'" :class="['p-2.5 rounded-xl transition-all', viewMode === 'grid' ? 'bg-white text-brand-pink shadow-sm' : 'text-gray-400 hover:text-gray-600']">
                <Grid class="w-5 h-5" />
             </button>
             <button @click="viewMode = 'list'" :class="['p-2.5 rounded-xl transition-all', viewMode === 'list' ? 'bg-white text-brand-pink shadow-sm' : 'text-gray-400 hover:text-gray-600']">
                <ListIcon class="w-5 h-5" />
             </button>
          </div>

          <Transition name="fade">
             <button 
               v-if="selectedFiles.size > 0" 
               @click="handleBulkDelete"
               class="px-6 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
             >
                删除所选 ({{ selectedFiles.size }})
             </button>
          </Transition>
       </div>
    </div>

    <!-- Media Grid -->
    <div v-if="loading" class="flex flex-col items-center justify-center p-20 gap-4">
       <div class="w-12 h-12 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin"></div>
       <p class="text-xs font-black text-gray-400 uppercase tracking-widest">正在连接资产库...</p>
    </div>

    <div v-else-if="filteredFiles.length === 0" class="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-6 shadow-xl">
       <div class="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mx-auto">
          <FileImage class="w-12 h-12" />
       </div>
       <div class="max-w-xs mx-auto">
          <p class="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">未发现相关资产</p>
          <p class="text-xs text-gray-400 font-medium">您可以尝试调整搜索关键词或上传新素材</p>
       </div>
    </div>

    <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8' : 'space-y-4'">
       <div 
         v-for="file in filteredFiles" 
         :key="file.name"
         :class="viewMode === 'grid' 
           ? 'group bg-white rounded-[32px] border border-gray-100 p-3 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden' 
           : 'group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-xl transition-all flex items-center gap-6 relative overflow-hidden'"
       >
          <!-- Selector Overlay -->
          <div class="absolute top-4 left-4 z-20">
             <button 
                @click="selectedFiles.has(file.name) ? selectedFiles.delete(file.name) : selectedFiles.add(file.name)"
                :class="['w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all', selectedFiles.has(file.name) ? 'bg-brand-pink border-brand-pink text-white rotate-0' : 'bg-white/50 border-white/80 opacity-0 group-hover:opacity-100']"
             >
                <Check v-if="selectedFiles.has(file.name)" class="w-4 h-4" />
             </button>
          </div>

          <!-- Media Display -->
          <div 
             :class="viewMode === 'grid' ? 'aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 cursor-pointer relative' : 'w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer relative'"
             @click="previewFile = file; isPreviewOpen = true"
          >
             <img :src="file.url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
             <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button @click.stop="handleCopyUrl(file.url)" class="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-gray-900 transition-all"><Copy class="w-4 h-4" /></button>
                <button @click.stop="handleDelete(file.name)" class="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-all"><Trash2 class="w-4 h-4" /></button>
             </div>
          </div>

          <!-- Info Area -->
          <div :class="viewMode === 'grid' ? 'px-2 pb-2' : 'flex-1 min-w-0'">
             <h4 class="text-sm font-black text-gray-900 truncate mb-1" :title="file.name">{{ file.name }}</h4>
             <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ formatSize(file.size) }}</span>
                <span class="text-[9px] font-bold text-gray-300 hidden sm:block">{{ formatDate(file.created_at) }}</span>
             </div>
          </div>
       </div>
    </div>

    <!-- Preview Modal -->
    <Transition name="fade">
       <div v-if="isPreviewOpen && previewFile" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 bg-gray-900/80 backdrop-blur-lg" @click="isPreviewOpen = false">
          <div class="bg-white rounded-[40px] max-w-4xl w-full max-h-full flex flex-col shadow-2xl relative" @click.stop>
             <button @click="isPreviewOpen = false" class="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-xl hover:text-brand-pink transition-all z-20">
                <X class="w-6 h-6" />
             </button>
             
             <div class="p-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div class="rounded-3xl border border-gray-100 overflow-hidden bg-gray-50 mb-8 flex items-center justify-center max-h-[60vh]">
                   <img :src="previewFile.url" class="max-w-full max-h-full object-contain" />
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
                   <div class="sm:col-span-2 space-y-6">
                      <div>
                         <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">资源名称</label>
                         <p class="text-xl font-black text-gray-900 break-all">{{ previewFile.name }}</p>
                      </div>
                      <div class="flex flex-wrap gap-8">
                         <div>
                            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">文件类型</label>
                            <p class="text-sm font-bold text-gray-700">{{ previewFile.type }}</p>
                         </div>
                         <div>
                            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">创建日期</label>
                            <div class="flex items-center gap-2 text-sm font-bold text-gray-700">
                               <Calendar class="w-4 h-4 text-brand-pink" />
                               {{ formatDate(previewFile.created_at) }}
                            </div>
                         </div>
                         <div>
                            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">存储大小</label>
                            <p class="text-sm font-bold text-gray-700">{{ formatSize(previewFile.size) }}</p>
                         </div>
                      </div>
                   </div>
                   
                   <div class="space-y-4">
                      <button @click="handleCopyUrl(previewFile.url)" class="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                         <Copy class="w-4 h-4" /> 复制资源链接
                      </button>
                      <a :href="previewFile.url" download :class="`w-full flex items-center justify-center gap-3 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all`">
                         <Download class="w-4 h-4" /> 下载本地副本
                      </a>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
