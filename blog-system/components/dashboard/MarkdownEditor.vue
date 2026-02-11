<script setup lang="ts">
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Image as ImageIcon, 
  Heading2, 
  Heading3,
  Eye,
  Edit3,
  Code
} from 'lucide-vue-next'
import MediaLibraryModal from './MediaLibraryModal.vue'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  (e: 'update:content', val: string): void
}>()

const showMediaLibrary = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)
const isSyncing = ref(false)
const activeTab = ref<'edit' | 'preview'>('edit') // 手机端可以切 Tab，桌面端双栏

const insertMarkdown = (before: string, after: string = '') => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = props.content.substring(start, end)
  const newText = props.content.substring(0, start) + before + selectedText + after + props.content.substring(end)
  
  emit('update:content', newText)
  
  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const handleImageSelect = (url: string) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const imageMarkdown = `![图片](${url})`
  const newText = props.content.substring(0, start) + imageMarkdown + props.content.substring(start)
  
  emit('update:content', newText)
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length)
  })
}

// 同步滚动
const handleEditorScroll = () => {
  if (isSyncing.value) return
  const textarea = textareaRef.value
  const preview = previewRef.value
  if (!textarea || !preview) return

  isSyncing.value = true
  const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight || 1)
  preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
  setTimeout(() => isSyncing.value = false, 50)
}

const handlePreviewScroll = () => {
  if (isSyncing.value) return
  const textarea = textareaRef.value
  const preview = previewRef.value
  if (!textarea || !preview) return

  isSyncing.value = true
  const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1)
  textarea.scrollTop = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight)
  setTimeout(() => isSyncing.value = false, 50)
}
</script>

<template>
  <div class="border border-gray-100 rounded-[32px] overflow-hidden bg-white shadow-2xl flex flex-col h-[700px]">
    <!-- Toolbar -->
    <div class="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-1.5 flex-wrap">
        <button type="button" @click="insertMarkdown('**', '**')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all font-black" title="加粗">
          <Bold class="w-5 h-5" />
        </button>
        <button type="button" @click="insertMarkdown('*', '*')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="斜体">
          <Italic class="w-5 h-5" />
        </button>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <button type="button" @click="insertMarkdown('## ', '')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="H2">
          <Heading2 class="w-5 h-5" />
        </button>
        <button type="button" @click="insertMarkdown('### ', '')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="H3">
          <Heading3 class="w-5 h-5" />
        </button>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <button type="button" @click="insertMarkdown('[', '](url)')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="链接">
          <LinkIcon class="w-5 h-5" />
        </button>
        <button type="button" @click="showMediaLibrary = true" class="px-3 h-10 flex items-center gap-2 rounded-xl bg-[#7C4DFF] text-white shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest" title="插入图片">
          <ImageIcon class="w-4 h-4" /> 媒体库
        </button>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <button type="button" @click="insertMarkdown('\n- ', '')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="列表">
          <List class="w-5 h-5" />
        </button>
        <button type="button" @click="insertMarkdown('\n> ', '')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="引用">
          <Quote class="w-5 h-5" />
        </button>
        <button type="button" @click="insertMarkdown('\n```\n', '\n```\n')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-600 transition-all" title="代码块">
          <Code class="w-5 h-5" />
        </button>
      </div>

      <!-- Mobile Tab Switcher -->
      <div class="lg:hidden flex bg-gray-100 p-1 rounded-xl">
         <button @click="activeTab = 'edit'" :class="['px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all', activeTab === 'edit' ? 'bg-white text-brand-pink shadow-sm' : 'text-gray-400']">编辑</button>
         <button @click="activeTab = 'preview'" :class="['px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all', activeTab === 'preview' ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-400']">预览</button>
      </div>
    </div>

    <!-- Main Views -->
    <div class="flex-1 flex overflow-hidden">
       <!-- Editor Area -->
       <div :class="['flex-1 flex flex-col min-w-0', activeTab === 'edit' ? 'flex' : 'hidden lg:flex']">
          <div class="px-6 py-2 bg-gray-50/30 border-b border-gray-50 flex items-center justify-between">
             <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Edit3 class="w-3 h-3" /> EDITOR
             </span>
          </div>
          <textarea
            ref="textareaRef"
            :value="content"
            @input="(e: any) => emit('update:content', e.target.value)"
            @scroll="handleEditorScroll"
            class="flex-1 w-full p-8 font-mono text-base bg-white focus:outline-none resize-none leading-relaxed text-gray-800 placeholder-gray-200"
            placeholder="# 在这里开始你的创作..."
          ></textarea>
       </div>

       <!-- Preview Area -->
       <div :class="['flex-1 lg:border-l border-gray-100 flex flex-col min-w-0', activeTab === 'preview' ? 'flex' : 'hidden lg:flex']">
          <div class="px-6 py-2 bg-gray-50/30 border-b border-gray-50 flex items-center justify-between">
             <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Eye class="w-3 h-3" /> PREVIEW
             </span>
          </div>
          <div 
            ref="previewRef"
            @scroll="handlePreviewScroll"
            class="flex-1 overflow-y-auto p-8 bg-white selection:bg-brand-pink/10"
          >
            <div v-if="content" class="article-content">
               <MarkdownContent :content="content" />
            </div>
            <div v-else class="h-full flex flex-col items-center justify-center text-gray-300">
               <Eye class="w-12 h-12 mb-4 opacity-20" />
               <p class="text-xs font-black uppercase tracking-widest">预览将在这里实时呈现</p>
            </div>
          </div>
       </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
       <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
         支持 Markdown 语法 · 图片支持粘贴 (开发中)
       </p>
       <p class="text-[10px] font-black text-brand-pink uppercase tracking-widest">
         {{ content.length }} 字符
       </p>
    </div>

    <MediaLibraryModal
      :is-open="showMediaLibrary"
      @close="showMediaLibrary = false"
      @select="handleImageSelect"
    />
  </div>
</template>

<style scoped>
textarea {
  scrollbar-width: thin;
  scrollbar-color: #F3F4F6 transparent;
}
textarea::-webkit-scrollbar {
  width: 6px;
}
textarea::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb {
  background: #F3F4F6;
  border-radius: 10px;
}
</style>
