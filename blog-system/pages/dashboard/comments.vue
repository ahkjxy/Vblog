<script setup lang="ts">
import { MessageSquare, CheckCircle, XCircle, Trash2, Filter } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

useSeoMeta({
  title: '评论管理'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

interface Comment {
  id: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_id: string | null
  post_id: string
  author_name: string
  author_email: string
  profiles: {
    name: string
    avatar_url: string | null
    role: string
  } | null
  posts: {
    title: string
    slug: string
    author_id: string
  } | null
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const comments = ref<Comment[]>([])
const filteredComments = ref<Comment[]>([])
const loading = ref(true)
const statusFilter = ref<StatusFilter>('all')
const selectedComments = ref<Set<string>>(new Set())
const isDeleteDialogOpen = ref(false)
const commentToDelete = ref<Comment | null>(null)
const isBulkDeleting = ref(false)
const isSuperAdmin = ref(false)

// 检查权限
const { data: profile } = await useAsyncData('user-profile', async () => {
  if (!user.value) return null
  const { data } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.value.id)
    .single()
  return data
})

const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
isSuperAdmin.value = profile.value?.role === 'admin' && profile.value?.family_id === SUPER_ADMIN_FAMILY_ID

// 加载评论
const loadComments = async () => {
  try {
    let query = client
      .from('comments')
      .select(`
        *,
        profiles(name, avatar_url, role),
        posts!inner(title, slug, author_id)
      `)
      .order('created_at', { ascending: false })
    
    // 如果不是超级管理员，只显示自己文章的评论
    if (!isSuperAdmin.value && user.value) {
      query = query.eq('posts.author_id', user.value.id)
    }

    const { data, error } = await query

    if (error) throw error
    comments.value = data || []
  } catch (err) {
    console.error('加载评论失败:', err)
  } finally {
    loading.value = false
  }
}

// 过滤评论
watch([comments, statusFilter], () => {
  if (statusFilter.value === 'all') {
    filteredComments.value = comments.value
  } else {
    filteredComments.value = comments.value.filter(c => c.status === statusFilter.value)
  }
})

// 批准评论
const handleApprove = async (commentId: string) => {
  try {
    const { error } = await client
      .from('comments')
      .update({ status: 'approved' })
      .eq('id', commentId)

    if (error) throw error
    await loadComments()
  } catch (err) {
    console.error('批准评论失败:', err)
  }
}

// 拒绝评论
const handleReject = async (commentId: string) => {
  try {
    const { error } = await client
      .from('comments')
      .update({ status: 'rejected' })
      .eq('id', commentId)

    if (error) throw error
    await loadComments()
  } catch (err) {
    console.error('拒绝评论失败:', err)
  }
}

// 删除评论
const handleDelete = async () => {
  if (!commentToDelete.value) return

  try {
    const { error } = await client
      .from('comments')
      .delete()
      .eq('id', commentToDelete.value.id)

    if (error) throw error
    isDeleteDialogOpen.value = false
    await loadComments()
  } catch (err) {
    console.error('删除评论失败:', err)
  }
}

// 批量批准
const handleBulkApprove = async () => {
  if (selectedComments.value.size === 0) return

  try {
    const { error } = await client
      .from('comments')
      .update({ status: 'approved' })
      .in('id', Array.from(selectedComments.value))

    if (error) throw error
    selectedComments.value = new Set()
    await loadComments()
  } catch (err) {
    console.error('批量批准失败:', err)
  }
}

// 批量拒绝
const handleBulkReject = async () => {
  if (selectedComments.value.size === 0) return

  try {
    const { error } = await client
      .from('comments')
      .update({ status: 'rejected' })
      .in('id', Array.from(selectedComments.value))

    if (error) throw error
    selectedComments.value = new Set()
    await loadComments()
  } catch (err) {
    console.error('批量拒绝失败:', err)
  }
}

// 批量删除
const handleBulkDelete = async () => {
  if (selectedComments.value.size === 0) return

  isBulkDeleting.value = true

  try {
    const { error } = await client
      .from('comments')
      .delete()
      .in('id', Array.from(selectedComments.value))

    if (error) throw error
    selectedComments.value = new Set()
    await loadComments()
  } catch (err) {
    console.error('批量删除失败:', err)
  } finally {
    isBulkDeleting.value = false
  }
}

// 切换选择
const toggleSelect = (commentId: string) => {
  const newSelected = new Set(selectedComments.value)
  if (newSelected.has(commentId)) {
    newSelected.delete(commentId)
  } else {
    newSelected.add(commentId)
  }
  selectedComments.value = newSelected
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedComments.value.size === filteredComments.value.length) {
    selectedComments.value = new Set()
  } else {
    selectedComments.value = new Set(filteredComments.value.map(c => c.id))
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}

// 获取状态徽章
const getStatusBadge = (status: string) => {
  const styles = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  }
  const labels = {
    approved: '已批准',
    pending: '待审核',
    rejected: '已拒绝',
  }
  return { style: styles[status as keyof typeof styles], label: labels[status as keyof typeof labels] }
}

const stats = computed(() => ({
  total: comments.value.length,
  approved: comments.value.filter(c => c.status === 'approved').length,
  pending: comments.value.filter(c => c.status === 'pending').length,
  rejected: comments.value.filter(c => c.status === 'rejected').length,
}))

onMounted(() => {
  loadComments()
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        评论管理
      </h1>
      <p class="text-gray-600">管理所有文章评论</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <MessageSquare class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ stats.total }}</div>
              <div class="text-sm text-gray-600">总评论数</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ stats.approved }}</div>
              <div class="text-sm text-gray-600">已批准</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Filter class="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ stats.pending }}</div>
              <div class="text-sm text-gray-600">待审核</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ stats.rejected }}</div>
              <div class="text-sm text-gray-600">已拒绝</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Bulk Actions -->
      <div class="bg-white rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-400" />
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>

        <div v-if="selectedComments.size > 0" class="flex items-center gap-2">
          <span class="text-sm text-gray-600">
            已选择 {{ selectedComments.size }} 条
          </span>
          <button
            @click="handleBulkApprove"
            class="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            批量批准
          </button>
          <button
            @click="handleBulkReject"
            class="px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            批量拒绝
          </button>
          <button
            @click="handleBulkDelete"
            :disabled="isBulkDeleting"
            class="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {{ isBulkDeleting ? '删除中...' : '批量删除' }}
          </button>
        </div>
      </div>

      <!-- Comments List -->
      <div v-if="filteredComments.length === 0" class="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <MessageSquare class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">暂无评论</h3>
        <p class="text-gray-600">{{ statusFilter === 'all' ? '还没有收到任何评论' : `没有${getStatusBadge(statusFilter).label}的评论` }}</p>
      </div>

      <div v-else class="bg-white rounded-2xl border border-gray-100">
        <!-- Select All -->
        <div class="px-6 py-3 border-b bg-gray-50 flex items-center gap-3">
          <input
            type="checkbox"
            :checked="selectedComments.size === filteredComments.length && filteredComments.length > 0"
            @change="toggleSelectAll"
            class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span class="text-sm font-medium text-gray-700">全选</span>
        </div>

        <div class="divide-y">
          <div
            v-for="comment in filteredComments"
            :key="comment.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start gap-4">
              <!-- Checkbox -->
              <input
                type="checkbox"
                :checked="selectedComments.has(comment.id)"
                @change="toggleSelect(comment.id)"
                class="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />

              <!-- Avatar -->
              <div class="flex-shrink-0">
                <img
                  v-if="comment.profiles?.avatar_url"
                  :src="comment.profiles.avatar_url"
                  :alt="comment.profiles.name || '用户'"
                  class="w-12 h-12 rounded-full ring-2 ring-gray-200"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-lg"
                >
                  {{ comment.user_id 
                    ? (comment.profiles?.name || '').charAt(0).toUpperCase()
                    : comment.author_name?.charAt(0).toUpperCase() || '?'
                  }}
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <!-- User Info -->
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span class="font-semibold text-gray-900">
                    {{ comment.user_id ? (comment.profiles?.name || '用户') : comment.author_name }}
                  </span>
                  <span
                    v-if="comment.profiles?.role"
                    :class="[
                      'px-2 py-0.5 rounded text-xs font-medium',
                      comment.profiles.role === 'admin' && 'bg-purple-100 text-purple-700',
                      comment.profiles.role === 'editor' && 'bg-blue-100 text-blue-700',
                      comment.profiles.role === 'author' && 'bg-green-100 text-green-700'
                    ]"
                  >
                    {{ comment.profiles.role === 'admin' ? '管理员' : 
                       comment.profiles.role === 'editor' ? '编辑' : '作者' }}
                  </span>
                  <span v-if="!comment.user_id" class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    访客
                  </span>
                  <span class="text-gray-400">·</span>
                  <span class="text-sm text-gray-600">{{ formatDate(comment.created_at) }}</span>
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(comment.status).style]">
                    {{ getStatusBadge(comment.status).label }}
                  </span>
                </div>

                <!-- Email (for anonymous users) -->
                <div v-if="!comment.user_id && comment.author_email" class="text-sm text-gray-500 mb-2">
                  📧 {{ comment.author_email }}
                </div>

                <!-- Comment Content -->
                <p class="text-gray-700 mb-3 leading-relaxed">{{ comment.content }}</p>

                <!-- Post Link -->
                <NuxtLink
                  v-if="comment.posts"
                  :to="`/blog/${comment.posts.slug}`"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-pink-600 transition-colors"
                >
                  <span>评论于: {{ comment.posts.title }}</span>
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </NuxtLink>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <template v-if="comment.status === 'pending'">
                  <button
                    @click="handleApprove(comment.id)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="批准"
                  >
                    <CheckCircle class="w-5 h-5" />
                  </button>
                  <button
                    @click="handleReject(comment.id)"
                    class="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="拒绝"
                  >
                    <XCircle class="w-5 h-5" />
                  </button>
                </template>
                <button
                  @click="() => {
                    commentToDelete = comment
                    isDeleteDialogOpen = true
                  }"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="isDeleteDialogOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="isDeleteDialogOpen = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">删除评论</h3>
        <p class="text-gray-600 mb-6">确定要删除这条评论吗？此操作无法撤销。</p>
        <div class="flex gap-3">
          <button
            @click="isDeleteDialogOpen = false"
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
