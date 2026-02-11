<script setup lang="ts">
import { 
  Save, 
  Send, 
  Settings2, 
  ChevronLeft,
  Loader2,
  Sparkles,
  Tag as TagIcon,
  FolderOpen,
  Image as ImageIcon
} from 'lucide-vue-next'
import MarkdownEditor from './MarkdownEditor.vue'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
  categories: { id: string, name: string }[]
  tags: { id: string, name: string }[]
}>()

const emit = defineEmits(['save'])

const router = useRouter()
const { generateSlug } = useUtils()

const title = ref(props.initialData?.title || '')
const content = ref(props.initialData?.content || '')
const excerpt = ref(props.initialData?.excerpt || '')
const slug = ref(props.initialData?.slug || '')
const selectedCategories = ref<string[]>(props.initialData?.categories?.map((c: any) => c.id) || [])
const selectedTags = ref<string[]>(props.initialData?.tags?.map((t: any) => t.id) || [])
const status = ref(props.initialData?.status || 'draft')
const isLoading = ref(false)
const showSettings = ref(false)

// 自动生成摘要
const handleGenerateExcerpt = () => {
  if (!content.value) return
  let text = content.value
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (text.length > 150) {
    text = text.substring(0, 150).trim() + '...'
  }
  excerpt.value = text
}

const handleSave = async (isPublishing = false) => {
  if (!title.value) {
    alert('请输入文章标题')
    return
  }
  
  isLoading.value = true
  
  // 如果没有摘要，自动生成一个
  if (!excerpt.value.trim() && content.value) {
    handleGenerateExcerpt()
  }

  const payload = {
    post: {
      title: title.value,
      content: content.value,
      excerpt: excerpt.value,
      slug: slug.value || generateSlug(title.value),
      status: isPublishing ? 'published' : status.value,
    },
    categories: selectedCategories.value,
    tags: selectedTags.value
  }
  
  emit('save', payload)
  isLoading.value = false
}

// 自动生成 Slug
watch(title, (newTitle) => {
  if (!props.isEditing && !slug.value) {
    slug.value = generateSlug(newTitle)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[40px] border border-gray-100 shadow-xl">
       <div class="flex items-center gap-6">
          <button @click="router.back()" class="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:text-brand-pink hover:bg-brand-pink/5 transition-all active:scale-95">
             <ChevronLeft class="w-6 h-6" />
          </button>
          <div>
            <h1 class="text-2xl font-black text-gray-900 leading-tight">
              {{ isEditing ? '编辑创作' : '开启新创作' }}
            </h1>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              {{ isEditing ? 'Refining your masterpiece' : 'Drafting a new inspiration' }}
            </p>
          </div>
       </div>

       <div class="flex items-center gap-3">
          <button 
            @click="showSettings = !showSettings" 
            :class="['px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all', showSettings ? 'bg-brand-purple text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100']"
          >
             <Settings2 class="w-4 h-4" /> 属性设置
          </button>
          
          <div class="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

          <button 
            @click="handleSave(false)" 
            :disabled="isLoading" 
            class="hidden sm:flex items-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
          >
             <Save class="w-4 h-4" /> 保存草稿
          </button>

          <button 
            @click="handleSave(true)" 
            :disabled="isLoading" 
            class="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-3.5 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
             <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
             <template v-else>
                <Send class="w-4 h-4" /> 正式发布
             </template>
          </button>
       </div>
    </div>

    <!-- Main Content Row -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
       <!-- Editor Column -->
       <div :class="['space-y-6', showSettings ? 'xl:col-span-8' : 'xl:col-span-12']">
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
             <input 
               v-model="title"
               type="text" 
               placeholder="在这里输入一个引人入胜的标题..." 
               class="w-full px-8 sm:px-12 py-10 text-2xl sm:text-4xl font-black text-gray-900 border-b border-gray-50 outline-none placeholder:text-gray-200"
             />
             <MarkdownEditor v-model:content="content" />
          </div>
       </div>

       <!-- Settings Column (Sticky) -->
       <Transition
         enter-active-class="transition duration-300 ease-out"
         enter-from-class="opacity-0 translate-x-12"
         enter-to-class="opacity-100 translate-x-0"
         leave-active-class="transition duration-200 ease-in"
         leave-from-class="opacity-100 translate-x-0"
         leave-to-class="opacity-0 translate-x-12"
       >
         <aside v-if="showSettings" class="xl:col-span-4 space-y-8 sticky top-32">
            <!-- Slug & Excerpt -->
            <div class="bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl space-y-8">
               <div class="space-y-4">
                  <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ImageIcon class="w-3 h-3" /> 文章别名 (SLUG)
                  </label>
                  <input v-model="slug" type="text" class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all" placeholder="url-friendly-slug" />
                  <p class="text-[10px] text-gray-400 font-medium">预览: /blog/{{ slug || 'your-post-url' }}</p>
               </div>

               <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">文章摘要 (EXCERPT)</label>
                    <button @click="handleGenerateExcerpt" class="text-[10px] font-black text-brand-purple hover:text-brand-pink transition-colors flex items-center gap-1">
                      <Sparkles class="w-3 h-3" /> 自动提取
                    </button>
                  </div>
                  <textarea v-model="excerpt" rows="5" class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all resize-none" placeholder="为您的文章写一段精炼的介绍..."></textarea>
               </div>
            </div>

            <!-- Categories -->
            <div class="bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl">
               <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                 <FolderOpen class="w-3 h-3" /> 内容分类 (CATEGORIES)
               </label>
               <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="cat in categories" 
                    :key="cat.id"
                    @click="selectedCategories.includes(cat.id) ? selectedCategories = selectedCategories.filter(id => id !== cat.id) : selectedCategories.push(cat.id)"
                    :class="['px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2', selectedCategories.includes(cat.id) ? 'bg-brand-pink border-brand-pink text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-brand-pink/30 hover:text-brand-pink']"
                  >
                    {{ cat.name }}
                  </button>
               </div>
            </div>

            <!-- Tags -->
            <div class="bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl">
               <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                 <TagIcon class="w-3 h-3" /> 文章标签 (TAGS)
               </label>
               <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="tag in tags" 
                    :key="tag.id"
                    @click="selectedTags.includes(tag.id) ? selectedTags = selectedTags.filter(id => id !== tag.id) : selectedTags.push(tag.id)"
                    :class="['px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2', selectedTags.includes(tag.id) ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-purple-200' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-purple/30 hover:text-brand-purple']"
                  >
                    # {{ tag.name }}
                  </button>
               </div>
            </div>
         </aside>
       </Transition>
    </div>
  </div>
</template>

<style scoped>
/* 可以在这里添加一些动画 */
</style>
