<script setup lang="ts">
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-vue-next'

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
  } | null
}

const props = defineProps<{
  initialPosts: Post[]
  totalCount: number
  isSuperAdmin: boolean
  currentUserId: string
}>()

const client = useSupabaseClient()
const { formatDate } = useUtils()

const posts = ref<Post[]>(props.initialPosts)
const searchQuery = ref('')
const statusFilter = ref('all')
const reviewFilter = ref('all')
const currentPage = ref(1)
const postsPerPage = 20
const deletePostId = ref<string | null>(null)

const filteredPosts = computed(() => {
  let result = posts.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.slug.toLowerCase().includes(q)
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

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * postsPerPage)
const endIndex = computed(() => startIndex.value + postsPerPage)
const currentPosts = computed(() => filteredPosts.value.slice(startIndex.value, endIndex.value))

const getPageNumbers = () => {
  const pages = []
  const maxVisible = 7
  const total = totalPages.value

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (currentPage.value <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (currentPage.value >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
}

const handleDelete = async () => {
  if (!deletePostId.value) return

  try {
    const { error } = await client
      .from('posts')
      .delete()
      .eq('id', deletePostId.value)

    if (error) throw error

    posts.value = posts.value.filter(p => p.id !== deletePostId.value)
    deletePostId.value = null
  } catch (err) {
    console.error('删除文章失败:', err)
    alert('删除文章失败')
  }
}

watch([searchQuery, statusFilter, reviewFilter], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent mb-2 tracking-tight">
          文章管理
        </h1>
        <p class="text-gray-500 font-bold">共 {{ totalCount }} 篇文章</p>
      </div>
      <NuxtLink
        to="/dashboard/posts/new"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-[24px] font-black hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-lg text-base"
      >
        <Plus class="w-5 h-5" />
        新建文章
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Search -->
        <div class="relative sm:col-span-2 lg:col-span-1">
          <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章标题..."
            class="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-[#FF4D94]/10 focus:border-[#FF4D94]/30 transition-all font-bold"
          />
        </div>

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="px-6 py-4 bg-gray-50 border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-[#FF4D94]/10 focus:border-[#FF4D94]/30 transition-all font-black text-gray-700 appearance-none"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
          <option value="archived">已归档</option>
        </select>

        <!-- Review Filter -->
        <select
          v-model="reviewFilter"
          class="px-6 py-4 bg-gray-50 border border-gray-100 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-[#FF4D94]/10 focus:border-[#FF4D94]/30 transition-all font-black text-gray-700 appearance-none"
        >
          <option value="all">全部审核状态</option>
          <option value="approved">已通过</option>
          <option value="pending">待审核</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>

      <!-- Filter Results -->
      <div v-if="searchQuery || statusFilter !== 'all' || reviewFilter !== 'all'" class="mt-6 pt-6 border-t border-gray-50">
        <p class="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
          检索到 <span class="text-[#FF4D94]">{{ filteredPosts.length }}</span> 篇匹配的文章
        </p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">内容</th>
              <th class="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">状态</th>
              <th class="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">审核</th>
              <th v-if="isSuperAdmin" class="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">作者</th>
              <th class="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">时间/数据</th>
              <th class="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="post in currentPosts" :key="post.id" class="hover:bg-gray-50/50 transition-all group">
              <td class="px-8 py-6">
                <div class="font-black text-gray-900 mb-1 group-hover:text-brand-pink transition-colors truncate max-w-sm">{{ post.title }}</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/blog/{{ post.slug }}</div>
              </td>
              <td class="px-8 py-6">
                <span :class="`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  post.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 
                  post.status === 'draft' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-gray-50 text-gray-400 border-gray-100'
                }`">
                  {{ post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '已归档' }}
                </span>
              </td>
              <td class="px-8 py-6">
                <span :class="`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  post.review_status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                  post.review_status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-orange-50 text-orange-600 border-orange-100'
                }`">
                   <component :is="post.review_status === 'approved' ? CheckCircle : post.review_status === 'rejected' ? XCircle : Clock" class="w-3 h-3" />
                   {{ post.review_status === 'approved' ? '已通过' : post.review_status === 'rejected' ? '已拒绝' : '待审核' }}
                </span>
              </td>
              <td v-if="isSuperAdmin" class="px-8 py-6">
                 <div class="text-sm font-black text-gray-900">{{ post.profiles?.name || '匿名' }}</div>
              </td>
              <td class="px-8 py-6">
                 <div class="text-xs font-bold text-gray-700 mb-1">{{ post.published_at ? formatDate(post.published_at).split(' ')[0] : '-' }}</div>
                 <div class="flex items-center gap-3 text-[10px] font-black text-gray-400">
                    <span class="flex items-center gap-1"><Eye class="w-3 h-3" /> {{ post.view_count }}</span>
                 </div>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-3">
                  <NuxtLink :to="`/dashboard/posts/${post.id}/edit`" class="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                    <Edit class="w-5 h-5" />
                  </NuxtLink>
                  <button 
                    v-if="isSuperAdmin || post.author_id === currentUserId"
                    @click="deletePostId = post.id" 
                    class="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
       <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
         显示 <span class="text-gray-900">{{ startIndex + 1 }}</span> - <span class="text-gray-900">{{ Math.min(endIndex, filteredPosts.length) }}</span> 条 / 共 {{ filteredPosts.length }} 条
       </p>
       <div class="flex items-center gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-gray-50">上一页</button>
          <div class="flex items-center gap-1">
             <button 
               v-for="p in getPageNumbers()" 
               :key="p" 
               @click="typeof p === 'number' ? currentPage = p : null"
               :class="`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === p ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400 hover:border-brand-pink/30'}`"
             >
               {{ p }}
             </button>
          </div>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-gray-50">下一页</button>
       </div>
    </div>

    <!-- Delete Modal (Simplified) -->
    <div v-if="deletePostId" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
       <div class="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-fade-in-up">
          <div class="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner">
             <AlertCircle class="w-10 h-10" />
          </div>
          <h3 class="text-2xl font-black text-center text-gray-900 mb-4">确认删除？</h3>
          <p class="text-center text-gray-500 font-medium mb-10">此操作无法撤销，该文章的所有数据将永久丢失。</p>
          <div class="flex gap-4">
             <button @click="deletePostId = null" class="flex-1 px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-black hover:bg-gray-100 transition-all">取消</button>
             <button @click="handleDelete" class="flex-1 px-8 py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">确认删除</button>
          </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
