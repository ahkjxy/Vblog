<script setup lang="ts">
import {
  MessageCircle, ArrowRight, Eye, User, Calendar, Clock, TrendingUp,
  ChevronLeft, ChevronRight, Download, Smartphone, Layers, Star
} from 'lucide-vue-next'

const route = useRoute()
const currentPage = Number(route.query.page) || 1
const POSTS_PER_PAGE = 10

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 获取博客列表数据
const { data: blogData, pending } = await useAsyncData(
  `blog-list-${currentPage}`,
  async () => {
    const client = useSupabaseClient()
    const offset = (currentPage - 1) * POSTS_PER_PAGE

    // 获取总数
    const { count: totalCount } = await client
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // 获取文章列表
    const { data: posts } = await client
      .from('posts')
      .select('id, title, slug, excerpt, published_at, view_count, author_id, profiles!posts_author_id_fkey(name, avatar_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + POSTS_PER_PAGE - 1)

    // 为每篇文章获取评论数
    const postsWithComments = posts ? await Promise.all(
      posts.map(async (post: any) => {
        const { count } = await client
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .eq('status', 'approved')
        return { ...post, commentCount: count || 0 }
      })
    ) : []

    // 获取侧边栏数据
    const [
      { data: hotPosts },
      { data: recentPosts }
    ] = await Promise.all([
      client.from('posts').select('id, title, slug, view_count').eq('status', 'published').order('view_count', { ascending: false }).limit(5),
      client.from('posts').select('id, title, slug, published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(5)
    ])

    return {
      posts: postsWithComments,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / POSTS_PER_PAGE),
      hotPosts: hotPosts || [],
      recentPosts: recentPosts || []
    }
  }
)

useSeoMeta({
  title: '社区讨论 - 元气银行社区',
  description: '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动平台。'
})
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

    <!-- Main Content -->
    <template v-else-if="blogData">
      <!-- Header -->
      <div class="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] relative overflow-hidden">
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/30 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/30 rounded-full blur-[100px]"></div>
        </div>
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div class="max-w-7xl mx-auto">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white mb-4 border border-white/30">
                  <MessageCircle class="w-4 h-4" />
                  <span>社区讨论</span>
                </div>
                <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                  所有讨论主题
                </h1>
                <p class="text-base sm:text-lg text-white/90 font-medium">家长们分享经验、交流心得的互动平台</p>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center">
                <div class="text-4xl sm:text-5xl font-black text-white mb-2">{{ blogData.totalCount }}</div>
                <div class="text-sm font-bold text-white/80 uppercase tracking-wider">主题总数</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-8">
              <!-- Posts List - 论坛风格 -->
              <div v-if="blogData.posts.length > 0" class="space-y-4">
                <NuxtLink 
                  v-for="post in blogData.posts" 
                  :key="post.id"
                  :to="`/blog/${post.slug}`"
                  class="block group"
                >
                  <article class="bg-white rounded-3xl border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all p-6 overflow-hidden">
                    <div class="flex gap-4">
                      <!-- Avatar -->
                      <div class="flex-shrink-0">
                        <div class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-100 group-hover:border-[#FF4D94]/30 transition-all">
                          <img 
                            v-if="post.profiles?.avatar_url" 
                            :src="post.profiles.avatar_url" 
                            :alt="post.profiles.name"
                            class="w-full h-full object-cover"
                          />
                          <div v-else class="w-full h-full bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center">
                            <User class="w-7 h-7 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <!-- Title -->
                        <h2 class="text-xl font-black text-gray-900 group-hover:text-[#FF4D94] transition-colors mb-2 line-clamp-2 leading-snug">
                          {{ post.title }}
                        </h2>
                        
                        <!-- Excerpt -->
                        <p v-if="post.excerpt" class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed font-medium">
                          {{ post.excerpt }}
                        </p>
                        
                        <!-- Meta Info -->
                        <div class="flex flex-wrap items-center gap-3 text-xs">
                          <div class="flex items-center gap-2">
                            <span class="font-black text-gray-900">
                              {{ post.profiles?.name ? `${post.profiles.name}的家庭` : '匿名家庭' }}
                            </span>
                          </div>
                          <span class="text-gray-300">•</span>
                          <div class="flex items-center gap-1.5 text-gray-600">
                            <Calendar class="w-3.5 h-3.5" />
                            <span class="font-bold">{{ formatDate(post.published_at) }}</span>
                          </div>
                          <span class="text-gray-300">•</span>
                          <div class="flex items-center gap-1.5 text-gray-600">
                            <div class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Eye class="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span class="font-bold">{{ post.view_count || 0 }}</span>
                          </div>
                          <span class="text-gray-300">•</span>
                          <div class="flex items-center gap-1.5 text-gray-600">
                            <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                              <MessageCircle class="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <span class="font-bold">{{ post.commentCount || 0 }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Arrow Icon -->
                      <div class="flex-shrink-0 hidden md:flex items-center">
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/10 group-hover:from-[#FF4D94] group-hover:to-[#7C4DFF] flex items-center justify-center transition-all">
                          <ArrowRight class="w-5 h-5 text-[#FF4D94] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </article>
                </NuxtLink>
              </div>

              <!-- Empty State -->
              <div v-else class="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                <div class="max-w-md mx-auto">
                  <div class="w-20 h-20 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle class="w-10 h-10 text-[#FF4D94]" />
                  </div>
                  <h3 class="text-2xl font-black mb-2 text-gray-900">还没有讨论主题</h3>
                  <p class="text-sm text-gray-600 mb-6 font-bold">成为第一个发起讨论的人</p>
                  <NuxtLink 
                    to="/auth/unified"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-sm sm:text-base"
                  >
                    登录后台发布主题
                    <ArrowRight class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="blogData.posts.length > 0 && blogData.totalPages > 1" class="flex flex-wrap items-center justify-center gap-2 mt-8 sm:mt-12">
                <!-- Previous Button -->
                <NuxtLink
                  v-if="currentPage > 1"
                  :to="`/blog?page=${currentPage - 1}`"
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
                    v-for="pageNum in Array.from({ length: Math.min(blogData.totalPages, 7) }, (_, i) => {
                      if (blogData.totalPages <= 7) return i + 1
                      if (currentPage <= 4) return i + 1
                      if (currentPage >= blogData.totalPages - 3) return blogData.totalPages - 6 + i
                      return currentPage - 3 + i
                    })"
                    :key="pageNum"
                    :to="`/blog?page=${pageNum}`"
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
                  v-if="currentPage < blogData.totalPages"
                  :to="`/blog?page=${currentPage + 1}`"
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

            <!-- Sidebar -->
            <div class="lg:col-span-4 space-y-6">
              <!-- Hot Posts -->
              <div v-if="blogData.hotPosts.length > 0" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <TrendingUp class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="font-black text-gray-900 text-lg">热门主题</h3>
                </div>
                <div class="space-y-4">
                  <NuxtLink 
                    v-for="(post, index) in blogData.hotPosts" 
                    :key="post.id" 
                    :to="`/blog/${post.slug}`"
                    class="block group"
                  >
                    <div class="flex gap-3">
                      <div 
                        :class="[
                          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm',
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                          'bg-gray-100 text-gray-600'
                        ]"
                      >
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                          {{ post.title }}
                        </h4>
                        <div class="flex items-center gap-2">
                          <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
                            <div class="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                              <Eye class="w-3 h-3 text-blue-600" />
                            </div>
                            <span>{{ post.view_count || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NuxtLink>
                </div>
              </div>
              
              <!-- Recent Posts -->
              <div v-if="blogData.recentPosts.length > 0" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <Clock class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="font-black text-gray-900 text-lg">最新主题</h3>
                </div>
                <div class="space-y-4">
                  <NuxtLink 
                    v-for="post in blogData.recentPosts" 
                    :key="post.id" 
                    :to="`/blog/${post.slug}`"
                    class="block group"
                  >
                    <h4 class="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                      {{ post.title }}
                    </h4>
                    <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
                      <Clock class="w-3 h-3" />
                      {{ formatDate(post.published_at) }}
                    </div>
                  </NuxtLink>
                </div>
                <NuxtLink 
                  to="/blog"
                  class="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100 text-sm text-[#FF4D94] hover:text-[#7C4DFF] font-black uppercase tracking-wider group"
                >
                  查看更多
                  <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </NuxtLink>
              </div>

              <!-- Download Card -->
              <div class="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                
                <div class="relative z-10">
                  <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Download class="w-7 h-7 text-white" />
                  </div>
                  <h3 class="font-black text-xl mb-3">下载应用</h3>
                  <p class="text-sm text-white/90 mb-6 leading-relaxed font-medium">
                    元气银行家庭积分管理系统，培养孩子好习惯
                  </p>
                  <div class="space-y-3">
                    <a 
                      href="https://blog.familybank.chat/download/family-bank.apk"
                      download
                      class="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#FF4D94] rounded-2xl hover:bg-white/90 transition-all font-black text-sm w-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <Smartphone class="w-4 h-4" />
                      安卓应用
                    </a>
                    <a 
                      href="https://www.familybank.chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all font-black text-sm w-full border border-white/30"
                    >
                      在线体验
                      <ArrowRight class="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- Quick Links -->
              <div class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Layers class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="font-black text-gray-900 text-lg">快速链接</h3>
                </div>
                <div class="space-y-2">
                  <NuxtLink to="/about" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div class="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight class="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span class="text-sm">关于我们</span>
                  </NuxtLink>
                  <NuxtLink to="/docs" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div class="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight class="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span class="text-sm">使用文档</span>
                  </NuxtLink>
                  <NuxtLink to="/changelog" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div class="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight class="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span class="text-sm">更新日志</span>
                  </NuxtLink>
                  <NuxtLink to="/contact" class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div class="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight class="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span class="text-sm">联系我们</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
