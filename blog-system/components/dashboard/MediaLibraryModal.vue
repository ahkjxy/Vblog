<script setup lang="ts">
import { X, Upload, Check, ImageIcon } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', url: string): void
}>()

interface MediaFile {
  name: string
  url: string
  created_at: string
}

const client = useSupabaseClient()
const { user } = useAuth()

const files = ref<MediaFile[]>([])
const loading = ref(false)
const uploading = ref(false)
const selectedUrl = ref<string | null>(null)

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

    const filesWithUrls = data.map((file: any) => {
      const { data: { publicUrl } } = client.storage
        .from('media')
        .getPublicUrl(`${user.value?.id}/${file.name}`)
      
      return {
        name: file.name,
        url: publicUrl,
        created_at: file.created_at || ''
      }
    })

    files.value = filesWithUrls
  } catch (error) {
    console.error('加载文件失败:', error)
  } finally {
    loading.value = false
  }
}

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

const handleSelect = () => {
  if (selectedUrl.value) {
    emit('select', selectedUrl.value)
    emit('close')
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    loadFiles()
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
      <div class="bg-white rounded-[40px] max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
        <!-- Header -->
        <div class="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-2xl flex items-center justify-center text-white shadow-lg">
               <ImageIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-2xl font-black text-gray-900">媒体库</h2>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select or upload images</p>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="w-12 h-12 rounded-2xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all active:scale-95"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Upload Header -->
        <div class="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
          <p class="text-sm font-bold text-gray-500">点击图片进行选择，或上传新素材</p>
          <label class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <Upload class="w-5 h-5" />
            <span>{{ uploading ? '上传中...' : '上传新素材' }}</span>
            <input
              type="file"
              accept="image/*"
              @change="handleUpload"
              :disabled="uploading"
              class="hidden"
            />
          </label>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <div v-if="loading" class="flex flex-col items-center justify-center h-64">
            <div class="w-12 h-12 border-4 border-[#FF4D94]/20 border-t-[#FF4D94] rounded-full animate-spin mb-4"></div>
            <p class="text-sm font-black text-gray-400 uppercase tracking-widest">正在加载库...</p>
          </div>
          
          <div v-else-if="files.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
            <div class="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
               <Upload class="w-10 h-10 text-gray-100" />
            </div>
            <h3 class="text-xl font-black text-gray-900 mb-2">库中暂无素材</h3>
            <p class="text-sm font-medium">点击上方按钮上传您的第一张创作素材</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div
              v-for="file in files"
              :key="file.url"
              @click="selectedUrl = file.url"
              :class="`group relative aspect-square rounded-[28px] overflow-hidden cursor-pointer border-4 transition-all ${
                selectedUrl === file.url
                  ? 'border-[#FF4D94] ring-8 ring-[#FF4D94]/10 scale-[0.98]'
                  : 'border-white shadow-md hover:border-[#FF4D94]/30 hover:shadow-xl hover:-translate-y-1'
              }`"
            >
              <img
                :src="file.url"
                :alt="file.name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div v-if="selectedUrl === file.url" class="absolute inset-0 bg-gradient-to-br from-[#FF4D94]/20 to-[#7C4DFF]/20 flex items-center justify-center backdrop-blur-[2px]">
                 <div class="w-10 h-10 bg-white text-[#FF4D94] rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
                    <Check class="w-6 h-6" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-gray-100 flex items-center justify-between bg-white">
          <div class="flex items-center gap-3">
             <div v-if="selectedUrl" class="w-10 h-10 rounded-xl border-2 border-brand-pink p-0.5 animate-scale-in">
                <img :src="selectedUrl" class="w-full h-full object-cover rounded-lg" />
             </div>
             <p class="text-sm font-black text-gray-900">
               {{ selectedUrl ? '已选定 1 个素材' : '请先在库中选定素材' }}
             </p>
          </div>
          <div class="flex gap-4">
            <button
              @click="emit('close')"
              class="px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all active:scale-95"
            >
              取消
            </button>
            <button
              @click="handleSelect"
              :disabled="!selectedUrl"
              class="px-10 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
            >
              插入到文章
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
