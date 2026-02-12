<script setup lang="ts">
import { Plus, Search, Trash2, Eye, Edit, CheckCircle, XCircle, Clock } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  review_status?: 'pending' | 'approved' | 'rejected'
  author_id: string
  published_at: string | null
  view_count: number
  created_at: string
  profiles: {
    name: string
  }
}

const searchQuery = ref('')
const statusFilter = ref('all')
const reviewFilter = ref('all')
const currentPage = ref(1)
const deletePostId = ref<string | null>(null)
const postsPerPage = 10

// 获取数据
const { data: postsData, refresh } = await useAsyncData('dashboard-posts', async () => {
  if (!user.value) return null

  const { data: profile } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.value.id)
    .single()

  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === SUPER_ADMIN_FAMILY_ID

  let query = client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (!isSuperAdmin) {
    query = query.eq('author_id', user.value.id)
  }

  const { data: posts, count } = await query

  return {
    posts: (posts || []) as Post[],
    totalCount: count || 0,
    isSuperAdmin
  }
})

// 过滤文章
const filteredPosts = computed(() => {
  if (!postsData.value) return []
  
  let result = postsData.value.posts

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    result = result.filter(post => post.status === statusFilter.value)
  }

  if (reviewFilter.value !== 'all') {
    result = result.filter(post => post.review_status === reviewFilter.value)
  }

  return result
})

// 分页
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))
const currentPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
})

// 重置页码
watch([searchQuery, statusFilter, reviewFilter], () => {
  currentPage.value = 1
})

// 删除文章
const handleDelete = async () => {
  if (!deletePostId.value) return

  try {
    const { error } = await client
      .from('posts')
      .delete()
      .eq('id', deletePostId.value)

    if (error) throw error

    deletePostId.value = null
    await refresh()
  } catch (err) {
    console.error('删除失败:', err)
  }
}

// 生成页码
const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxVisible = 7

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage.value <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages.value)
    } else if (currentPage.value >= totalPages.value - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages.value)
    }
  }

  return pages
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<template>
  <div v-if="postsData" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent mb-2 tracking-tight">
          文章管理
        </h1>
        <p class="text-sm sm:text-base text-gray-600 font-medium">共 {{ postsData.totalCount }} 篇文章</p>
      </div>
      <NuxtLink
        to="/dashboard/posts/new"
        class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
      >
        <Plus class="w-4 h-4 sm:w-5 sm:h-5" />
        新建文章
      </NuxtLink>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <!-- 搜索 -->
        <div class="relative sm:col-span-2 lg:col-span-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题或 Slug..."
            class="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent transition-all text-sm sm:text-base font-medium"
          />
        </div>

        <!-- 发布状态筛选 -->
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent transition-all text-sm sm:text-base font-bold bg-white"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="archived">已归档</option>
        </select>

        <!-- 审核状态筛选 -->
        <select
          v-model="reviewFilter"
          class="px-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent transition-all text-sm sm:text-base font-bold bg-white"
        >
          <option value="all">全部审核状态</option>
          <option value="approved">已通过</option>
          <option value="pending">待审核</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>

      <!-- 筛选结果统计 -->
      <div v-if="searchQuery || statusFilter !== 'all' || reviewFilter !== 'all'" class="mt-4 pt-4 border-t border-gray-100">
        <p class="text-xs sm:text-sm text-gray-600 font-medium">
          找到 <span class="font-black text-[#FF4D94]">{{ filteredPosts.length }}</span> 篇文章
          <span v-if="searchQuery"> · 搜索: "{{ searchQuery }}"</span>
          <span v-if="statusFilter !== 'all'"> · 状态: {{ statusFilter }}</span>
          <span v-if="reviewFilter !== 'all'"> · 审核: {{ reviewFilter }}</span>
        </p>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-if="currentPosts.length === 0" class="bg-white rounded-3xl p-12 text-center border border-gray-100">
      <Plus class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">暂无文章</h3>
      <p class="text-gray-600">{{ searchQuery || statusFilter !== 'all' || reviewFilter !== 'all' ? '尝试调整筛选条件' : '开始创建你的第一篇文章' }}</p>
    </div>

    <template v-else>
      <!-- 桌面端表格 -->
      <div class="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">标题</th>
                <th class="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">状态</th>
                <th class="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">审核</th>
                <th v-if="postsData.isSuperAdmin" class="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">作者</th>
                <th class="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">发布时间</th>
                <th class="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">阅读</th>
                <th class="px-6 py-4 text-right text-sm font-black text-gray-700 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="post in currentPosts"
                :key="post.id"
                class="hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group"
              >
                <td class="px-6 py-4">
                  <div class="font-black text-base text-gray-900 line-clamp-2 group-hover:text-[#FF4D94] transition-colors">{{ post.title }}</div>
                  <div class="text-xs text-gray-500 mt-1 font-medium">/blog/{{ post.slug }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold',
                    post.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
                    post.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    'bg-gray-50 text-gray-700 border border-gray-200'
                  ]">
                    {{ post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span v-if="post.review_status" :class="[
                    'inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold',
                    post.review_status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                    post.review_status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-orange-50 text-orange-700 border border-orange-200'
                  ]">
                    <CheckCircle v-if="post.review_status === 'approved'" class="w-3 h-3" />
                    <XCircle v-else-if="post.review_status === 'rejected'" class="w-3 h-3" />
                    <Clock v-else class="w-3 h-3" />
                    {{ post.review_status === 'approved' ? '已通过' : post.review_status === 'rejected' ? '已拒绝' : '待审核' }}
                  </span>
                  <span v-else class="text-xs text-gray-400 font-medium">-</span>
                </td>
                <td v-if="postsData.isSuperAdmin" class="px-6 py-4 text-sm text-gray-600 font-bold">
                  {{ post.profiles?.name ? `${post.profiles.name}的家庭` : '未知家庭' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 font-medium">
                  {{ post.published_at ? formatDate(post.published_at) : '-' }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1 text-sm text-gray-600 font-bold">
                    <Eye class="w-4 h-4" />
                    {{ post.view_count }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink
                      :to="`/dashboard/posts/${post.id}/edit`"
                      class="p-2 text-[#7C4DFF] hover:bg-[#7C4DFF]/10 rounded-xl transition-all"
                      title="编辑"
                    >
                      <Edit class="w-4 h-4" />
                    </NuxtLink>
                    <NuxtLink
                      v-if="postsData.isSuperAdmin && post.review_status === 'pending'"
                      :to="`/dashboard/posts/${post.id}/review`"
                      class="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                      title="审核"
                    >
                      <CheckCircle class="w-4 h-4" />
                    </NuxtLink>
                    <button
                      v-if="postsData.isSuperAdmin || post.author_id === user?.id"
                      @click="deletePostId = post.id"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="删除"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 移动端卡片列表 -->
      <div class="md:hidden space-y-3">
        <div
          v-for="post in currentPosts"
          :key="post.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
        >
          <!-- 标题 -->
          <div class="mb-3">
            <h3 class="font-black text-base text-gray-900 line-clamp-2 mb-1">{{ post.title }}</h3>
            <p class="text-xs text-gray-500 font-medium">/blog/{{ post.slug }}</p>
          </div>

          <!-- 状态标签 -->
          <div class="flex flex-wrap gap-2 mb-3">
            <span :class="[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold',
              post.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
              post.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              'bg-gray-50 text-gray-700 border border-gray-200'
            ]">
              {{ post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档' }}
            </span>
            <span v-if="post.review_status" :class="[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold',
              post.review_status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
              post.review_status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-orange-50 text-orange-700 border border-orange-200'
            ]">
              <CheckCircle v-if="post.review_status === 'approved'" class="w-3 h-3" />
              <XCircle v-else-if="post.review_status === 'rejected'" class="w-3 h-3" />
              <Clock v-else class="w-3 h-3" />
              {{ post.review_status === 'approved' ? '已通过' : post.review_status === 'rejected' ? '已拒绝' : '待审核' }}
            </span>
          </div>

          <!-- 信息行 -->
          <div class="flex items-center justify-between text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <span v-if="postsData.isSuperAdmin && post.profiles?.name" class="font-bold">{{ post.profiles.name }}的家庭</span>
              <span class="font-medium">{{ post.published_at ? formatDate(post.published_at) : '未发布' }}</span>
            </div>
            <div class="flex items-center gap-1 font-bold">
              <Eye class="w-3.5 h-3.5" />
              {{ post.view_count }}
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <NuxtLink
              :to="`/dashboard/posts/${post.id}/edit`"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C4DFF]/10 text-[#7C4DFF] rounded-xl font-bold text-sm transition-all hover:bg-[#7C4DFF]/20"
            >
              <Edit class="w-4 h-4" />
              编辑
            </NuxtLink>
            <button
              v-if="postsData.isSuperAdmin || post.author_id === user?.id"
              @click="deletePostId = post.id"
              class="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm transition-all hover:bg-red-100"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-xs sm:text-sm text-gray-600 font-medium">
        显示 <span class="font-black text-[#FF4D94]">{{ (currentPage - 1) * postsPerPage + 1 }}</span> - <span class="font-black text-[#FF4D94]">{{ Math.min(currentPage * postsPerPage, filteredPosts.length) }}</span> 条，共 <span class="font-black text-[#FF4D94]">{{ filteredPosts.length }}</span> 条
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-bold"
        >
          上一页
        </button>
        
        <div class="flex items-center gap-1">
          <template v-for="(page, index) in getPageNumbers()" :key="`page-${index}`">
            <span v-if="page === '...'" class="px-2 sm:px-3 py-2 text-gray-400 text-xs sm:text-sm">...</span>
            <button
              v-else
              @click="currentPage = page as number"
              :class="[
                'px-3 sm:px-4 py-2 rounded-xl transition-all text-xs sm:text-sm font-bold',
                currentPage === page
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                  : 'border border-gray-200 hover:bg-gray-50 hover:border-[#FF4D94]/30'
              ]"
            >
              {{ page }}
            </button>
          </template>
        </div>
        
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-bold"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div
      v-if="deletePostId"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="deletePostId = null"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">删除文章</h3>
        <p class="text-gray-600 mb-6">确定要删除这篇文章吗？此操作无法撤销。</p>
        <div class="flex gap-3">
          <button
            @click="deletePostId = null"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
