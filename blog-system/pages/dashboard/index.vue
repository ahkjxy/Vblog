<script setup lang="ts">
import {
  FileText, Eye, MessageSquare, Users, Plus, ArrowRight,
  FolderOpen, Tag, AlertCircle, Clock
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatAuthorName = (profile: any) => {
  return profile?.name ? `${profile.name}的家庭` : '匿名家庭'
}

// 快捷审核文章
const approving = ref<string | null>(null)
const rejecting = ref<string | null>(null)

const quickApprove = async (postId: string) => {
  approving.value = postId
  try {
    await client
      .from('posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        review_status: 'approved',
        reviewed_by: user.value!.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', postId)
    
    // 刷新数据
    refreshNuxtData('dashboard-data')
  } catch (error) {
    console.error('审核失败:', error)
  } finally {
    approving.value = null
  }
}

const quickReject = async (postId: string) => {
  rejecting.value = postId
  try {
    await client
      .from('posts')
      .update({
        review_status: 'rejected',
        reviewed_by: user.value!.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', postId)
    
    // 刷新数据
    refreshNuxtData('dashboard-data')
  } catch (error) {
    console.error('拒绝失败:', error)
  } finally {
    rejecting.value = null
  }
}

// 获取用户信息和数据
const { data: dashboardData } = await useAsyncData('dashboard-data', async () => {
  if (!user.value) return null

  // 获取用户 profile
  const { data: profile } = await client
    .from('profiles')
    .select('name, role, family_id')
    .eq('id', user.value.id)
    .single()

  // 检查是否是超级管理员
  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === SUPER_ADMIN_FAMILY_ID

  // 构建统计查询
  let postsCountQuery = client.from('posts').select('*', { count: 'exact', head: true })
  let commentsCountQuery = client.from('comments').select('*', { count: 'exact', head: true })
  let viewsQuery = client.from('posts').select('view_count')

  // 如果不是超级管理员，只统计自己的数据
  if (!isSuperAdmin) {
    postsCountQuery = postsCountQuery.eq('author_id', user.value.id)
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

  // 用户数统计：只有超级管理员才显示
  let totalUsers = 0
  if (isSuperAdmin) {
    const { count } = await client.from('profiles').select('*', { count: 'exact', head: true })
    totalUsers = count || 0
  }

  const viewCount = totalViews?.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0) || 0

  // 获取最近文章
  let recentPostsQuery = client
    .from('posts')
    .select('id, title, status, review_status, updated_at, view_count, profiles!posts_author_id_fkey(name, avatar_url)')
    .order('updated_at', { ascending: false })
    .limit(5)

  if (!isSuperAdmin) {
    recentPostsQuery = recentPostsQuery.eq('author_id', user.value.id)
  }

  const { data: recentPosts } = await recentPostsQuery

  // 获取待审核文章（仅超级管理员）
  let pendingPosts = null
  if (isSuperAdmin) {
    const { data } = await client
      .from('posts')
      .select('id, title, status, review_status, created_at, profiles!posts_author_id_fkey(name, avatar_url)')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
    pendingPosts = data
  }

  return {
    profile,
    isSuperAdmin,
    stats: {
      totalPosts: totalPosts || 0,
      totalViews: viewCount,
      totalComments: totalComments || 0,
      totalUsers
    },
    recentPosts: recentPosts || [],
    pendingPosts
  }
})

useSeoMeta({
  title: 'Dashboard'
})
</script>

<template>
  <div v-if="dashboardData" class="space-y-6 sm:space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent mb-2 tracking-tight">
          欢迎回来，{{ dashboardData.profile?.name + '的家庭' || user?.email?.split('@')[0] || '用户' }}
        </h1>
        <p class="text-sm sm:text-base text-gray-600 font-medium">查看数据统计和最新动态</p>
      </div>
      <NuxtLink
        to="/dashboard/posts/new"
        class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
      >
        <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>新建文章</span>
      </NuxtLink>
    </div>

    <!-- Stats Grid -->
    <div :class="['grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6', dashboardData.isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3']">
      <div class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#FF4D94]/30 transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText class="w-6 h-6 text-[#FF4D94]" />
            </div>
            <span class="text-xs font-black text-[#FF4D94] bg-[#FF4D94]/10 px-3 py-1 rounded-full uppercase tracking-wider">文章</span>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{{ dashboardData.stats.totalPosts }}</div>
          <div class="text-xs sm:text-sm text-gray-600 font-bold">{{ dashboardData.isSuperAdmin ? '总文章数' : '我的文章' }}</div>
        </div>
      </div>

      <div class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#7C4DFF]/30 transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Eye class="w-6 h-6 text-[#7C4DFF]" />
            </div>
            <span class="text-xs font-black text-[#7C4DFF] bg-[#7C4DFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">浏览</span>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{{ dashboardData.stats.totalViews.toLocaleString() }}</div>
          <div class="text-xs sm:text-sm text-gray-600 font-bold">{{ dashboardData.isSuperAdmin ? '总浏览量' : '我的浏览量' }}</div>
        </div>
      </div>

      <div class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#FF4D94]/30 transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare class="w-6 h-6 text-[#FF4D94]" />
            </div>
            <span class="text-xs font-black text-[#FF4D94] bg-[#FF4D94]/10 px-3 py-1 rounded-full uppercase tracking-wider">评论</span>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{{ dashboardData.stats.totalComments }}</div>
          <div class="text-xs sm:text-sm text-gray-600 font-bold">{{ dashboardData.isSuperAdmin ? '总评论数' : '我的评论数' }}</div>
        </div>
      </div>

      <div v-if="dashboardData.isSuperAdmin" class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#7C4DFF]/30 transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users class="w-6 h-6 text-[#7C4DFF]" />
            </div>
            <span class="text-xs font-black text-[#7C4DFF] bg-[#7C4DFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">用户</span>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-gray-900 mb-1">{{ dashboardData.stats.totalUsers }}</div>
          <div class="text-xs sm:text-sm text-gray-600 font-bold">注册用户</div>
        </div>
      </div>
    </div>

    <!-- Pending Posts - 只有超级管理员才显示 -->
    <div v-if="dashboardData.isSuperAdmin && dashboardData.pendingPosts && dashboardData.pendingPosts.length > 0" class="bg-white rounded-3xl border border-orange-200 shadow-lg overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
            <AlertCircle class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-gray-900">待审核文章</h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium">需要您审核的草稿文章</p>
          </div>
        </div>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-for="post in dashboardData.pendingPosts"
          :key="post.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 hover:bg-orange-50/50 transition-all group"
        >
          <div class="flex-1 min-w-0">
            <h3 class="font-black text-base sm:text-lg text-gray-900 mb-2 line-clamp-2">
              {{ post.title }}
            </h3>
            <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span class="font-black text-[#FF4D94]">
                {{ formatAuthorName(post.profiles) }}
              </span>
              <span class="flex items-center gap-1 font-medium">
                <Clock class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {{ formatDate(post.created_at) }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              @click="quickApprove(post.id)"
              :disabled="approving === post.id || rejecting === post.id"
              class="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-all text-sm"
            >
              {{ approving === post.id ? '审核中...' : '通过' }}
            </button>
            <button
              @click="quickReject(post.id)"
              :disabled="approving === post.id || rejecting === post.id"
              class="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all text-sm"
            >
              {{ rejecting === post.id ? '处理中...' : '拒绝' }}
            </button>
            <NuxtLink 
              :to="`/dashboard/posts/${post.id}/edit`"
              class="px-4 py-2 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
            >
              查看
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Posts -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
      <div class="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-gray-900 mb-1">最近文章</h2>
            <p class="text-xs sm:text-sm text-gray-600 font-medium">{{ dashboardData.isSuperAdmin ? '最近发布的内容' : '您最近发布的内容' }}</p>
          </div>
          <NuxtLink
            to="/dashboard/posts"
            class="flex items-center gap-2 text-xs sm:text-sm font-black text-[#FF4D94] hover:text-[#7C4DFF] transition-colors"
          >
            查看全部
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-if="dashboardData.recentPosts.length > 0"
          v-for="post in dashboardData.recentPosts"
          :key="post.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group"
        >
          <NuxtLink
            :to="`/dashboard/posts/${post.id}/edit`"
            class="flex-1 min-w-0"
          >
            <h3 class="font-black text-base sm:text-lg text-gray-900 mb-2 group-hover:text-[#FF4D94] transition-colors line-clamp-2">
              {{ post.title }}
            </h3>
            <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span class="font-black text-[#FF4D94]">
                {{ formatAuthorName(post.profiles) }}
              </span>
              <span :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold',
                post.status === 'published' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              ]">
                <span :class="['w-1.5 h-1.5 rounded-full', post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500']"></span>
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
              <span v-if="post.review_status" :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold',
                post.review_status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                post.review_status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-orange-50 text-orange-700 border border-orange-200'
              ]">
                {{ post.review_status === 'approved' ? '✓ 已审核' : post.review_status === 'rejected' ? '✗ 已拒绝' : '⏱ 待审核' }}
              </span>
              <span class="flex items-center gap-1 font-medium">
                <Eye class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {{ post.view_count }} 浏览
              </span>
              <span class="font-medium">{{ formatDate(post.updated_at) }}</span>
            </div>
          </NuxtLink>
          <NuxtLink :to="`/dashboard/posts/${post.id}/edit`">
            <ArrowRight class="w-5 h-5 text-gray-400 group-hover:text-[#FF4D94] group-hover:translate-x-1 transition-all" />
          </NuxtLink>
        </div>
        <div v-else class="p-12 text-center">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center mx-auto mb-4">
            <FileText class="w-8 h-8 text-[#FF4D94]" />
          </div>
          <p class="text-gray-600 font-bold">还没有文章，开始创作第一篇吧！</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions - 只有超级管理员才显示 -->
    <div v-if="dashboardData.isSuperAdmin" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <NuxtLink
        to="/dashboard/categories"
        class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#FF4D94]/30 transition-all"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FolderOpen class="w-6 h-6 text-[#FF4D94]" />
          </div>
          <h3 class="font-black text-lg text-gray-900 mb-2 group-hover:text-[#FF4D94] transition-colors">管理分类</h3>
          <p class="text-sm text-gray-600 mb-4 font-medium">组织和管理文章分类</p>
          <div class="flex items-center gap-2 text-sm font-black text-[#FF4D94]">
            <span>前往管理</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/tags"
        class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#7C4DFF]/30 transition-all"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Tag class="w-6 h-6 text-[#7C4DFF]" />
          </div>
          <h3 class="font-black text-lg text-gray-900 mb-2 group-hover:text-[#7C4DFF] transition-colors">管理标签</h3>
          <p class="text-sm text-gray-600 mb-4 font-medium">添加和编辑文章标签</p>
          <div class="flex items-center gap-2 text-sm font-black text-[#7C4DFF]">
            <span>前往管理</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/dashboard/comments"
        class="group relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:shadow-2xl hover:border-[#FF4D94]/30 transition-all"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare class="w-6 h-6 text-[#FF4D94]" />
          </div>
          <h3 class="font-black text-lg text-gray-900 mb-2 group-hover:text-[#FF4D94] transition-colors">管理评论</h3>
          <p class="text-sm text-gray-600 mb-4 font-medium">审核和回复用户评论</p>
          <div class="flex items-center gap-2 text-sm font-black text-[#FF4D94]">
            <span>前往管理</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
