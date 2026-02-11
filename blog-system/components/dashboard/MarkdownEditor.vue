<script setup lang="ts">
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
  <div class="border rounded-lg overflow-hidden bg-white">
    <!-- Toolbar -->
    <div class="border-b bg-gray-50 px-4 py-2">
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="insertMarkdown('**', '**')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="粗体 (Ctrl+B)"
        >
          <Bold class="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('*', '*')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="斜体 (Ctrl+I)"
        >
          <Italic class="w-4 h-4 text-gray-600" />
        </button>
        
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          @click="insertMarkdown('\n## ', '')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="二级标题"
        >
          <Heading2 class="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('\n### ', '')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="三级标题"
        >
          <Heading3 class="w-4 h-4 text-gray-600" />
        </button>
        
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          @click="insertMarkdown('[', '](url)')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="链接"
        >
          <LinkIcon class="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('![图片](', ')')"
          class="p-2 rounded transition-colors bg-purple-100 hover:bg-purple-200"
          title="插入图片"
        >
          <ImageIcon class="w-4 h-4 text-purple-600" />
        </button>
        
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          @click="insertMarkdown('\n- ', '')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="无序列表"
        >
          <List class="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('\n1. ', '')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="有序列表"
        >
          <ListOrdered class="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('\n> ', '')"
          class="p-2 hover:bg-white rounded transition-colors"
          title="引用"
        >
          <Quote class="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          @click="insertMarkdown('\n```\n', '\n```\n')"
          class="px-3 py-2 hover:bg-white rounded transition-colors text-xs font-mono text-gray-600"
          title="代码块"
        >
          &lt;/&gt;
        </button>
      </div>
    </div>

    <!-- Editor and Preview - Side by Side -->
    <div class="grid grid-cols-2 divide-x">
      <!-- Left: Editor -->
      <div class="bg-white">
        <div class="px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
          编辑区
        </div>
        <textarea
          ref="textareaRef"
          v-model="content"
          @scroll="handleEditorScroll"
          class="w-full h-[600px] p-4 font-mono text-sm focus:outline-none resize-none"
          style="line-height: 1.6; tab-size: 2;"
          placeholder="# 开始输入 Markdown 内容

## 二级标题

使用左侧工具栏快速插入格式

- 列表项 1
- 列表项 2

**粗体** 和 *斜体*

[链接](https://example.com)"
        />
      </div>

      <!-- Right: Preview -->
      <div class="bg-white">
        <div class="px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
          实时预览
        </div>
        <div 
          ref="previewRef"
          @scroll="handlePreviewScroll"
          class="p-6 h-[600px] overflow-y-auto"
        >
          <div v-if="content" class="article-content">
            <MarkdownContent :content="content" />
          </div>
          <div v-else class="text-gray-400 text-center py-12">
            <p class="text-sm">在左侧输入内容，这里会实时显示预览效果</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500">
      💡 提示：左侧编辑 Markdown，右侧实时预览效果 · 滚动自动同步
    </div>
  </div>
</template>
