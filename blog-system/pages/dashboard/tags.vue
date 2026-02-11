<script setup lang="ts">
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X,
  Loader2,
  Tag as TagIcon,
  Hash,
  Sparkles
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { profile } = useAuth()
const { generateSlug, formatDate } = useUtils()

// 权限检查
onMounted(() => {
  if (profile.value && profile.value.role !== 'admin') {
    useRouter().push('/dashboard')
  }
})

const { data: tags, refresh } = await useAsyncData('dashboard-tags-list', async () => {
  const { data, error } = await client.from('tags').select('*').order('created_at', { ascending: false })
  if (error) return []
  return data || []
})

const searchQuery = ref('')
const filteredTags = computed(() => {
  if (!tags.value) return []
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Modal State
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const isSubmitting = ref(false)
const editedId = ref<string | null>(null)
const formData = ref({
  name: '',
  slug: ''
})

const openModal = (type: 'create' | 'edit', tag?: any) => {
  modalType.value = type
  if (type === 'edit' && tag) {
    editedId.value = tag.id
    formData.value = {
      name: tag.name,
      slug: tag.slug || ''
    }
  } else {
    editedId.value = null
    formData.value = { name: '', slug: '' }
  }
  isModalOpen.value = true
}

const handleNameChange = () => {
  if (modalType.value === 'create' || !formData.value.slug) {
    formData.value.slug = generateSlug(formData.value.name)
  }
}

const handleSubmit = async () => {
  if (!formData.value.name) return
  isSubmitting.value = true
  
  try {
    if (modalType.value === 'create') {
      const { error } = await client.from('tags').insert(formData.value)
      if (error) throw error
    } else {
      const { error } = await client.from('tags').update(formData.value).eq('id', editedId.value)
      if (error) throw error
    }
    isModalOpen.value = false
    refresh()
  } catch (err: any) {
    alert('保存失败: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (tag: any) => {
  if (!confirm(`确定要删除标签 "#${tag.name}" 吗？此操作不可撤销。`)) return
  const { error } = await client.from('tags').delete().eq('id', tag.id)
  if (error) alert('删除失败: ' + error.message)
  else refresh()
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent mb-2 tracking-tight">
          内容标签云
        </h1>
        <p class="text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">Organizing and discovery through semantic markers</p>
      </div>
      
      <button 
        @click="openModal('create')"
        class="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <Plus class="w-5 h-5 transition-transform group-hover:rotate-90" />
        定义新标签
      </button>
    </div>

    <!-- Toolbar Area -->
    <div class="bg-white rounded-[40px] border border-gray-100 p-6 sm:p-8 shadow-xl">
       <div class="max-w-md relative group">
          <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-pink transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索标签内容..." 
            class="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all shadow-sm focus:bg-white"
          />
       </div>
    </div>

    <!-- Tags Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       <div v-if="filteredTags.length === 0" class="col-span-full bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-4">
          <div class="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-200 mx-auto shadow-inner">
             <Hash class="w-10 h-10" />
          </div>
          <p class="text-sm font-black text-gray-400 uppercase tracking-widest">没有发现该路径下的标记</p>
       </div>

       <div 
         v-for="tag in filteredTags" 
         :key="tag.id"
         class="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
       >
          <div class="flex items-start justify-between mb-4">
             <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-pink/5 to-brand-purple/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hash class="w-6 h-6 text-brand-purple" />
             </div>
             
             <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  @click="openModal('edit', tag)"
                  class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                >
                   <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleDelete(tag)"
                  class="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                   <Trash2 class="w-3.5 h-3.5" />
                </button>
             </div>
          </div>

          <h3 class="text-lg font-black text-gray-900 mb-1 group-hover:text-brand-pink transition-colors"># {{ tag.name }}</h3>
          <p class="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest mb-4">/tag/{{ tag.slug }}</p>
          
          <div class="flex items-center justify-between pt-4 border-t border-gray-50">
             <span class="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{{ formatDate(tag.created_at) }}</span>
             <span class="flex items-center gap-1 text-[9px] font-black text-brand-purple uppercase tracking-[0.2em]">
                System Marker
                <Sparkles class="w-2.5 h-2.5" />
             </span>
          </div>
          
          <!-- Decorative Background Color -->
          <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
       </div>
    </div>

    <!-- Premium Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
         <div class="bg-white rounded-[40px] max-w-lg w-full flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            <!-- Modal Header -->
            <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative">
               <div class="flex items-center gap-4 relative z-10">
                  <div class="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                     <Hash class="w-6 h-6" />
                  </div>
                  <div>
                    <h2 class="text-2xl font-black text-gray-900">{{ modalType === 'create' ? '注册新标记' : '重新定义标记' }}</h2>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Semantic labeling for discovery</p>
                  </div>
               </div>
               <button @click="isModalOpen = false" class="text-gray-400 hover:text-brand-pink transition-colors relative z-10">
                  <X class="w-6 h-6" />
               </button>
            </div>

            <!-- Modal Body -->
            <div class="p-10 space-y-8">
               <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">标签名称</label>
                  <input 
                    v-model="formData.name" 
                    @input="handleNameChange"
                    type="text" 
                    class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all text-gray-900" 
                    placeholder="例如：科技, 旅行, 美食..." 
                  />
               </div>

               <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">路由 ID (SLUG)</label>
                  <div class="relative">
                     <span class="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">/tag/</span>
                     <input 
                       v-model="formData.slug" 
                       type="text" 
                       class="w-full pl-20 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-purple/5 transition-all text-brand-purple" 
                     />
                  </div>
               </div>
               
               <div class="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p class="text-[11px] font-bold text-gray-500 leading-relaxed italic">
                    小贴士：标签能够帮助用户通过共同的话题发现更多精彩内容。保持标签的简洁性和一致性。
                  </p>
               </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-8 border-t border-gray-100 flex items-center justify-between bg-white px-10">
               <button 
                 @click="isModalOpen = false"
                 class="px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all font-mono"
               >
                  CANCEL
               </button>
               <button 
                 @click="handleSubmit"
                 :disabled="isSubmitting || !formData.name"
                 class="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:bg-brand-pink hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
               >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                  <span v-else>UPDATE TAG</span>
               </button>
            </div>
         </div>
      </div>
    </Transition>
  </div>
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
