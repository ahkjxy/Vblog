<script setup lang="ts">
import { Calendar, Eye, User, ArrowRight, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string
const currentPage = Number(route.query.page) || 1
const POSTS_PER_PAGE = 20

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatAuthorName = (profile: any) => {
  return profile?.name ? `${profile.name}的家庭` : '匿名家庭'
}

// 获取分类及文章列表
const { data: categoryData, error } = await useAsyncData(
  `category-${slug}-${currentPage}`,
  async () => {
    const client = useSupabaseClient()
    const offset = (currentPage - 1) * POSTS_PER_PAGE
    
    // 获取分类信息
    const { data: category, error: categoryError } = await client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (categoryError || !category) {
      throw createError({ statusCode: 404, statusMessage: '分类未找到' })
    }
    
    // 获取该分类下的文章ID
    const { data: postCategories } = await client
      .from('post_categories')
      .select('post_id')
      .eq('category_id', category.id)
    
    const postIds = postCategories?.map(pc => pc.post_id) || []
    
    if (postIds.length === 0) {
      return {
        category,
        posts: [],
        totalCount: 0,
        totalPages: 0
      }
    }
    
    // 获取总数
    const { count: totalCount } = await client
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .in('id', postIds)
      .eq('status', 'published')
    
    // 获取文章列表
    const { data: posts } = await client
      .from('posts')
      .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name, avatar_url)')
      .in('id', postIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + POSTS_PER_PAGE - 1)
    
    return {
      category,
      posts: posts || [],
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / POSTS_PER_PAGE)
    }
  }
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: '分类未找到' })
}

// SEO
if (categoryData.value?.category) {
  useSeoMeta({
    title: categoryData.value.category.name,
    description: categoryData.value.category.description || `浏览 ${categoryData.value.category.name} 分类下的所有文章`
  })
}
</script>

<template>
  <div v-if="categoryData" class="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
    <!-- Forum Header -->
    <div class="bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div class="max-w-7xl mx-auto">
          <NuxtLink 
            to="/"
            class="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FF4D94] hover:text-[#7C4DFF] mb-4 font-bold"
          >
            <ArrowLeft class="w-4 h-4" />
            返回首页
          </NuxtLink>
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
                {{ categoryData.category.name }}
              </h1>
              <p v-if="categoryData.category.description" class="text-sm sm:text-base text-gray-600 font-medium">
                {{ categoryData.category.description }}
              </p>
            </div>
            <div class="text-left sm:text-right">
              <div class="text-2xl sm:text-3xl font-black text-[#FF4D94]">{{ categoryData.totalCount }}</div>
              <div class="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider">主题</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forum Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Posts List -->
        <div v-if="categoryData.posts.length > 0" class="space-y-3 sm:space-y-4">
          <NuxtLink
            v-for="post in categoryData.posts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
          >
            <article class="bg-white rounded-2xl hover:shadow-xl transition-all border border-gray-100 hover:border-[#FF4D94]/30">
              <div class="block p-4 sm:p-5 md:p-6">
                <div class="flex gap-4">
                  <!-- Avatar -->
                  <div class="flex-shrink-0">
                    <div v-if="post.profiles?.avatar_url" class="w-12 h-12 rounded-full ring-2 ring-gray-100 overflow-hidden">
                      <img 
                        :src="post.profiles.avatar_url" 
                        :alt="post.profiles.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div v-else class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black text-sm sm:text-base">
                      {{ post.profiles?.name?.charAt(0).toUpperCase() || 'U' }}
                    </div>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <h2 class="text-base sm:text-lg font-black text-gray-900 hover:text-[#FF4D94] transition-colors mb-2 line-clamp-2 leading-snug">
                      {{ post.title }}
                    </h2>
                    <p v-if="post.excerpt" class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed font-medium">
                      {{ post.excerpt }}
                    </p>
                    <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                      <span class="font-bold text-gray-700">{{ formatAuthorName(post.profiles) }}</span>
                      <span class="hidden sm:inline">•</span>
                      <div class="flex items-center gap-1">
                        <Calendar class="w-3 h-3" />
                        {{ formatDate(post.published_at) }}
                      </div>
                      <span class="hidden sm:inline">•</span>
                      <div class="flex items-center gap-1">
                        <Eye class="w-3 h-3" />
                        {{ post.view_count }} 浏览
                      </div>
                    </div>
                  </div>
                  
                  <!-- Stats -->
                  <div class="flex-shrink-0 text-center hidden md:block">
                    <div class="text-lg sm:text-xl font-black text-[#FF4D94]">{{ post.view_count }}</div>
                    <div class="text-xs text-gray-500 font-bold uppercase tracking-wider">浏览</div>
                  </div>
                </div>
              </div>
            </article>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
          <div class="max-w-md mx-auto">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 sm:w-10 sm:h-10 text-[#FF4D94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl sm:text-2xl font-black mb-2 text-gray-900">该板块还没有主题</h3>
            <p class="text-sm sm:text-base text-gray-600 mb-6 font-medium">成为第一个发帖的人</p>
            <NuxtLink 
              to="/blog"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:shadow-xl transition-all font-black text-sm sm:text-base"
            >
              浏览所有主题
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="categoryData.posts.length > 0 && categoryData.totalPages > 1" class="flex flex-wrap items-center justify-center gap-2 mt-8 sm:mt-12">
          <!-- Previous Button -->
          <NuxtLink
            v-if="currentPage > 1"
            :to="`/categories/${slug}?page=${currentPage - 1}`"
            class="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#FF4D94]/30 transition-all text-sm font-bold text-gray-700"
          >
            <ChevronLeft class="w-4 h-4" />
            <span class="hidden sm:inline">上一页</span>
          </NuxtLink>
          <div v-else class="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed">
            <ChevronLeft class="w-4 h-4" />
            <span class="hidden sm:inline">上一页</span>
          </div>
          
          <!-- Page Numbers -->
          <div class="flex items-center gap-1">
            <NuxtLink
              v-for="pageNum in Array.from({ length: Math.min(categoryData.totalPages, 7) }, (_, i) => {
                if (categoryData.totalPages <= 7) return i + 1
                if (currentPage <= 4) return i + 1
                if (currentPage >= categoryData.totalPages - 3) return categoryData.totalPages - 6 + i
                return currentPage - 3 + i
              })"
              :key="pageNum"
              :to="`/categories/${slug}?page=${pageNum}`"
              :class="[
                'px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all',
                currentPage === pageNum
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#FF4D94]/30'
              ]"
            >
              {{ pageNum }}
            </NuxtLink>
          </div>
          
          <!-- Next Button -->
          <NuxtLink
            v-if="currentPage < categoryData.totalPages"
            :to="`/categories/${slug}?page=${currentPage + 1}`"
            class="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#FF4D94]/30 transition-all text-sm font-bold text-gray-700"
          >
            <span class="hidden sm:inline">下一页</span>
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
          <div v-else class="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed">
            <span class="hidden sm:inline">下一页</span>
            <ChevronRight class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
