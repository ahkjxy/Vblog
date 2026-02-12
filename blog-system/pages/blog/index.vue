<script setup lang="ts">
import {
  MessageCircle, ArrowRight, Eye, User, Clock, TrendingUp, Flame, 
  ChevronLeft, ChevronRight, Search, SortDesc, Award, PenSquare, X, Sparkles, Zap
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const POSTS_PER_PAGE = 10

// 使用 computed 来响应 URL 变化
const currentPage = computed(() => Number(route.query.page) || 1)
const selectedCategory = computed(() => (route.query.category as string) || 'all')
const searchQuery = computed(() => (route.query.search as string) || '')
const sortBy = computed(() => (route.query.sort as string) || 'latest')

const localSearch = ref(searchQuery.value)
const isNavigating = ref(false)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 获取所有分类（使用公共数据 Composable）
const commonData = useCommonData()
const { data: categories } = await useAsyncData('forum-categories', async () => {
  return await commonData.fetchCategories()
})

// 获取总文章数
const { data: totalStats } = await useAsyncData('forum-total-stats', async () => {
  const client = useSupabaseClient()
  const { count } = await client
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .eq('review_status', 'approved')
  return { totalPosts: count || 0 }
})

// 获取侧边栏数据（使用公共数据 Composable，只请求一次）
const { data: sidebarData } = await useAsyncData('forum-sidebar', async () => {
  const hotPosts = await commonData.fetchHotPosts(false, 8)
  const recentPosts = await commonData.fetchRecentPosts(false, 8)

  return {
    hotPosts,
    recentPosts
  }
})

// 获取论坛列表数据（会根据筛选条件刷新）
const { data: forumData, pending } = await useAsyncData(
  () => `forum-posts-${currentPage.value}-${selectedCategory.value}-${sortBy.value}-${searchQuery.value}`,
  async () => {
    const client = useSupabaseClient()
    const offset = (currentPage.value - 1) * POSTS_PER_PAGE

    let postIds: string[] = []
    if (selectedCategory.value && selectedCategory.value !== 'all') {
      const { data: postCategories } = await client
        .from('post_categories')
        .select('post_id')
        .eq('category_id', selectedCategory.value)
      
      postIds = postCategories?.map((pc: any) => pc.post_id) || []
      
      if (postIds.length === 0) {
        return {
          posts: [],
          totalCount: 0,
          totalPages: 0
        }
      }
    }

    let query = client
      .from('posts')
      .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name, avatar_url), post_categories(categories(name, slug))', { count: 'exact' })
      .eq('status', 'published')
      .eq('review_status', 'approved')

    if (postIds.length > 0) {
      query = query.in('id', postIds)
    }

    if (searchQuery.value) {
      query = query.or(`title.ilike.%${searchQuery.value}%,excerpt.ilike.%${searchQuery.value}%`)
    }

    if (sortBy.value === 'hot') {
      query = query.order('view_count', { ascending: false })
    } else if (sortBy.value === 'comments') {
      query = query.order('published_at', { ascending: false })
    } else {
      query = query.order('published_at', { ascending: false })
    }

    const { data: posts, count: totalCount } = await query
      .range(offset, offset + POSTS_PER_PAGE - 1)

    // 优化：一次性获取所有文章的评论数
    const postIdsToFetch = posts?.map((post: any) => post.id) || []
    const { data: allComments } = await client
      .from('comments')
      .select('post_id')
      .in('post_id', postIdsToFetch)
      .eq('status', 'approved')
    
    // 构建评论数映射
    const commentCountMap: Record<string, number> = {}
    allComments?.forEach((comment: any) => {
      commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1
    })

    const postsWithComments = posts?.map((post: any) => {
      const mainCategory = post.post_categories?.[0]?.categories || null
      
      return { 
        ...post, 
        commentCount: commentCountMap[post.id] || 0,
        mainCategory
      }
    }) || []

    if (sortBy.value === 'comments') {
      postsWithComments.sort((a, b) => b.commentCount - a.commentCount)
    }

    return {
      posts: postsWithComments,
      totalCount: totalCount || 0,
      totalPages: Math.ceil((totalCount || 0) / POSTS_PER_PAGE)
    }
  },
  {
    watch: [currentPage, selectedCategory, sortBy, searchQuery]
  }
)

const switchCategory = (categoryId: string) => {
  isNavigating.value = true
  const query: any = { category: categoryId, page: 1 }
  if (sortBy.value !== 'latest') query.sort = sortBy.value
  if (searchQuery.value) query.search = searchQuery.value
  router.push({ path: '/blog', query })
}

const switchSort = (sort: string) => {
  isNavigating.value = true
  const query: any = { sort, page: 1 }
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (searchQuery.value) query.search = searchQuery.value
  router.push({ path: '/blog', query })
}

const handleSearch = () => {
  if (!localSearch.value.trim()) return
  isNavigating.value = true
  const query: any = { search: localSearch.value, page: 1 }
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (sortBy.value !== 'latest') query.sort = sortBy.value
  router.push({ path: '/blog', query })
}

const clearSearch = () => {
  localSearch.value = ''
  isNavigating.value = true
  const query: any = { page: 1 }
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (sortBy.value !== 'latest') query.sort = sortBy.value
  router.push({ path: '/blog', query })
}

// 监听路由变化，重置加载状态
watch(() => route.fullPath, () => {
  isNavigating.value = false
})

useSeoMeta({
  title: '社区讨论',
  description: '浏览元气银行社区的所有讨论主题，家长们分享的家庭教育经验、积分管理技巧、习惯养成心得。',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Forum Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-gray-900 mb-2">社区讨论板</h1>
              <p class="text-sm text-gray-600 font-medium">
                共 <span class="font-black text-[#FF4D94]">{{ totalStats?.totalPosts || 0 }}</span> 个讨论主题
              </p>
            </div>
            
            <!-- 发布新主题按钮 - 移到顶部 -->
            <a 
              href="/blog/new"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-black text-sm whitespace-nowrap"
            >
              <PenSquare class="w-5 h-5" />
              发布新主题
            </a>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <div class="relative flex-1">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="localSearch"
                type="text"
                placeholder="搜索讨论主题..."
                class="w-full pl-11 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#FF4D94] focus:outline-none transition-all text-sm font-medium"
                @keyup.enter="handleSearch"
              />
              <!-- 清除搜索按钮 -->
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#FF4D94] bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                清除
              </button>
            </div>
            
            <!-- 搜索结果提示 -->
            <div v-if="searchQuery" class="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <span class="text-sm font-bold text-blue-700">
                搜索: "{{ searchQuery }}"
              </span>
              <button
                @click="clearSearch"
                class="text-blue-600 hover:text-blue-800"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              @click="switchCategory('all')"
              :class="[
                'flex-shrink-0 px-5 py-2.5 rounded-xl font-black text-sm transition-all',
                selectedCategory === 'all' || isNavigating
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span>全部</span>
              <span class="ml-2 opacity-75">({{ totalStats?.totalPosts || 0 }})</span>
            </button>
            
            <button
              v-for="category in categories"
              :key="category.id"
              @click="switchCategory(category.id)"
              :class="[
                'flex-shrink-0 px-5 py-2.5 rounded-xl font-black text-sm transition-all relative',
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <span>{{ category.name }}</span>
              <span class="ml-2 opacity-75">({{ category.postCount }})</span>
              <span v-if="isNavigating && selectedCategory === category.id" class="absolute -top-1 -right-1 w-3 h-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Column - Forum List -->
        <div class="lg:col-span-8">
          <!-- Sort Bar -->
          <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <SortDesc class="w-5 h-5 text-gray-400" />
              <span class="text-sm font-black text-gray-500 uppercase tracking-wider">排序</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                @click="switchSort('latest')"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all relative',
                  sortBy === 'latest'
                    ? 'bg-[#FF4D94] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <Clock class="w-4 h-4 inline mr-1" />
                最新
                <span v-if="isNavigating && sortBy === 'latest'" class="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
              </button>
              
              <button
                @click="switchSort('hot')"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all relative',
                  sortBy === 'hot'
                    ? 'bg-[#FF4D94] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <Flame class="w-4 h-4 inline mr-1" />
                最热
                <span v-if="isNavigating && sortBy === 'hot'" class="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
              </button>
              
              <button
                @click="switchSort('comments')"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all relative',
                  sortBy === 'comments'
                    ? 'bg-[#FF4D94] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <MessageCircle class="w-4 h-4 inline mr-1" />
                评论
                <span v-if="isNavigating && sortBy === 'comments'" class="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
              </button>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="pending" class="space-y-3">
            <div v-for="i in 10" :key="i" class="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div class="flex gap-4">
                <!-- Avatar Skeleton -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-xl bg-gray-200"></div>
                </div>
                
                <!-- Content Skeleton -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start gap-3 mb-3">
                    <div class="flex-1 h-6 bg-gray-200 rounded-lg"></div>
                    <div class="w-20 h-6 bg-gray-200 rounded-lg"></div>
                  </div>
                  
                  <div class="space-y-2 mb-3">
                    <div class="h-4 bg-gray-200 rounded w-full"></div>
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  
                  <div class="flex gap-4">
                    <div class="h-3 w-20 bg-gray-200 rounded"></div>
                    <div class="h-3 w-20 bg-gray-200 rounded"></div>
                    <div class="h-3 w-16 bg-gray-200 rounded"></div>
                    <div class="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Forum List -->
          <template v-else-if="forumData">
            <div v-if="forumData.posts.length > 0" class="space-y-3">
              <NuxtLink 
                v-for="post in forumData.posts" 
                :key="post.id"
                :to="`/blog/${post.slug}`"
                class="block group"
              >
                <div class="bg-white rounded-2xl border border-gray-200 hover:border-[#FF4D94]/30 hover:shadow-lg transition-all p-5">
                  <div class="flex gap-4">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-[#FF4D94]/30 transition-all">
                        <img 
                          v-if="post.profiles?.avatar_url" 
                          :src="post.profiles.avatar_url" 
                          :alt="post.profiles.name"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center">
                          <User class="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start gap-3 mb-2">
                        <h2 class="flex-1 text-lg font-black text-gray-900 group-hover:text-[#FF4D94] transition-colors line-clamp-1">
                          {{ post.title }}
                        </h2>
                        <span v-if="post.mainCategory" class="flex-shrink-0 px-3 py-1 bg-[#7C4DFF]/10 text-[#7C4DFF] rounded-lg text-xs font-bold">
                          {{ post.mainCategory.name }}
                        </span>
                      </div>
                      
                      <p v-if="post.excerpt" class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {{ post.excerpt }}
                      </p>
                      
                      <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div class="flex items-center gap-1.5 font-bold">
                          <User class="w-3.5 h-3.5" />
                          <span>{{ post.profiles?.name || '匿名' }}</span>
                        </div>
                        
                        <span class="text-gray-300">•</span>
                        
                        <div class="flex items-center gap-1.5 font-bold">
                          <Clock class="w-3.5 h-3.5" />
                          <span>{{ formatDate(post.published_at) }}</span>
                        </div>
                        
                        <span class="text-gray-300">•</span>
                        
                        <div class="flex items-center gap-1.5 font-bold text-blue-600">
                          <Eye class="w-3.5 h-3.5" />
                          <span>{{ post.view_count || 0 }}</span>
                        </div>
                        
                        <span class="text-gray-300">•</span>
                        
                        <div class="flex items-center gap-1.5 font-bold text-green-600">
                          <MessageCircle class="w-3.5 h-3.5" />
                          <span>{{ post.commentCount || 0 }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="hidden sm:flex items-center">
                      <ArrowRight class="w-5 h-5 text-gray-300 group-hover:text-[#FF4D94] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Empty -->
            <div v-else class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle class="w-10 h-10 text-gray-400" />
              </div>
              <h3 class="text-xl font-black mb-2 text-gray-900">暂无讨论主题</h3>
              <p class="text-sm text-gray-600 mb-6">该分类下还没有内容</p>
              <a 
                href="/blog?category=all"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
              >
                查看全部主题
              </a>
            </div>

            <!-- Pagination -->
            <div v-if="forumData.posts.length > 0 && forumData.totalPages > 1" class="flex flex-wrap items-center justify-center gap-2 mt-8">
              <NuxtLink
                v-if="currentPage > 1"
                :to="{ path: '/blog', query: { ...route.query, page: currentPage - 1 } }"
                class="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold"
              >
                <ChevronLeft class="w-4 h-4" />
                <span class="hidden sm:inline">上一页</span>
              </NuxtLink>
              <div v-else class="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed">
                <ChevronLeft class="w-4 h-4" />
                <span class="hidden sm:inline">上一页</span>
              </div>
              
              <div class="flex items-center gap-1">
                <!-- 第一页 -->
                <NuxtLink
                  v-if="currentPage > 3"
                  :to="{ path: '/blog', query: { ...route.query, page: 1 } }"
                  class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  1
                </NuxtLink>
                
                <!-- 省略号 -->
                <span v-if="currentPage > 4" class="px-2 text-gray-400">...</span>
                
                <!-- 当前页前2页 -->
                <NuxtLink
                  v-if="currentPage > 2"
                  :to="{ path: '/blog', query: { ...route.query, page: currentPage - 2 } }"
                  class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {{ currentPage - 2 }}
                </NuxtLink>
                
                <!-- 当前页前1页 -->
                <NuxtLink
                  v-if="currentPage > 1"
                  :to="{ path: '/blog', query: { ...route.query, page: currentPage - 1 } }"
                  class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {{ currentPage - 1 }}
                </NuxtLink>
                
                <!-- 当前页 -->
                <div class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg">
                  {{ currentPage }}
                </div>
                
                <!-- 当前页后1页 -->
                <NuxtLink
                  v-if="currentPage < forumData.totalPages"
                  :to="{ path: '/blog', query: { ...route.query, page: currentPage + 1 } }"
                  class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {{ currentPage + 1 }}
                </NuxtLink>
                
                <!-- 当前页后2页 -->
                <NuxtLink
                  v-if="currentPage < forumData.totalPages - 1"
                  :to="{ path: '/blog', query: { ...route.query, page: currentPage + 2 } }"
                  class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {{ currentPage + 2 }}
                </NuxtLink>
                
                <!-- 省略号 -->
                <span v-if="currentPage < forumData.totalPages - 3" class="px-2 text-gray-400">...</span>
                
                <!-- 最后一页 -->
                <NuxtLink
                  v-if="currentPage < forumData.totalPages - 2"
                  :to="{ path: '/blog', query: { ...route.query, page: forumData.totalPages } }"
                  class="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  {{ forumData.totalPages }}
                </NuxtLink>
              </div>
              
              <NuxtLink
                v-if="currentPage < forumData.totalPages"
                :to="{ path: '/blog', query: { ...route.query, page: currentPage + 1 } }"
                class="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold"
              >
                <span class="hidden sm:inline">下一页</span>
                <ChevronRight class="w-4 h-4" />
              </NuxtLink>
              <div v-else class="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed">
                <span class="hidden sm:inline">下一页</span>
                <ChevronRight class="w-4 h-4" />
              </div>
            </div>
          </template>
        </div>

        <!-- Right Sidebar -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Loading Skeleton for Sidebar (only on initial load) -->
          <template v-if="!sidebarData">
            <!-- App Promo Skeleton -->
            <div class="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 animate-pulse">
              <div class="h-6 w-32 bg-white/30 rounded mb-4"></div>
              <div class="h-32 bg-white/30 rounded-xl mb-4"></div>
              <div class="h-12 bg-white/30 rounded-xl"></div>
            </div>
            
            <!-- Hot Posts Skeleton -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-gray-200"></div>
                <div class="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div class="space-y-4">
                <div v-for="i in 5" :key="i" class="flex gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-200"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-full"></div>
                    <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div class="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Recent Posts Skeleton -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-gray-200"></div>
                <div class="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div class="space-y-4">
                <div v-for="i in 5" :key="i" class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <!-- Stats Skeleton -->
            <div class="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 animate-pulse">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-white/30"></div>
                <div class="h-6 w-24 bg-white/30 rounded"></div>
              </div>
              <div class="space-y-4 mb-6">
                <div class="flex items-center justify-between">
                  <div class="h-4 w-20 bg-white/30 rounded"></div>
                  <div class="h-8 w-16 bg-white/30 rounded"></div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="h-4 w-20 bg-white/30 rounded"></div>
                  <div class="h-8 w-16 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
          </template>

          <!-- Actual Sidebar Content -->
          <template v-else>
            <!-- App Promotion Card -->
            <div class="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-3">
                  <Sparkles class="w-5 h-5 text-yellow-300" />
                  <span class="text-sm font-black uppercase tracking-wider">推荐应用</span>
                </div>
                <h3 class="font-black text-xl mb-2">元气银行</h3>
                <p class="text-sm text-white/90 mb-4 leading-relaxed font-medium">
                  家庭积分管理系统，培养孩子好习惯，让家庭教育更科学有趣
                </p>
                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span class="font-medium">积分任务管理</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span class="font-medium">习惯养成追踪</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <span class="font-medium">家庭成员协作</span>
                  </div>
                </div>
                <a 
                  href="https://www.familybank.chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#FF4D94] rounded-xl hover:bg-white/90 transition-all font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  <Zap class="w-4 h-4" />
                  立即体验
                  <ArrowRight class="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <!-- Hot Posts -->
            <div v-if="sidebarData?.hotPosts && sidebarData.hotPosts.length > 0" class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Flame class="w-5 h-5 text-white" />
              </div>
              <h3 class="font-black text-gray-900 text-lg">热门主题</h3>
            </div>
            <div class="space-y-4">
              <NuxtLink 
                v-for="(post, index) in sidebarData.hotPosts" 
                :key="post.id" 
                :to="`/blog/${post.slug}`"
                class="block group"
              >
                <div class="flex gap-3">
                  <div 
                    :class="[
                      'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black',
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
                    <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Eye class="w-3 h-3" />
                      <span>{{ post.view_count || 0 }}</span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
          
          <!-- Recent Posts -->
          <div v-if="sidebarData?.recentPosts && sidebarData.recentPosts.length > 0" class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Clock class="w-5 h-5 text-white" />
              </div>
              <h3 class="font-black text-gray-900 text-lg">最新主题</h3>
            </div>
            <div class="space-y-4">
              <NuxtLink 
                v-for="post in sidebarData.recentPosts" 
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
          </div>

          <!-- Google Ad -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">广告</div>
            <BannerAd />
          </div>

          <!-- Post Stats -->
          <div class="bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-2xl p-6 text-white">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Award class="w-5 h-5 text-white" />
              </div>
              <h3 class="font-black text-lg">社区统计</h3>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-white/80">讨论主题</span>
                <span class="text-2xl font-black">{{ totalStats?.totalPosts || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-white/80">分类数量</span>
                <span class="text-2xl font-black">{{ categories?.length || 0 }}</span>
              </div>
            </div>
          </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Skeleton Loading Animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Enhanced skeleton with shimmer effect */
.animate-pulse > * {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
</style>
