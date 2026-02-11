<script setup lang="ts">
import { FolderOpen, ArrowRight } from 'lucide-vue-next'

// 获取所有分类及文章数量
const { data: categories, pending } = await useAsyncData('categories', async () => {
  const client = useSupabaseClient()
  
  // 获取所有分类
  const { data: categoriesData } = await client
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
  
  if (!categoriesData) return []
  
  // 为每个分类获取文章数量
  const categoriesWithCount = await Promise.all(
    categoriesData.map(async (category) => {
      // 获取该分类下的文章ID
      const { data: postCategories } = await client
        .from('post_categories')
        .select('post_id')
        .eq('category_id', category.id)
      
      const postIds = postCategories?.map(pc => pc.post_id) || []
      
      // 统计已发布的文章数量
      if (postIds.length === 0) {
        return { ...category, postCount: 0 }
      }
      
      const { count } = await client
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .in('id', postIds)
        .eq('status', 'published')
      
      return { ...category, postCount: count || 0 }
    })
  )
  
  return categoriesWithCount
})

useSeoMeta({
  title: '文章分类 - 元气银行社区',
  description: '浏览不同主题的文章内容'
})

const gradients = [
  { from: 'from-purple-500', to: 'to-pink-500', bg: 'from-purple-100 to-pink-100' },
  { from: 'from-pink-500', to: 'to-rose-500', bg: 'from-pink-100 to-rose-100' },
  { from: 'from-purple-600', to: 'to-indigo-500', bg: 'from-purple-100 to-indigo-100' },
  { from: 'from-fuchsia-500', to: 'to-pink-500', bg: 'from-fuchsia-100 to-pink-100' },
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
              <FolderOpen class="w-4 h-4" />
              分类目录
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
              文章分类
            </h1>
            <p class="text-base sm:text-lg md:text-xl text-gray-600 font-medium">
              浏览不同主题的文章内容
            </p>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div class="max-w-7xl mx-auto">
          <div v-if="categories && categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <NuxtLink
              v-for="(category, index) in categories"
              :key="category.id"
              :to="`/categories/${category.slug}`"
              class="group"
            >
              <div class="bg-white rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF4D94]/30 h-full flex flex-col">
                <div 
                  :class="[
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md',
                    `bg-gradient-to-br ${gradients[index % gradients.length].bg}`
                  ]"
                >
                  <FolderOpen class="w-7 h-7 text-[#FF4D94]" />
                </div>
                <h2 class="text-xl sm:text-2xl font-black mb-3 group-hover:text-[#FF4D94] transition-colors">
                  {{ category.name }}
                </h2>
                <p v-if="category.description" class="text-sm sm:text-base text-gray-600 mb-6 line-clamp-2 flex-1 leading-relaxed font-medium">
                  {{ category.description }}
                </p>
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span class="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider">
                    {{ category.postCount }} 篇文章
                  </span>
                  <ArrowRight class="w-5 h-5 text-gray-400 group-hover:text-[#FF4D94] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-[#FF4D94]/20">
            <div class="max-w-md mx-auto px-4">
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                <FolderOpen class="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4D94]" />
              </div>
              <h3 class="text-2xl sm:text-3xl font-black mb-4 text-gray-900">暂无分类</h3>
              <p class="text-sm sm:text-base text-gray-600 font-medium">还没有创建任何分类</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
