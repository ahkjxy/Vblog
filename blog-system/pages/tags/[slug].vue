<script setup lang="ts">
import { Calendar, Eye, ArrowRight, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatAuthorName = (profile: any) => {
  return profile?.name ? `${profile.name}的家庭` : '匿名家庭'
}

// 获取标签及文章列表
const { data: tagData, error } = await useAsyncData(
  `tag-${slug}`,
  async () => {
    const client = useSupabaseClient()
    
    // 获取标签信息
    const { data: tag, error: tagError } = await client
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (tagError || !tag) {
      throw createError({ statusCode: 404, statusMessage: '标签未找到' })
    }
    
    // 获取该标签下的文章ID
    const { data: postTags } = await client
      .from('post_tags')
      .select('post_id')
      .eq('tag_id', tag.id)
    
    const postIds = postTags?.map(pt => pt.post_id) || []
    
    if (postIds.length === 0) {
      return {
        tag,
        posts: []
      }
    }
    
    // 获取文章列表
    const { data: posts } = await client
      .from('posts')
      .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name, avatar_url)')
      .in('id', postIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    
    return {
      tag,
      posts: posts || []
    }
  }
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: '标签未找到' })
}

// SEO
if (tagData.value?.tag) {
  useSeoMeta({
    title: `#${tagData.value.tag.name}`,
    description: `浏览标签 #${tagData.value.tag.name} 下的所有文章`
  })
}

const gradients = [
  { from: 'from-purple-500', to: 'to-pink-500' },
  { from: 'from-pink-500', to: 'to-rose-500' },
  { from: 'from-purple-600', to: 'to-indigo-500' },
  { from: 'from-fuchsia-500', to: 'to-pink-500' },
]
</script>

<template>
  <div v-if="tagData" class="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
    <!-- Hero -->
    <div class="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div class="max-w-7xl mx-auto">
          <NuxtLink 
            to="/tags"
            class="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FF4D94] hover:text-[#7C4DFF] mb-6 font-bold"
          >
            <ArrowLeft class="w-4 h-4" />
            返回标签列表
          </NuxtLink>
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
            #{{ tagData.tag.name }}
          </h1>
          <p class="text-sm sm:text-base md:text-lg text-gray-600 font-medium">
            共 {{ tagData.posts.length }} 篇文章
          </p>
        </div>
      </div>
    </div>

    <!-- Posts List -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div class="max-w-7xl mx-auto">
        <div v-if="tagData.posts.length > 0" class="space-y-6">
          <article 
            v-for="(post, index) in tagData.posts" 
            :key="post.id" 
            class="group bg-white rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF4D94]/30"
          >
            <div 
              :class="[
                'h-1 w-16 sm:w-20 rounded-full bg-gradient-to-r mb-4 sm:mb-6',
                `${gradients[index % gradients.length].from} ${gradients[index % gradients.length].to}`
              ]"
            ></div>
            
            <NuxtLink :to="`/blog/${post.slug}`">
              <h2 class="text-xl sm:text-2xl md:text-3xl font-black mb-4 group-hover:text-[#FF4D94] transition-colors leading-tight tracking-tight">
                {{ post.title }}
              </h2>
            </NuxtLink>
            <p v-if="post.excerpt" class="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 line-clamp-2 leading-relaxed font-medium">
              {{ post.excerpt }}
            </p>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-gray-100">
              <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <div class="flex items-center gap-3">
                  <div v-if="post.profiles?.avatar_url" class="w-10 h-10 rounded-full ring-2 ring-gray-100 overflow-hidden">
                    <img 
                      :src="post.profiles.avatar_url" 
                      :alt="post.profiles.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    v-else
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
                      `bg-gradient-to-br ${gradients[index % gradients.length].from} ${gradients[index % gradients.length].to}`
                    ]"
                  >
                    <span class="text-white font-black text-sm">
                      {{ post.profiles?.name?.charAt(0).toUpperCase() || 'U' }}
                    </span>
                  </div>
                  <span class="font-black text-gray-900">{{ formatAuthorName(post.profiles) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Calendar class="w-3 h-3 sm:w-4 sm:h-4" />
                  <span class="font-medium">{{ formatDate(post.published_at) }}</span>
                </div>
                <div class="flex items-center gap-2 bg-[#FF4D94]/5 px-3 py-1.5 rounded-xl border border-[#FF4D94]/10">
                  <Eye class="w-3 h-3 sm:w-4 sm:h-4 text-[#FF4D94]" />
                  <span class="font-black text-[#FF4D94]">{{ post.view_count }}</span>
                </div>
              </div>
              <NuxtLink 
                :to="`/blog/${post.slug}`"
                class="flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-xs sm:text-sm group-hover:gap-3 transition-all"
              >
                阅读全文
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-[#FF4D94]/20">
          <div class="max-w-md mx-auto px-4">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4D94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black mb-4 text-gray-900">暂无文章</h3>
            <p class="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 font-medium">该标签下还没有文章</p>
            <NuxtLink 
              to="/blog"
              class="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:shadow-xl transition-all font-black text-sm sm:text-base hover:scale-105 active:scale-95"
            >
              浏览所有文章
              <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
