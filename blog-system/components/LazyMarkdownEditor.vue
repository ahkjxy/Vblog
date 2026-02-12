<script setup lang="ts">
// 懒加载 Markdown 编辑器
const MarkdownEditor = defineAsyncComponent(() =>
  import('~/components/dashboard/MarkdownEditor.vue')
)

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <Suspense>
    <template #default>
      <MarkdownEditor :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
    </template>
    <template #fallback>
      <div class="w-full h-96 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-[#FF4D94] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600 font-bold">加载编辑器中...</p>
        </div>
      </div>
    </template>
  </Suspense>
</template>
