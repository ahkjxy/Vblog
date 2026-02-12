<script setup lang="ts">
import {
  Sparkles, BookOpen, ArrowRight, Zap, Star, Eye, MessageCircle, User,
  TrendingUp, FileText, Target, Download, Smartphone, Users, Clock, Layers
} from 'lucide-vue-next'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 获取首页数据
const { data: homeData, pending } = await useAsyncData('home-data', () => useHomeData())

useSeoMeta({
  titleTemplate: '', // 禁用 titleTemplate，直接使用完整标题
  title: '元气银行社区',
  description: '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动社区平台。'
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
    <template v-else-if="homeData">
      <!-- Hero Section -->
      <div class="relative overflow-hidden bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94]">
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/30 rounded-full blur-[120px] animate-pulse"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/30 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
        </div>
        
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32 relative z-10">
          <div class="max-w-5xl mx-auto text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white mb-8 border border-white/30">
              <Sparkles class="w-4 h-4" />
              <span>元气银行社区</span>
            </div>
            
            <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight text-white tracking-tight">
              家庭教育经验
              <br />
              <span class="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                交流分享平台
              </span>
            </h1>

            
            <p class="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
              家长们分享家庭教育经验、交流习惯养成心得的互动平台
            </p>
            
            <div class="flex flex-wrap gap-4 justify-center mb-16">
              <NuxtLink to="/blog" class="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#FF4D94] rounded-2xl hover:shadow-2xl transition-all font-black text-lg hover:scale-105 active:scale-95">
                <BookOpen class="w-5 h-5" />
                <span>浏览主题</span>
                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NuxtLink>
              <a href="https://www.familybank.chat" target="_blank" rel="noopener noreferrer" class="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all font-black text-lg border-2 border-white/30 hover:border-white/50">
                <Zap class="w-5 h-5" />
                <span>立即体验</span>
                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div class="text-4xl md:text-5xl font-black mb-2 text-white">{{ homeData.stats.totalPosts }}</div>
                <div class="text-sm font-bold text-white/80 uppercase tracking-wider">讨论主题</div>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div class="text-4xl md:text-5xl font-black mb-2 text-white">{{ homeData.stats.totalUsers }}</div>
                <div class="text-sm font-bold text-white/80 uppercase tracking-wider">社区成员</div>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div class="text-4xl md:text-5xl font-black mb-2 text-white">{{ homeData.stats.totalComments }}</div>
                <div class="text-sm font-bold text-white/80 uppercase tracking-wider">评论回复</div>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div class="text-4xl md:text-5xl font-black mb-2 text-white">{{ homeData.stats.totalCategories }}</div>
                <div class="text-sm font-bold text-white/80 uppercase tracking-wider">讨论板块</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <!-- Left Column - Main Content -->
            <div class="lg:col-span-8 space-y-6 lg:space-y-8">
              <!-- Featured Posts Section -->
              <div v-if="homeData.featuredPosts.length > 0">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-lg">
                      <Star class="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-black text-gray-900 tracking-tight">精选文章</h2>
                      <p class="text-sm font-bold text-gray-500 uppercase tracking-wider">最受欢迎的优质内容</p>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <article 
                    v-for="(post, index) in homeData.featuredPosts" 
                    :key="post.id"
                    class="group relative bg-white rounded-3xl border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <!-- Rank Badge - 修复重叠问题 -->
                    <div class="absolute top-4 left-4 z-20">
                      <div 
                        :class="[
                          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg',
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          'bg-gradient-to-br from-orange-400 to-orange-600'
                        ]"
                      >
                        {{ index + 1 }}
                      </div>
                    </div>
                    
                    <NuxtLink :to="`/blog/${post.slug}`" class="block">
                      <div class="p-6 pt-16">
                        <!-- Author Info -->
                        <div class="flex items-center gap-3 mb-4">
                          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] overflow-hidden border-2 border-gray-100 flex-shrink-0">
                            <img 
                              v-if="post.profiles?.avatar_url" 
                              :src="post.profiles.avatar_url" 
                              :alt="post.profiles.name" 
                              class="w-full h-full object-cover" 
                            />
                            <div v-else class="w-full h-full flex items-center justify-center">
                              <User class="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="text-sm font-black text-gray-900 truncate">
                              {{ post.profiles?.name ? `${post.profiles.name}的家庭` : '匿名家庭' }}
                            </div>
                            <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
                              <Clock class="w-3 h-3" />
                              {{ formatDate(post.published_at) }}
                            </div>
                          </div>
                        </div>
                        
                        <!-- Title -->
                        <h3 class="font-black text-lg text-gray-900 group-hover:text-[#FF4D94] transition-colors mb-3 line-clamp-2 leading-snug">
                          {{ post.title }}
                        </h3>
                        
                        <!-- Excerpt -->
                        <p v-if="post.excerpt" class="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                          {{ post.excerpt }}
                        </p>
                        
                        <!-- Stats -->
                        <div class="flex items-center gap-4 pt-4 border-t border-gray-100">
                          <div class="flex items-center gap-2 text-gray-600">
                            <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Eye class="w-4 h-4 text-blue-600" />
                            </div>
                            <span class="text-sm font-bold">{{ post.view_count || 0 }}</span>
                          </div>
                          <div class="flex items-center gap-2 text-gray-600">
                            <div class="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                              <MessageCircle class="w-4 h-4 text-green-600" />
                            </div>
                            <span class="text-sm font-bold">{{ post.commentCount || 0 }}</span>
                          </div>
                          <div class="ml-auto">
                            <div class="w-8 h-8 rounded-lg bg-[#FF4D94]/10 group-hover:bg-[#FF4D94] flex items-center justify-center transition-colors">
                              <ArrowRight class="w-4 h-4 text-[#FF4D94] group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </NuxtLink>
                  </article>
                </div>
              </div>

              
              <!-- Categories Section - 论坛形式 -->
              <div>
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#9E7AFF] flex items-center justify-center shadow-lg">
                      <MessageCircle class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-black text-gray-900 tracking-tight">讨论板块</h2>
                      <p class="text-sm font-bold text-gray-500 uppercase tracking-wider">探索不同主题的讨论</p>
                    </div>
                  </div>
                  <NuxtLink 
                    to="/categories"
                    class="text-[#FF4D94] hover:text-[#7C4DFF] text-sm font-black flex items-center gap-2 uppercase tracking-wider group"
                  >
                    查看全部
                    <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </NuxtLink>
                </div>
                
                <div v-if="homeData.categories.length > 0" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <!-- 表头 -->
                  <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-b border-gray-100">
                    <div class="col-span-5">
                      <span class="text-xs font-black text-gray-600 uppercase tracking-wider">板块</span>
                    </div>
                    <div class="col-span-2 text-center">
                      <span class="text-xs font-black text-gray-600 uppercase tracking-wider">主题</span>
                    </div>
                    <div class="col-span-5">
                      <span class="text-xs font-black text-gray-600 uppercase tracking-wider">最新动态</span>
                    </div>
                  </div>
                  
                  <!-- 板块列表 -->
                  <div class="divide-y divide-gray-100">
                    <article 
                      v-for="category in homeData.categories" 
                      :key="category.id"
                      class="hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 sm:py-5">
                        <!-- 板块信息 -->
                        <NuxtLink :to="`/categories/${category.slug}`" class="col-span-1 md:col-span-5 flex items-center gap-4">
                          <div class="flex-shrink-0">
                            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                              {{ category.name.charAt(0) }}
                            </div>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h3 class="font-black text-base sm:text-lg text-gray-900 group-hover:text-[#FF4D94] transition-colors mb-1">
                              {{ category.name }}
                            </h3>
                            <p v-if="category.description" class="text-xs sm:text-sm text-gray-600 line-clamp-1 font-medium">
                              {{ category.description }}
                            </p>
                          </div>
                        </NuxtLink>
                        
                        <!-- 统计信息 -->
                        <NuxtLink :to="`/categories/${category.slug}`" class="col-span-1 md:col-span-2 flex items-center justify-center md:justify-start">
                          <div class="text-center md:text-left">
                            <div class="text-2xl sm:text-3xl font-black text-[#FF4D94] mb-1">{{ category.postCount }}</div>
                            <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">主题</div>
                          </div>
                        </NuxtLink>
                        
                        <!-- 最新动态 -->
                        <div class="col-span-1 md:col-span-5 flex items-center">
                          <div v-if="category.latestPost" class="flex-1 min-w-0">
                            <NuxtLink 
                              :to="`/blog/${category.latestPost.slug}`"
                              class="block group/post"
                            >
                              <div class="flex items-center gap-2 mb-1">
                                <div class="w-2 h-2 rounded-full bg-[#FF4D94] flex-shrink-0"></div>
                                <span class="text-xs sm:text-sm font-black text-gray-900 group-hover/post:text-[#FF4D94] transition-colors line-clamp-1">
                                  {{ category.latestPost.title }}
                                </span>
                              </div>
                              <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span class="font-bold">{{ category.latestPost.author_name }}</span>
                                <span>•</span>
                                <span class="flex items-center gap-1">
                                  <MessageCircle class="w-3 h-3" />
                                  {{ category.latestPost.commentCount }}
                                </span>
                                <span>•</span>
                                <span class="flex items-center gap-1">
                                  <Eye class="w-3 h-3" />
                                  {{ category.latestPost.view_count }}
                                </span>
                                <span>•</span>
                                <span class="font-medium">{{ formatDate(category.latestPost.published_at) }}</span>
                              </div>
                            </NuxtLink>
                          </div>
                          <div v-else class="text-xs sm:text-sm text-gray-400 font-medium">暂无主题</div>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
                
                <div v-else class="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                  <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle class="w-10 h-10 text-[#FF4D94]" />
                  </div>
                  <p class="text-gray-600 font-black text-lg">还没有板块</p>
                  <p class="text-sm text-gray-500 mt-2 font-bold">敬请期待更多精彩内容</p>
                </div>
              </div>

              
              <!-- Latest Comments Section -->
              <div v-if="homeData.recentComments.length > 0">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <MessageCircle class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-black text-gray-900 tracking-tight">最新回复</h2>
                      <p class="text-sm font-bold text-gray-500 uppercase tracking-wider">社区最新动态</p>
                    </div>
                  </div>
                </div>
                
                <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div class="divide-y divide-gray-100">
                    <NuxtLink 
                      v-for="comment in homeData.recentComments.slice(0, 5)" 
                      :key="comment.id"
                      :to="`/blog/${comment.posts?.slug}`"
                      class="block p-5 hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group"
                    >
                      <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white text-sm font-black shadow-md">
                          {{ comment.author_name?.charAt(0) || '?' }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-black text-gray-900">{{ comment.author_name || '匿名' }}</span>
                            <span class="text-xs text-gray-400">•</span>
                            <span class="text-xs font-bold text-gray-500">{{ formatDate(comment.created_at) }}</span>
                          </div>
                          <p class="text-sm text-gray-700 line-clamp-2 mb-2 leading-relaxed group-hover:text-[#FF4D94] transition-colors">
                            {{ comment.content }}
                          </p>
                          <div class="flex items-center gap-2 text-xs font-bold text-[#7C4DFF]">
                            <FileText class="w-3 h-3" />
                            <span class="line-clamp-1">{{ comment.posts?.title }}</span>
                          </div>
                        </div>
                      </div>
                    </NuxtLink>
                  </div>
                  <div class="p-4 bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-t border-gray-100">
                    <NuxtLink 
                      to="/blog"
                      class="flex items-center justify-center gap-2 text-sm text-[#FF4D94] hover:text-[#7C4DFF] font-black uppercase tracking-wider group"
                    >
                      查看更多回复
                      <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
              
              <!-- Popular Tags Section -->
              <div v-if="homeData.tags.length > 0">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Target class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 class="text-2xl font-black text-gray-900 tracking-tight">热门标签</h2>
                      <p class="text-sm font-bold text-gray-500 uppercase tracking-wider">发现热门话题</p>
                    </div>
                  </div>
                  <NuxtLink 
                    to="/tags"
                    class="text-[#FF4D94] hover:text-[#7C4DFF] text-sm font-black flex items-center gap-2 uppercase tracking-wider group"
                  >
                    查看全部
                    <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </NuxtLink>
                </div>
                
                <div class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div class="flex flex-wrap gap-3">
                    <NuxtLink
                      v-for="tag in homeData.tags"
                      :key="tag.id"
                      :to="`/tags/${tag.slug}`"
                      class="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/10 hover:from-[#FF4D94] hover:to-[#7C4DFF] rounded-2xl border border-[#FF4D94]/20 hover:border-[#FF4D94] transition-all"
                    >
                      <span class="text-sm font-black text-gray-700 group-hover:text-white transition-colors">
                        {{ tag.name }}
                      </span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            
            <!-- Right Column - Sidebar -->
            <div class="lg:col-span-4 space-y-6">
              <!-- Hot Posts -->
              <div v-if="homeData.hotPosts.length > 0" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <TrendingUp class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="font-black text-gray-900 text-lg">热门主题</h3>
                </div>
                <div class="space-y-4">
                  <NuxtLink 
                    v-for="(post, index) in homeData.hotPosts" 
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
                            <span>{{ post.view_count }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NuxtLink>
                </div>
              </div>
              
              <!-- Recent Posts -->
              <div v-if="homeData.recentPosts.length > 0" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                    <Clock class="w-5 h-5 text-white" />
                  </div>
                  <h3 class="font-black text-gray-900 text-lg">最新主题</h3>
                </div>
                <div class="space-y-4">
                  <NuxtLink 
                    v-for="post in homeData.recentPosts" 
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
