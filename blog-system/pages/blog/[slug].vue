<script setup lang="ts">
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  Share2, 
  ThumbsUp, 
  MessageCircle,
  ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const client = useSupabaseClient()
const { formatDate, formatAuthorName } = useUtils()

const slug = route.params.slug as string

// Fetch Post Data via SSR
const { data: post, error } = await useAsyncData(`post-${slug}`, async () => {
  const { data, error } = await client
    .from('posts')
    .select(`
      *,
      profiles!posts_author_id_fkey(name, avatar_url, bio, role),
      post_categories(categories(name, slug)),
      post_tags(tags(name, slug))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) throw createError({ statusCode: 404, message: '文章未找到' })
  return data
})

if (error.value) {
  throw error.value
}

// SEO Meta
useSeoMeta({
  title: () => `${post.value?.title} | 元气银行博客`,
  ogTitle: () => post.value?.title,
  description: () => post.value?.excerpt || '元气银行博客文章',
  ogDescription: () => post.value?.excerpt,
  ogType: 'article',
  articlePublishedTime: () => post.value?.published_at,
})

// 阅读进度
const scrollPercent = ref(0)
onMounted(() => {
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    scrollPercent.value = (winScroll / height) * 100
  })

  // Increment view count
  if (post.value) {
    client.from('posts')
      .update({ view_count: (post.value.view_count || 0) + 1 })
      .eq('id', post.value.id)
      .then(() => {})
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
    <!-- Reading Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
      <div 
        class="h-full bg-gradient-to-r from-brand-pink to-brand-purple transition-all duration-150"
        :style="{ width: `${scrollPercent}%` }"
      ></div>
    </div>

    <div class="container mx-auto px-4 py-8 lg:py-12">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- Main Content -->
          <article class="lg:col-span-8">
            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-2 text-sm font-bold text-gray-400 mb-8">
              <NuxtLink to="/" class="hover:text-brand-pink transition-colors">首页</NuxtLink>
              <ChevronRight class="w-4 h-4" />
              <NuxtLink to="/blog" class="hover:text-brand-pink transition-colors">探索</NuxtLink>
              <ChevronRight class="w-4 h-4" />
              <span class="text-gray-900 truncate">{{ post?.title }}</span>
            </nav>

            <header class="mb-12">
              <div v-if="post?.post_categories?.length" class="flex flex-wrap gap-2 mb-6">
                <NuxtLink v-for="pc in (post.post_categories as any)" :key="pc.categories.slug" 
                  :to="`/categories/${pc.categories.slug}`"
                  class="px-3 py-1 bg-brand-pink/5 text-brand-pink rounded-full text-xs font-black uppercase tracking-wider hover:bg-brand-pink/10 transition-colors">
                  {{ pc.categories.name }}
                </NuxtLink>
              </div>

              <h1 class="text-3xl lg:text-5xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
                {{ post?.title }}
              </h1>

              <div class="flex flex-wrap items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-purple p-0.5 shadow-lg">
                    <div class="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                      <img v-if="post?.profiles?.avatar_url" :src="post.profiles.avatar_url" class="w-full h-full object-cover" />
                      <User v-else class="w-6 h-6 text-brand-pink" />
                    </div>
                  </div>
                  <div>
                    <div class="font-black text-gray-900 text-sm">{{ formatAuthorName(post?.profiles) }}</div>
                    <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ post?.profiles?.role === 'admin' ? '官方作者' : '社区成员' }}</div>
                  </div>
                </div>

                <div class="h-8 w-px bg-gray-100 hidden sm:block"></div>

                <div class="flex flex-wrap gap-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4 text-brand-pink" />
                    {{ formatDate(post?.published_at) }}
                  </div>
                  <div class="flex items-center gap-2">
                    <Eye class="w-4 h-4 text-brand-purple" />
                    {{ post?.view_count }} 阅读
                  </div>
                </div>
              </div>
            </header>

            <!-- Content -->
            <div class="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-100 shadow-sm mb-12 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div class="relative prose prose-brand max-w-none">
                <MarkdownContent v-if="post?.content" :content="post.content" />
              </div>
              
              <!-- Tags -->
              <div v-if="post?.post_tags?.length" class="mt-12 pt-8 border-t border-gray-50 flex flex-wrap gap-3">
                <NuxtLink v-for="pt in (post.post_tags as any)" :key="pt.tags.slug" 
                  :to="`/tags/${pt.tags.slug}`"
                  class="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-black hover:bg-brand-pink hover:text-white transition-all">
                  # {{ pt.tags.name }}
                </NuxtLink>
              </div>
            </div>

            <!-- Author Bio -->
            <div v-if="post?.profiles?.bio" class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start mb-12">
              <div class="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden shadow-inner">
                <img v-if="post.profiles.avatar_url" :src="post.profiles.avatar_url" class="w-full h-full object-cover" />
                <User v-else class="w-8 h-8 m-6 text-gray-300" />
              </div>
              <div class="flex-1 text-center md:text-left">
                <div class="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-1.5">关于作者</div>
                <h4 class="text-lg font-black text-gray-900 mb-2">{{ formatAuthorName(post.profiles) }}</h4>
                <p class="text-sm text-gray-500 font-medium leading-relaxed">{{ post.profiles.bio }}</p>
              </div>
            </div>

            <!-- Comments -->
            <Comments :post-id="post.id" />
          </article>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 lg:pt-24">
            <div class="sticky top-24 space-y-8">
              <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 class="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Zap class="w-5 h-5 text-brand-pink" />
                  快速操作
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <button class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-brand-pink/5 group transition-all">
                    <ThumbsUp class="w-6 h-6 text-gray-400 group-hover:text-brand-pink transition-colors" />
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-pink">点赞</span>
                  </button>
                  <button class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-brand-purple/5 group transition-all">
                    <Share2 class="w-6 h-6 text-gray-400 group-hover:text-brand-purple transition-colors" />
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-purple">分享</span>
                  </button>
                </div>
              </div>

              <div class="bg-gradient-to-br from-brand-pink to-brand-purple rounded-3xl p-8 text-white shadow-2xl">
                <h3 class="font-black text-xl mb-3">加入社区</h3>
                <p class="text-sm text-white/90 mb-6 font-medium leading-relaxed">
                  想要体验更完整的家庭教育积分系统？立即下载元气银行应用。
                </p>
                <a href="https://www.familybank.chat" target="_blank" class="block w-full text-center py-4 bg-white text-brand-pink rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
                  立即体验
                </a>
              </div>

              <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 class="font-black text-gray-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Clock class="w-4 h-4 text-brand-pink" />
                  阅读建议
                </h3>
                <p class="text-sm text-gray-500 leading-relaxed font-medium">
                  这篇文章大约需要 {{ Math.ceil((post?.content?.length || 0) / 500) }} 分钟阅读。欢迎在评论区留下您的看法，我们将认真阅读每一条建议。
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 针对详情页的一些样式增强 */
</style>
