<script setup lang="ts">
import { Tag as TagIcon } from 'lucide-vue-next'

const client = useSupabaseClient()

const { data: tags } = await useAsyncData('tags-cloud', async () => {
  const { data: tagsData } = await client
    .from('tags')
    .select('*, post_tags(count)')
    .order('name')
  
  return (tagsData as any[]) || []
})

useSeoMeta({
  title: '标签云 | 元气银行博客',
  description: '通过标签快速找到相关主题的文章，发现感兴趣的内容。'
})

const getGradient = (index: number) => {
  const gradients = [
    'from-[#FF4D94] to-[#7C4DFF]',
    'from-[#7C4DFF] to-[#9E7AFF]',
    'from-[#FF4D94] to-[#FF6BA8]',
    'from-[#7C4DFF] to-[#FF4D94]',
  ]
  return gradients[index % gradients.length]
}

const getSize = (count: number) => {
  if (count > 10) return 'text-xl md:text-2xl px-6 md:px-8 py-3 md:py-4'
  if (count > 5) return 'text-lg md:text-xl px-4 md:px-6 py-2.5 md:py-3.5'
  return 'text-base px-4 py-2'
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <!-- Hero -->
    <header class="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100 pt-20 pb-16">
      <div class="container mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-black text-[#FF4D94] mb-6 shadow-sm border border-[#FF4D94]/20">
          <TagIcon class="w-4 h-4" />
          标签系统
        </div>
        <h1 class="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
          文章标签
        </h1>
        <p class="text-lg md:text-xl text-gray-600 font-medium">
          通过标签精确索引您感兴趣的家庭教育话题
        </p>
      </div>
    </header>

    <!-- Cloud Container -->
    <div class="container mx-auto px-4 mt-16 max-w-6xl">
      <div v-if="tags && tags.length > 0" class="bg-white rounded-[48px] p-8 md:p-16 border border-gray-100 shadow-xl">
        <div class="flex flex-wrap gap-4 justify-center">
          <NuxtLink v-for="(tag, index) in tags" :key="(tag as any).id" :to="`/tags/${(tag as any).slug}`" class="group">
            <div :class="`bg-gradient-to-r ${getGradient(index)} ${getSize((tag as any).post_tags?.length || 0)} text-white rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold flex items-center gap-2 shadow-lg`">
               <span>#{{ (tag as any).name }}</span>
               <span class="text-xs opacity-75">({{ (tag as any).post_tags?.length || 0 }})</span>
            </div>
          </NuxtLink>
        </div>
      </div>
      <div v-else class="text-center py-24 bg-white rounded-[48px] border-2 border-dashed border-[#FF4D94]/10 shadow-sm">
          <TagIcon class="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h3 class="text-2xl font-black text-gray-900">暂无标签</h3>
          <p class="text-gray-500 font-medium">系统正在积累内容中...</p>
      </div>
    </div>
  </div>
</template>
