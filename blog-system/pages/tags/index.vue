<script setup lang="ts">
import { Tag } from 'lucide-vue-next'

// 获取所有标签
const { data: tags, pending } = await useAsyncData('tags', async () => {
  const client = useSupabaseClient()
  
  const { data: tagsData } = await client
    .from('tags')
    .select('*')
    .order('name', { ascending: true })
  
  if (!tagsData) return []
  
  // 为每个标签获取文章数量
  const tagsWithCount = await Promise.all(
    tagsData.map(async (tag) => {
      const { data: postTags } = await client
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', tag.id)
      
      return { ...tag, count: postTags?.length || 0 }
    })
  )
  
  return tagsWithCount
})

useSeoMeta({
  title: '文章标签 - 元气银行社区',
  description: '通过标签快速找到相关主题的文章'
})

const gradients = [
  'from-[#FF4D94] to-[#7C4DFF]',
  'from-[#7C4DFF] to-[#9E7AFF]',
  'from-[#FF4D94] to-[#FF6BA8]',
  'from-[#7C4DFF] to-[#FF4D94]',
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
    <!-- Loading State -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-[#FF4D94] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600 font-bold">加载中...</p>
      </div>
    </div>

    <template v-else>
      <!-- Hero -->
      <div class="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div class="max-w-7xl mx-auto text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs sm:text-sm font-black text-[#FF4D94] mb-6 shadow-sm border border-[#FF4D94]/20">
              <Tag class="w-4 h-4" />
              标签云
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
              文章标签
            </h1>
            <p class="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
              通过标签快速找到相关主题的文章
            </p>
          </div>
        </div>
      </div>

      <!-- Tags Cloud -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div class="max-w-7xl mx-auto">
          <div v-if="tags && tags.length > 0" class="bg-white rounded-3xl p-6 sm:p-12 md:p-16 border border-gray-100 shadow-lg">
            <div class="flex flex-wrap gap-3 sm:gap-4 justify-center">
              <NuxtLink
                v-for="(tag, index) in tags"
                :key="tag.id"
                :to="`/tags/${tag.slug}`"
                class="group"
              >
                <div 
                  :class="[
                    'bg-gradient-to-r text-white rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all font-black',
                    `bg-gradient-to-r ${gradients[index % gradients.length]}`,
                    tag.count > 10 
                      ? 'text-lg sm:text-xl md:text-2xl px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4' 
                      : tag.count > 5 
                      ? 'text-base sm:text-lg md:text-xl px-3 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3.5' 
                      : 'text-sm sm:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3'
                  ]"
                >
                  <span class="drop-shadow-sm">
                    #{{ tag.name }}
                  </span>
                  <span class="text-xs sm:text-sm ml-1 sm:ml-2 opacity-90">
                    ({{ tag.count }})
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-[#FF4D94]/20">
            <div class="max-w-md mx-auto px-4">
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                <Tag class="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4D94]" />
              </div>
              <h3 class="text-2xl sm:text-3xl font-black mb-4 text-gray-900">暂无标签</h3>
              <p class="text-sm sm:text-base text-gray-600 font-medium">还没有创建任何标签</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
