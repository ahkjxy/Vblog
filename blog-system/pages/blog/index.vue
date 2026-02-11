<script setup lang="ts">
import { 
  Search, 
  Sparkles, 
  Calendar, 
  Clock, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List
} from 'lucide-vue-next'

const client = useSupabaseClient()
const { formatDate, formatAuthorName } = useUtils()

const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')

// SSR Fetching
const { data: posts, pending } = await useAsyncData('blog-posts', async () => {
  const { data } = await client
    .from('posts')
    .select(`
      id, title, slug, excerpt, published_at, view_count,
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  
  return data || []
})

const filteredPosts = computed(() => {
  if (!posts.value) return []
  return posts.value.filter(post => 
    post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 pb-12">
      <div class="container mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-brand-pink/10 rounded-full text-brand-pink text-xs font-black uppercase tracking-widest mb-6">
          <Sparkles class="w-4 h-4" />
          探索新知识
        </div>
        <h1 class="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">所有文章</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          在这里，你可以找到关于家庭教育、积分管理和习惯养成的所有经验分享。
        </p>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="container mx-auto px-4 -mt-8 relative z-20">
      <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl flex flex-col md:flex-row gap-4 items-center">
        <div class="flex-1 relative w-full">
          <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索您感兴趣的主题..." 
            class="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all"
          />
        </div>
        
        <div class="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl">
          <button @click="viewMode = 'grid'" :class="`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-pink' : 'text-gray-400'}`">
            <LayoutGrid class="w-5 h-5" />
          </button>
          <button @click="viewMode = 'list'" :class="`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-pink' : 'text-gray-400'}`">
            <List class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main List -->
    <div class="container mx-auto px-4 mt-16">
      <div v-if="filteredPosts.length" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-6'">
        
        <article v-for="post in filteredPosts" :key="post.id" 
          :class="`group bg-white rounded-[40px] border border-gray-100 hover:shadow-2xl hover:border-brand-pink/20 transition-all duration-500 overflow-hidden ${viewMode === 'list' ? 'flex flex-col md:flex-row p-4 gap-8' : ''}`"
        >
          <!-- Featured Image Placeholder -->
          <div :class="`bg-gradient-to-br from-brand-pink/5 to-brand-purple/5 relative overflow-hidden ${viewMode === 'grid' ? 'aspect-[16/10]' : 'w-full md:w-80 aspect-video rounded-[32px]'}`">
            <div class="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
               <Logo class="w-24 h-24 text-brand-pink" />
            </div>
            <div class="absolute top-6 left-6 flex gap-2">
              <span class="px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-pink shadow-sm">
                家庭教育
              </span>
            </div>
          </div>

          <div :class="`flex flex-col justify-between ${viewMode === 'grid' ? 'p-8 lg:p-10' : 'flex-1 py-4 pr-6'}`">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img v-if="post.profiles?.avatar_url" :src="post.profiles.avatar_url" class="w-full h-full object-cover" />
                  <span v-else class="text-[10px] font-black text-gray-400">{{ post.profiles?.name?.[0] }}</span>
                </div>
                <span class="text-xs font-bold text-gray-400">
                  {{ formatAuthorName(post.profiles) }} • {{ formatDate(post.published_at) }}
                </span>
              </div>
              
              <NuxtLink :to="`/blog/${post.slug}`" class="block">
                <h2 :class="`font-black text-gray-900 group-hover:text-brand-pink transition-colors leading-tight ${viewMode === 'grid' ? 'text-2xl mb-4' : 'text-xl mb-2'}`">
                  {{ post.title }}
                </h2>
                <p class="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
                  {{ post.excerpt }}
                </p>
              </NuxtLink>
            </div>

            <div class="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
              <div class="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span class="flex items-center gap-1.5"><TrendingUp class="w-3.5 h-3.5 text-brand-purple" /> {{ post.view_count }}</span>
              </div>
              <NuxtLink :to="`/blog/${post.slug}`" class="p-3 bg-gray-50 text-brand-pink rounded-xl group-hover:bg-brand-pink group-hover:text-white transition-all group-hover:px-6 flex items-center gap-2 whitespace-nowrap">
                <span class="hidden group-hover:block text-[10px] font-black uppercase tracking-widest">阅读全文</span>
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </article>

      </div>
      
      <div v-else-if="!pending" class="py-32 text-center bg-white rounded-[48px] border border-gray-100">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search class="w-8 h-8 text-gray-300" />
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-2">未找到匹配的文章</h3>
        <p class="text-gray-400 font-medium">尝试更换搜索词，或者浏览其他分类。</p>
      </div>
    </div>
  </div>
</template>
