<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Image as ImageIcon, Heading2, Heading3 } from 'lucide-vue-next'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)
const isSyncing = ref(false)

const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const insertMarkdown = (before: string, after: string = '') => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const newText = content.value.substring(0, start) + before + selectedText + after + content.value.substring(end)
  
  content.value = newText
  
  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

// 同步滚动：编辑区 -> 预览区
const handleEditorScroll = () => {
  if (isSyncing.value) return
  
  const textarea = textareaRef.value
  const preview = previewRef.value
  if (!textarea || !preview) return

  isSyncing.value = true
  
  requestAnimationFrame(() => {
    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight || 1)
    const targetScroll = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
    
    preview.scrollTop = targetScroll
    
    setTimeout(() => {
      isSyncing.value = false
    }, 10)
  })
}

// 同步滚动：预览区 -> 编辑区
const handlePreviewScroll = () => {
  if (isSyncing.value) return
  
  const textarea = textareaRef.value
  const preview = previewRef.value
  if (!textarea || !preview) return

  isSyncing.value = true
  
  requestAnimationFrame(() => {
    const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1)
    const targetScroll = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight)
    
    textarea.scrollTop = targetScroll
    
    setTimeout(() => {
      isSyncing.value = false
    }, 10)
  })
}
</script>

<template>
  <div class="border rounded-xl overflow-hidden bg-white shadow-sm">
    <!-- Toolbar -->
    <div class="border-b bg-gray-50 px-2 sm:px-4 py-2">
      <div class="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          @click="insertMarkdown('**', '**')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="粗体 (Ctrl+B)"
        >
          <Bold class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('*', '*')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="斜体 (Ctrl+I)"
        >
          <Italic class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <div class="w-px h-6 bg-gray-300 mx-1 flex-shrink-0"></div>
        <button
          type="button"
          @click="insertMarkdown('## ', '')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="标题 2"
        >
          <Heading2 class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('### ', '')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="标题 3"
        >
          <Heading3 class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <div class="w-px h-6 bg-gray-300 mx-1 flex-shrink-0"></div>
        <button
          type="button"
          @click="insertMarkdown('[', '](url)')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="链接"
        >
          <LinkIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('![alt](', ')')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="图片"
        >
          <ImageIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <div class="w-px h-6 bg-gray-300 mx-1 flex-shrink-0"></div>
        <button
          type="button"
          @click="insertMarkdown('- ', '')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="无序列表"
        >
          <List class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('1. ', '')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="有序列表"
        >
          <ListOrdered class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('> ', '')"
          class="p-1.5 sm:p-2 hover:bg-white rounded transition-colors flex-shrink-0"
          title="引用"
        >
          <Quote class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Editor and Preview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
      <!-- Editor -->
      <div class="relative">
        <div class="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs font-bold text-gray-400 uppercase tracking-wider pointer-events-none z-10">
          编辑
        </div>
        <textarea
          ref="textareaRef"
          v-model="content"
          @scroll="handleEditorScroll"
          class="w-full h-[400px] sm:h-[500px] lg:h-[600px] p-3 sm:p-4 pt-10 sm:pt-12 font-mono text-sm resize-none focus:outline-none"
          placeholder="在此输入 Markdown 内容..."
        ></textarea>
      </div>

      <!-- Preview - 桌面端显示 -->
      <div class="relative hidden lg:block">
        <div class="absolute top-3 left-3 text-xs font-bold text-gray-400 uppercase tracking-wider pointer-events-none z-10">
          预览
        </div>
        <div
          ref="previewRef"
          @scroll="handlePreviewScroll"
          class="h-[600px] overflow-y-auto p-4 pt-12 prose prose-sm max-w-none"
        >
          <MarkdownContent :content="content" />
        </div>
      </div>
    </div>

    <!-- 移动端预览提示 -->
    <div class="lg:hidden border-t bg-blue-50 px-3 py-2 text-xs text-blue-700">
      💡 提示：在桌面端可以看到实时预览效果
    </div>
  </div>
</template>
