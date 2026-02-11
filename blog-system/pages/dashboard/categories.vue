<script setup lang="ts">
import { 
  FolderOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X,
  Loader2,
  ChevronRight,
  Info
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { profile } = useAuth()
const { generateSlug } = useUtils()

// 权限检查
onMounted(() => {
  if (profile.value && profile.value.role !== 'admin') {
    useRouter().push('/dashboard')
  }
})

const { data: categories, refresh } = await useAsyncData('dashboard-categories-list', async () => {
  const { data, error } = await client.from('categories').select('*').order('name')
  if (error) return []
  return data || []
})

const searchQuery = ref('')
const filteredCategories = computed(() => {
  if (!categories.value) return []
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Modal State
const isModalOpen = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const isSubmitting = ref(false)
const editedId = ref<string | null>(null)
const formData = ref({
  name: '',
  slug: '',
  description: ''
})

const openModal = (type: 'create' | 'edit', cat?: any) => {
  modalType.value = type
  if (type === 'edit' && cat) {
    editedId.value = cat.id
    formData.value = {
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || ''
    }
  } else {
    editedId.value = null
    formData.value = { name: '', slug: '', description: '' }
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
      const { error } = await client.from('categories').insert(formData.value)
      if (error) throw error
    } else {
      const { error } = await client.from('categories').update(formData.value).eq('id', editedId.value)
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

const handleDelete = async (cat: any) => {
  if (!confirm(`确定要删除分类 "${cat.name}" 吗？此操作不可撤销。`)) return
  const { error } = await client.from('categories').delete().eq('id', cat.id)
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
          分类架构管理
        </h1>
        <p class="text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">Managing the core structure of your content</p>
      </div>
      
      <button 
        @click="openModal('create')"
        class="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <Plus class="w-5 h-5 transition-transform group-hover:rotate-90" />
        创建新分类
      </button>
    </div>

    <!-- Main List Container -->
    <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
       <!-- Search Area -->
       <div class="p-8 border-b border-gray-50 bg-gray-50/20">
          <div class="max-w-md relative group">
             <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-brand-pink transition-colors" />
             <input 
               v-model="searchQuery"
               type="text" 
               placeholder="搜索分类名称或路径..." 
               class="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all shadow-sm"
             />
          </div>
       </div>

       <!-- Table -->
       <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
             <thead>
                <tr class="bg-gray-50/50">
                   <th class="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">分类标识</th>
                   <th class="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">URL 别名</th>
                   <th class="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">描述</th>
                   <th class="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">管理操作</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-50">
                <tr v-if="filteredCategories.length === 0" class="hover:bg-gray-50/30 transition-colors">
                   <td colspan="4" class="px-10 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      没有找到匹配的分类架构
                   </td>
                </tr>
                <tr 
                  v-for="cat in filteredCategories" 
                  :key="cat.id"
                  class="hover:bg-gray-50/50 transition-all group"
                >
                   <td class="px-10 py-6">
                      <div class="flex items-center gap-4">
                         <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink/5 to-brand-purple/5 flex items-center justify-center text-brand-pink group-hover:scale-110 transition-transform">
                            <FolderOpen class="w-5 h-5" />
                         </div>
                         <span class="font-black text-gray-900">{{ cat.name }}</span>
                      </div>
                   </td>
                   <td class="px-10 py-6">
                      <span class="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono font-bold text-gray-500">/category/{{ cat.slug }}</span>
                   </td>
                   <td class="px-10 py-6 hidden md:table-cell">
                      <p class="text-sm text-gray-500 font-medium max-w-xs truncate">{{ cat.description || '暂无描述' }}</p>
                   </td>
                   <td class="px-10 py-6 text-right">
                      <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           @click="openModal('edit', cat)"
                           class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                           title="编辑"
                         >
                            <Edit2 class="w-4 h-4" />
                         </button>
                         <button 
                           @click="handleDelete(cat)"
                           class="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                           title="删除"
                         >
                            <Trash2 class="w-4 h-4" />
                         </button>
                      </div>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>

    <!-- Premium Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
         <div class="bg-white rounded-[40px] max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            <!-- Modal Header -->
            <div class="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex items-center justify-between">
               <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-brand-pink to-brand-purple rounded-2xl flex items-center justify-center text-white shadow-lg">
                     <FolderOpen class="w-6 h-6" />
                  </div>
                  <div>
                    <h2 class="text-2xl font-black text-gray-900">{{ modalType === 'create' ? '新建分类节点' : '编辑架构属性' }}</h2>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Define your content taxonomy</p>
                  </div>
               </div>
               <button @click="isModalOpen = false" class="text-gray-400 hover:text-brand-pink transition-colors">
                  <X class="w-6 h-6" />
               </button>
            </div>

            <!-- Modal Body -->
            <div class="p-10 space-y-8">
               <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-1 h-1 rounded-full bg-brand-pink"></div> 分类名称
                  </label>
                  <input 
                    v-model="formData.name" 
                    @input="handleNameChange"
                    type="text" 
                    class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all" 
                    placeholder="例如：技术分享, 生活点滴..." 
                  />
               </div>

               <div class="space-y-3">
                  <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div class="w-1 h-1 rounded-full bg-brand-purple"></div> 路由别名 (SLUG)
                  </label>
                  <div class="relative">
                     <span class="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">/category/</span>
                     <input 
                       v-model="formData.slug" 
                       type="text" 
                       class="w-full pl-24 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-purple/5 transition-all text-brand-purple" 
                       placeholder="url-alias" 
                     />
                  </div>
               </div>

               <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <div class="w-1 h-1 rounded-full bg-gray-300"></div> 分类描述 (可选)
                    </label>
                  </div>
                  <textarea 
                    v-model="formData.description" 
                    rows="4" 
                    class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-gray-100 transition-all resize-none" 
                    placeholder="描述该分类的主要内容范畴..." 
                  ></textarea>
               </div>
               
               <div class="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <Info class="w-5 h-5 text-blue-500 shrink-0" />
                  <p class="text-[11px] font-bold text-blue-800 leading-relaxed">
                    精心设计的分类结构有助于 SEO 和用户导航。建议别名使用小写且语义化的英文单词或拼音。
                  </p>
               </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-8 border-t border-gray-100 flex items-center justify-between bg-white">
               <button 
                 @click="isModalOpen = false"
                 class="px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
               >
                  放弃修改
               </button>
               <button 
                 @click="handleSubmit"
                 :disabled="isSubmitting || !formData.name"
                 class="px-12 py-4 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
               >
                  <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                  <span v-else>确认保存节点</span>
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
