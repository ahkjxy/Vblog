<script setup lang="ts">
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  Filter,
  ArrowUpRight,
  User,
  Clock,
  Check,
  X,
  AlertCircle
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { user, profile } = useAuth()
const { formatDate } = useUtils()

const isSuperAdmin = computed(() => profile.value?.role === 'admin')

const statusFilter = ref('all')
const searchQuery = ref('')
const selectedComments = ref(new Set<string>())
const isBulkApproving = ref(false)
const isBulkRejecting = ref(false)

const { data: comments, refresh } = await useAsyncData<any[]>('dashboard-comments-list', async () => {
  if (!user.value) return []

  let query = client
    .from('comments')
    .select(`
      id,
      content,
      status,
      created_at,
      author_name,
      author_email,
      user_id,
      post_id,
      posts!inner (
        id,
        title,
        slug,
        author_id
      ),
      profiles (
        name,
        avatar_url,
        role
      )
    `)
    .order('created_at', { ascending: false })

  // 如果不是管理员，只看自己文章下的评论
  if (!isSuperAdmin.value) {
    query = query.eq('posts.author_id', user.value.id)
  }

  const { data, error } = await query
  if (error) {
    console.error('获取评论失败:', error)
    return []
  }
  return (data as any[]) || []
})

const filteredComments = computed(() => {
  if (!comments.value) return []
  return comments.value.filter(comment => {
    const matchesStatus = statusFilter.value === 'all' || comment.status === statusFilter.value
    const matchesSearch = !searchQuery.value || 
      comment.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (comment.author_name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const handleApprove = async (id: string) => {
  const { error } = await (client.from('comments') as any).update({ status: 'approved' }).eq('id', id)
  if (error) alert('操作失败: ' + error.message)
  else refresh()
}

const handleReject = async (id: string) => {
  const { error } = await (client.from('comments') as any).update({ status: 'rejected' }).eq('id', id)
  if (error) alert('操作失败: ' + error.message)
  else refresh()
}

const handleDelete = async (id: string) => {
  if (!confirm('确定要删除此评论吗？')) return
  const { error } = await client.from('comments').delete().eq('id', id)
  if (error) alert('删除失败: ' + error.message)
  else refresh()
}

const toggleSelectAll = () => {
  if (selectedComments.value.size === filteredComments.value.length) {
    selectedComments.value.clear()
  } else {
    selectedComments.value = new Set(filteredComments.value.map(c => c.id))
  }
}

const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
  const ids = Array.from(selectedComments.value)
  if (ids.length === 0) return

  if (action === 'delete') {
    if (!confirm(`确定要批量删除选中的 ${ids.length} 条评论吗？`)) return
    const { error } = await client.from('comments').delete().in('id', ids)
    if (error) alert('批量删除失败: ' + error.message)
  } else {
    const status = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await (client.from('comments') as any).update({ status }).in('id', ids)
    if (error) alert('批量操作失败: ' + error.message)
  }
  
  selectedComments.value.clear()
  refresh()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-50 text-green-600 border-green-100'
    case 'rejected': return 'bg-red-50 text-red-600 border-red-100'
    default: return 'bg-orange-50 text-orange-600 border-orange-100'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '待审核'
  }
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent mb-2 tracking-tight">
          评论管理中心
        </h1>
        <p class="text-gray-500 font-medium">共收到 {{ comments?.length || 0 }} 条评论</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-[40px] border border-gray-100 p-6 sm:p-8 shadow-xl space-y-6">
       <!-- Search & Filter Row -->
       <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2 relative">
             <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
               v-model="searchQuery"
               type="text" 
               placeholder="搜索评论内容或作者..." 
               class="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all"
             />
          </div>
          
          <div class="relative">
             <Filter class="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <select 
               v-model="statusFilter"
               class="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 appearance-none focus:ring-4 focus:ring-brand-pink/5 transition-all"
             >
                <option value="all">所有状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已发布</option>
                <option value="rejected">已屏蔽</option>
             </select>
          </div>

          <button @click="() => refresh()" class="px-6 py-4 bg-gray-50 text-brand-purple rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
             <Clock class="w-4 h-4" /> 刷新
          </button>
       </div>

       <!-- Bulk Actions -->
       <Transition
         enter-active-class="transition duration-300 ease-out"
         enter-from-class="opacity-0 -translate-y-4"
         enter-to-class="opacity-100 translate-y-0"
         leave-active-class="transition duration-200 ease-in"
         leave-from-class="opacity-100 translate-y-0"
         leave-to-class="opacity-0 -translate-y-4"
       >
         <div v-if="selectedComments.size > 0" class="p-6 bg-brand-pink/5 rounded-[32px] border border-brand-pink/10 flex flex-wrap items-center justify-between gap-6">
            <div class="flex items-center gap-4">
               <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-pink font-black shadow-sm">
                 {{ selectedComments.size }}
               </div>
               <p class="text-sm font-black text-brand-pink uppercase tracking-widest">项被选中</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
               <button @click="handleBulkAction('approve')" class="px-6 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all min-w-[100px]">批量批准</button>
               <button @click="handleBulkAction('reject')" class="px-6 py-3 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all min-w-[100px]">批量拒绝</button>
               <button @click="handleBulkAction('delete')" class="px-6 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all min-w-[100px]">批量删除</button>
               <div class="w-px h-6 bg-brand-pink/20 mx-2"></div>
               <button @click="selectedComments.clear()" class="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest">取消</button>
            </div>
         </div>
       </Transition>
    </div>

    <!-- Comments List -->
    <div class="space-y-4">
       <div v-if="filteredComments.length === 0" class="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-6">
          <div class="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 mx-auto shadow-inner">
             <MessageSquare class="w-12 h-12" />
          </div>
          <p class="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">这里静悄悄的...</p>
       </div>

       <div 
         v-for="comment in filteredComments" 
         :key="comment.id"
         class="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative"
       >
          <!-- Selector -->
          <button 
            @click="selectedComments.has(comment.id) ? selectedComments.delete(comment.id) : selectedComments.add(comment.id)"
            :class="['absolute left-0 top-0 w-8 h-full transition-all flex items-center justify-center', selectedComments.has(comment.id) ? 'bg-brand-pink text-white' : 'bg-gray-50/0 hover:bg-gray-50/50']"
          >
             <div class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all" :class="selectedComments.has(comment.id) ? 'border-white' : 'border-gray-200'">
                <Check v-if="selectedComments.has(comment.id)" class="w-3 h-3" />
             </div>
          </button>

          <div class="flex flex-col sm:flex-row gap-8 pl-6">
             <!-- Author Column -->
             <div class="sm:w-48 shrink-0">
                <div class="flex items-center gap-4 mb-6">
                   <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-0.5 shadow-sm overflow-hidden flex items-center justify-center font-black text-brand-pink text-xl shrink-0">
                      <img v-if="comment.profiles?.avatar_url" :src="comment.profiles.avatar_url" class="w-full h-full object-cover" />
                      <span v-else>{{ (comment.profiles?.name || comment.author_name)?.[0]?.toUpperCase() || '?' }}</span>
                   </div>
                   <div class="min-w-0">
                      <h3 class="font-black text-gray-900 leading-tight truncate mb-1">{{ comment.profiles?.name || comment.author_name || '作者' }}</h3>
                      <div class="flex items-center gap-1.5">
                         <span v-if="comment.profiles" class="px-2 py-0.5 bg-brand-purple/5 text-brand-purple text-[8px] font-black uppercase tracking-widest rounded transition-colors">{{ comment.profiles.role === 'admin' ? '管理员' : '家庭成员' }}</span>
                         <span v-else class="px-2 py-0.5 bg-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded">外站访客</span>
                      </div>
                   </div>
                </div>
                <div class="hidden sm:block space-y-3">
                   <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Clock class="w-3 h-3" /> {{ formatDate(comment.created_at) }}
                   </div>
                   <div v-if="comment.author_email" class="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate max-w-full" :title="comment.author_email">
                      <ArrowUpRight class="w-3 h-3" /> {{ comment.author_email }}
                   </div>
                </div>
             </div>

             <!-- Content Column -->
             <div class="flex-1 min-w-0 space-y-6">
                <!-- Status Badge -->
                <div class="flex items-center gap-3">
                   <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', getStatusColor(comment.status)]">
                      {{ getStatusLabel(comment.status) }}
                   </span>
                   <div class="h-px bg-gray-50 flex-1"></div>
                </div>

                <!-- Text Body -->
                <div class="relative">
                   <p class="text-gray-700 font-medium leading-relaxed italic text-base">"{{ comment.content }}"</p>
                </div>

                <!-- Footer / Meta -->
                <div class="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-gray-50">
                   <NuxtLink :to="`/blog/${comment.posts?.slug}`" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-50/50 hover:bg-brand-pink/5 rounded-xl text-[10px] font-black text-gray-400 hover:text-brand-pink transition-all uppercase tracking-widest group/link">
                      来自文章: <span class="text-gray-900 group-hover/link:text-brand-pink truncate max-w-[200px]">{{ comment.posts?.title }}</span>
                      <ArrowUpRight class="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all -translate-y-1" />
                   </NuxtLink>

                   <!-- Action Buttons Inline -->
                   <div class="flex items-center gap-2 ml-auto">
                      <button 
                        v-if="comment.status === 'pending'"
                        @click="handleApprove(comment.id)" 
                        class="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                        title="发布此评论"
                      >
                         <Check class="w-5 h-5" />
                      </button>
                      <button 
                        v-if="comment.status === 'pending'"
                        @click="handleReject(comment.id)" 
                        class="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                        title="拒绝显示"
                      >
                         <X class="w-5 h-5" />
                      </button>
                      <button 
                        @click="handleDelete(comment.id)" 
                        class="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                        title="直接删除"
                      >
                         <Trash2 class="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
          
          <!-- Decorative Corners -->
          <div class="absolute -right-12 -bottom-12 w-24 h-24 bg-gray-50/0 group-hover:bg-brand-pink/5 rounded-full blur-2xl transition-all"></div>
       </div>
    </div>

    <!-- Bulk Op Confirmation (Optional) -->
    <!-- ICP Info usually handled in Layout Footer, as requested -->
  </div>
</template>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
