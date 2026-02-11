<script setup lang="ts">
import { 
  Plus, 
  FileText, 
  Eye, 
  MessageSquare, 
  Users, 
  ArrowRight, 
  FolderOpen, 
  Tag,
  AlertCircle,
  Clock,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  XCircle,
  User,
  Image as ImageIcon
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard'
})

const client = useSupabaseClient()
const { user, profile } = useAuth()
const { formatDate } = useUtils()

// 超级管理员逻辑
const isSuperAdmin = computed(() => {
  return profile.value?.role === 'admin'
})

const { data: dashboardData, refresh } = await useAsyncData('dashboard-overview', async () => {
  if (!user.value) return null

  // 1. 基础统计
  let postsCountQuery = client.from('posts').select('*', { count: 'exact', head: true })
  let commentsCountQuery = client.from('comments').select('*', { count: 'exact', head: true })
  let viewsQuery = client.from('posts').select('view_count')

  if (!isSuperAdmin.value) {
    postsCountQuery = postsCountQuery.eq('author_id', user.value.id)
    commentsCountQuery = commentsCountQuery.eq('posts.author_id', user.value.id)
    viewsQuery = viewsQuery.eq('author_id', user.value.id)
  }

  const [
    { count: totalPosts },
    { count: totalComments },
    { data: totalViews }
  ] = await Promise.all([
    postsCountQuery,
    commentsCountQuery,
    viewsQuery
  ])

  let totalUsers = 0
  if (isSuperAdmin.value) {
    const { count } = await client.from('profiles').select('*', { count: 'exact', head: true })
    totalUsers = count || 0
  }

  const viewCount = totalViews?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

  // 2. 最近文章
  let recentPostsQuery = client
    .from('posts')
    .select(`
      id, 
      title, 
      status, 
      review_status,
      updated_at, 
      view_count,
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .order('updated_at', { ascending: false })
    .limit(5)
  
  if (!isSuperAdmin.value) {
    recentPostsQuery = recentPostsQuery.eq('author_id', user.value.id)
  }
  
  const { data: recentPosts } = await recentPostsQuery

  // 3. 待审核内容 (仅限超级管理员)
  let pendingPosts = null
  let pendingComments = null

  if (isSuperAdmin.value) {
    const [{ data: pPosts }, { data: pComments }] = await Promise.all([
      client.from('posts').select(`
        id, title, status, review_status, created_at,
        profiles!posts_author_id_fkey(name, avatar_url)
      `).eq('review_status', 'pending').order('created_at', { ascending: false }).limit(5),
      client.from('comments').select(`
        id, content, author_name, created_at, post_id,
        posts!inner(title, slug)
      `).eq('status', 'pending').order('created_at', { ascending: false }).limit(5)
    ])
    pendingPosts = pPosts
    pendingComments = pComments
  }

  return {
    stats: {
      totalPosts: totalPosts || 0,
      totalViews: viewCount,
      totalComments: totalComments || 0,
      totalUsers: totalUsers || 0,
    },
    recentPosts: recentPosts || [],
    pendingPosts: pendingPosts || [],
    pendingComments: pendingComments || []
  }
})

const getStatusColor = (status: string, reviewStatus: string) => {
  if (reviewStatus === 'pending') return 'bg-orange-50 text-orange-600 border-orange-100'
  if (reviewStatus === 'rejected') return 'bg-red-50 text-red-600 border-red-100'
  if (status === 'published') return 'bg-green-50 text-green-600 border-green-100'
  return 'bg-gray-50 text-gray-600 border-gray-100'
}

const getStatusLabel = (status: string, reviewStatus: string) => {
  if (reviewStatus === 'pending') return '审核中'
  if (reviewStatus === 'rejected') return '已拒绝'
  if (status === 'published') return '已发布'
  return '草稿'
}

const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const showToast = (type: 'success' | 'error', message: string) => {
  toast.value = { type, message }
  setTimeout(() => toast.value = null, 3000)
}

const handleQuickReview = async (type: 'post' | 'comment', id: string, action: 'approve' | 'reject') => {
  try {
    const table = type === 'post' ? 'posts' : 'comments'
    const statusField = type === 'post' ? 'review_status' : 'status'
    const value = action === 'approve' ? 'approved' : 'rejected'

    const { error } = await client
      .from(table)
      .update({ [statusField]: value })
      .eq('id', id)

    if (error) throw error
    showToast('success', '操作成功')
    refresh()
  } catch (err: any) {
    showToast('error', err.message || '操作失败')
  }
}
</script>

<template>
  <div v-if="dashboardData" class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent mb-2 tracking-tight">
          欢迎回来，{{ profile?.name || user?.email?.split('@')[0] || '用户' }}
        </h1>
        <p class="text-gray-500 font-medium">查看数据统计和最新动态</p>
      </div>
      <NuxtLink
        to="/dashboard/posts/new"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-[24px] font-black hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-lg text-base"
      >
        <Plus class="w-5 h-5" />
        <span>新建文章</span>
      </NuxtLink>
    </div>

    <!-- Stats Grid -->
    <div :class="['grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm', isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3']">
      <div class="group relative overflow-hidden bg-white rounded-[32px] p-8 border border-gray-100 hover:shadow-2xl transition-all h-full">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-12 -translate-y-12"></div>
        <div class="relative flex flex-col h-full justify-between">
          <div class="flex items-center justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <FileText class="w-7 h-7 text-[#FF4D94]" />
            </div>
            <span class="px-4 py-1.5 bg-[#FF4D94]/5 text-[#FF4D94] text-[11px] font-black uppercase tracking-widest rounded-full border border-[#FF4D94]/10">文章</span>
          </div>
          <div>
            <div class="text-4xl font-black text-gray-900 mb-2">{{ dashboardData.stats.totalPosts }}</div>
            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">{{ isSuperAdmin ? '全站总计' : '我的创作' }}</div>
          </div>
        </div>
      </div>

      <div class="group relative overflow-hidden bg-white rounded-[32px] p-8 border border-gray-100 hover:shadow-2xl transition-all h-full">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-12 -translate-y-12"></div>
        <div class="relative flex flex-col h-full justify-between">
          <div class="flex items-center justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Eye class="w-7 h-7 text-[#7C4DFF]" />
            </div>
            <span class="px-4 py-1.5 bg-[#7C4DFF]/5 text-[#7C4DFF] text-[11px] font-black uppercase tracking-widest rounded-full border border-[#7C4DFF]/10">浏览</span>
          </div>
          <div>
            <div class="text-4xl font-black text-gray-900 mb-2">{{ dashboardData.stats.totalViews.toLocaleString() }}</div>
            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">累计阅读</div>
          </div>
        </div>
      </div>

      <div class="group relative overflow-hidden bg-white rounded-[32px] p-8 border border-gray-100 hover:shadow-2xl transition-all h-full">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-12 -translate-y-12"></div>
        <div class="relative flex flex-col h-full justify-between">
          <div class="flex items-center justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <MessageSquare class="w-7 h-7 text-[#FF4D94]" />
            </div>
            <span class="px-4 py-1.5 bg-[#FF4D94]/5 text-[#FF4D94] text-[11px] font-black uppercase tracking-widest rounded-full border border-[#FF4D94]/10">评论</span>
          </div>
          <div>
            <div class="text-4xl font-black text-gray-900 mb-2">{{ dashboardData.stats.totalComments }}</div>
            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">互动探讨</div>
          </div>
        </div>
      </div>

      <div v-if="isSuperAdmin" class="group relative overflow-hidden bg-white rounded-[32px] p-8 border border-gray-100 hover:shadow-2xl transition-all h-full">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-12 -translate-y-12"></div>
        <div class="relative flex flex-col h-full justify-between">
          <div class="flex items-center justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Users class="w-7 h-7 text-[#7C4DFF]" />
            </div>
            <span class="px-4 py-1.5 bg-[#7C4DFF]/5 text-[#7C4DFF] text-[11px] font-black uppercase tracking-widest rounded-full border border-[#7C4DFF]/10">用户</span>
          </div>
          <div>
            <div class="text-4xl font-black text-gray-900 mb-2">{{ dashboardData.stats.totalUsers }}</div>
            <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">社区规模</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Sections -->
    <div v-if="isSuperAdmin" class="space-y-8">
      <div v-if="dashboardData.pendingPosts?.length > 0" class="bg-white rounded-[40px] border border-orange-100 shadow-xl overflow-hidden">
        <div class="p-8 border-b border-orange-50 bg-gradient-to-r from-orange-50/50 to-amber-50/50 flex items-center justify-between">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
               <AlertCircle class="w-6 h-6" />
             </div>
             <div>
                <h2 class="text-2xl font-black text-gray-900">待审核文章</h2>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Awaiting Review</p>
             </div>
          </div>
          <NuxtLink to="/dashboard/posts" class="text-sm font-black text-orange-600 flex items-center gap-2">
            查看全部 <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div class="divide-y divide-gray-50">
           <div v-for="post in dashboardData.pendingPosts" :key="post.id" class="p-6 hover:bg-orange-50/20 transition-all flex items-center justify-between group">
              <div class="flex-1 min-w-0 mr-8">
                 <h3 class="font-black text-lg text-gray-900 mb-2 truncate">{{ post.title }}</h3>
                 <div class="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <span>{{ formatDate(post.created_at) }}</span>
                    <span class="text-gray-900">{{ post.profiles?.name || '匿名' }}</span>
                 </div>
              </div>
              <div class="flex items-center gap-3">
                 <button @click="handleQuickReview('post', post.id, 'approve')" class="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg"><CheckCircle class="w-5 h-5" /></button>
                 <button @click="handleQuickReview('post', post.id, 'reject')" class="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg"><XCircle class="w-5 h-5" /></button>
              </div>
           </div>
        </div>
      </div>

      <div v-if="dashboardData.pendingComments?.length > 0" class="bg-white rounded-[40px] border border-blue-100 shadow-xl overflow-hidden">
        <div class="p-8 border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex items-center justify-between">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
               <MessageCircle class="w-6 h-6" />
             </div>
             <div>
                <h2 class="text-2xl font-black text-gray-900">待审核评论</h2>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Pending Comments</p>
             </div>
          </div>
          <NuxtLink to="/dashboard/comments" class="text-sm font-black text-blue-600 flex items-center gap-2">
            查看全部 <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div class="divide-y divide-gray-50">
           <div v-for="comment in dashboardData.pendingComments" :key="comment.id" class="p-6 hover:bg-blue-50/20 transition-all flex items-center justify-between group">
              <div class="flex-1 min-w-0 mr-8">
                 <div class="flex items-center gap-2 mb-2">
                    <span class="font-black text-gray-900">{{ comment.author_name }}</span>
                    <span class="text-xs text-[#FF4D94] font-black">{{ comment.posts?.title }}</span>
                 </div>
                 <p class="text-sm text-gray-600 truncate italic">"{{ comment.content }}"</p>
              </div>
              <div class="flex items-center gap-3">
                 <button @click="handleQuickReview('comment', comment.id, 'approve')" class="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg"><CheckCircle class="w-5 h-5" /></button>
                 <button @click="handleQuickReview('comment', comment.id, 'reject')" class="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg"><XCircle class="w-5 h-5" /></button>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Bottom Grids -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
          <div class="p-8 border-b border-gray-50 flex items-center justify-between">
             <h2 class="text-2xl font-black text-gray-900">最近动态</h2>
             <NuxtLink to="/dashboard/posts" class="text-sm font-bold text-brand-pink">查看管理</NuxtLink>
          </div>
          <div class="divide-y divide-gray-50 text-sm">
             <div v-for="post in dashboardData.recentPosts" :key="post.id" class="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-all">
                <div class="flex-1 min-w-0 mr-8">
                   <h3 class="font-black text-lg text-gray-900 truncate mb-1">{{ post.title }}</h3>
                   <div class="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span :class="['px-2 py-0.5 rounded-lg border font-bold', getStatusColor(post.status, post.review_status)]">
                        {{ getStatusLabel(post.status, post.review_status) }}
                      </span>
                      <span>{{ formatDate(post.updated_at) }}</span>
                      <span>{{ post.view_count }} 浏览</span>
                   </div>
                </div>
                <NuxtLink :to="`/dashboard/posts/${post.id}/edit`" class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 hover:text-brand-pink transition-all">
                   <ArrowRight class="w-5 h-5" />
                </NuxtLink>
             </div>
          </div>
      </div>

      <!-- Quick Shortcuts -->
      <div v-if="isSuperAdmin" class="space-y-6">
         <NuxtLink to="/dashboard/categories" class="block p-6 bg-white border border-gray-100 rounded-[32px] hover:shadow-xl transition-all">
            <div class="flex items-center gap-4 mb-2">
               <div class="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-brand-pink">
                  <FolderOpen class="w-6 h-6" />
               </div>
               <h3 class="font-black text-gray-900">内容分类</h3>
            </div>
            <p class="text-xs font-medium text-gray-500">组织和规划您的文章主题</p>
         </NuxtLink>
         <NuxtLink to="/dashboard/tags" class="block p-6 bg-white border border-gray-100 rounded-[32px] hover:shadow-xl transition-all">
            <div class="flex items-center gap-4 mb-2">
               <div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-brand-purple">
                  <Tag class="w-6 h-6" />
               </div>
               <h3 class="font-black text-gray-900">标签系统</h3>
            </div>
            <p class="text-xs font-medium text-gray-500">细化内容索引，方便检索</p>
         </NuxtLink>
         <NuxtLink to="/dashboard/media" class="block p-8 bg-gradient-to-br from-brand-pink to-brand-purple text-white rounded-[32px] shadow-xl hover:scale-105 transition-all">
            <div class="flex items-center justify-between mb-4">
               <ImageIcon class="w-8 h-8 opacity-50" />
               <ArrowRight class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-black mb-1">媒体资料库</h3>
            <p class="text-sm font-medium text-white/70">集中管理您的图片及资源</p>
         </NuxtLink>
      </div>
    </div>

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div v-if="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
        <div class="px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border"
          :class="toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'">
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4" />
          <XCircle v-else class="w-4 h-4" />
          <span class="text-sm font-black">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
