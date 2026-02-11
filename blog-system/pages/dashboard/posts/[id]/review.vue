<script setup lang="ts">
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, User, Calendar } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const { user, profile } = useAuth()
const { formatDate } = useUtils()
const postId = route.params.id as string

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

interface ReviewData {
  post: any
  familyName: string | null
}

const { data: reviewData, refresh } = await useAsyncData<ReviewData>(`review-post-${postId}`, async () => {
  if (!user.value) throw createError({ statusCode: 401, statusMessage: '未登录' })

  // 1. 验证超级管理员权限
  const isSuperAdmin = profile.value?.role === 'admin'
  if (!isSuperAdmin) {
    throw createError({ statusCode: 403, statusMessage: '您没有权限进行审核' })
  }

  // 2. 获取文章和作者信息
  const { data: post, error } = await client
    .from('posts')
    .select(`
      *,
      profiles!posts_author_id_fkey (
        name,
        avatar_url,
        family_id
      )
    `)
    .eq('id', postId)
    .single()

  if (error || !post) throw createError({ statusCode: 404, statusMessage: '文章未找到' })

  // 3. 获取家庭名称
  let familyName: string | null = null
  const postData = post as any
  if (postData.profiles?.family_id) {
    const { data: family } = await client
      .from('families')
      .select('name')
      .eq('id', postData.profiles.family_id)
      .single()
    familyName = (family as any)?.name || null
  }

  return { post, familyName }
})

const submitting = ref(false)
const errorMsg = ref('')

const handleReview = async (approve: boolean) => {
  submitting.value = true
  errorMsg.value = ''

  try {
    // 优先使用 RPC，如果失败则尝试直接更新
    const { error: reviewError } = await (client.rpc as any)('approve_post', {
      post_id: postId,
      approve: approve
    })

    if (reviewError) {
      // 如果 RPC 不存在或报错，回退到普通 update
      const { error: updateError } = await (client
        .from('posts') as any)
        .update({
          review_status: approve ? 'approved' : 'rejected',
          reviewed_by: user.value?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', postId)

      if (updateError) throw updateError
    }

    alert(approve ? '文章已通过审核' : '文章已被拒绝')
    router.push('/dashboard/posts')
  } catch (err: any) {
    console.error('审核失败:', err)
    errorMsg.value = err.message || '审核失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="reviewData" class="max-w-5xl mx-auto pb-24">
    <!-- Header -->
    <div class="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <NuxtLink
          to="/dashboard/posts"
          class="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-brand-pink uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          返回文章列表
        </NuxtLink>
        <h1 class="text-4xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent tracking-tight">
          审核内容中心
        </h1>
      </div>
      
      <div class="flex items-center gap-3">
         <div class="px-4 py-2 bg-white rounded-2xl border border-gray-100 flex items-center gap-2 shadow-sm">
            <ShieldCheck class="w-4 h-4 text-brand-purple" />
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">高级审核模式</span>
         </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
       <!-- Left Content Area -->
       <div class="lg:col-span-8 space-y-8">
          <!-- Post Summary Card -->
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 sm:p-12 overflow-hidden relative">
             <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-pink/5 to-brand-purple/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
             
             <div class="relative">
                <div class="flex flex-wrap items-center gap-4 mb-6">
                   <span :class="['px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border', 
                     reviewData.post.review_status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                     reviewData.post.review_status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                     'bg-orange-50 text-orange-600 border-orange-100']">
                      {{ reviewData.post.review_status === 'approved' ? '已通过' : reviewData.post.review_status === 'rejected' ? '已拒绝' : '待审核' }}
                   </span>
                   <span class="text-xs font-bold text-gray-300">/</span>
                   <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Calendar class="w-4 h-4" />
                      {{ formatDate(reviewData.post.created_at) }}
                   </div>
                </div>

                <h2 class="text-3xl font-black text-gray-900 mb-8 leading-tight">{{ reviewData.post.title }}</h2>

                <div v-if="reviewData.post.excerpt" class="p-6 bg-gray-50 rounded-3xl border border-gray-100 italic relative overflow-hidden group">
                   <div class="absolute left-0 top-0 w-1 h-full bg-brand-pink/20 transition-all group-hover:bg-brand-pink"></div>
                   <p class="text-gray-600 font-medium leading-relaxed">{{ reviewData.post.excerpt }}</p>
                </div>
             </div>
          </div>

          <!-- Post Content Area -->
          <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
             <div class="px-8 py-6 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">文章正文预览</span>
             </div>
             <div class="p-8 sm:p-12 prose prose-pink max-w-none">
                <MarkdownContent :content="reviewData.post.content" />
             </div>
          </div>
       </div>

       <!-- Right Sidebar - Action Panel -->
       <div class="lg:col-span-4 space-y-8">
          <!-- Author Profile -->
          <div class="bg-white rounded-[32px] border border-gray-100 shadow-xl p-8">
             <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">创作者信息</p>
             <div class="flex items-center gap-4 mb-8">
                <div class="w-16 h-16 rounded-[24px] bg-gradient-to-br from-brand-pink to-brand-purple p-0.5 shadow-lg">
                   <div class="w-full h-full rounded-[22px] bg-white overflow-hidden flex items-center justify-center font-black text-brand-pink text-xl">
                      <img v-if="reviewData.post.profiles?.avatar_url" :src="reviewData.post.profiles.avatar_url" class="w-full h-full object-cover" />
                      <span v-else>{{ reviewData.post.profiles?.name?.[0] || '?' }}</span>
                   </div>
                </div>
                <div>
                   <h3 class="font-black text-gray-900 text-lg leading-none mb-1">{{ reviewData.post.profiles?.name || '匿名创作者' }}</h3>
                   <p class="text-[10px] font-black text-brand-pink uppercase tracking-widest">家庭作者</p>
                </div>
             </div>
             <div v-if="reviewData.familyName" class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-500 shadow-sm">
                   <User class="w-4 h-4" />
                </div>
                <div>
                   <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">归属家庭</p>
                   <p class="text-sm font-bold text-gray-900 line-clamp-1">{{ reviewData.familyName }}</p>
                </div>
             </div>
          </div>

          <!-- Review Actions Control -->
          <div class="bg-white rounded-[32px] border border-gray-100 shadow-2xl p-8 sticky top-32 overflow-hidden">
             <div class="relative z-10">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">执行审核决策</p>

                <div v-if="reviewData.post.review_status !== 'pending'" class="text-center p-6 bg-gray-50 rounded-3xl border border-gray-200">
                   <p class="text-sm font-black text-gray-600 mb-2">此文章已经结项</p>
                   <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-[10px] font-black uppercase text-gray-400">
                      STATUS: {{ reviewData.post.review_status }}
                   </div>
                   <NuxtLink to="/dashboard/posts" class="block w-full mt-6 py-4 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-50">
                      回列表
                   </NuxtLink>
                </div>

                <div v-else class="space-y-6">
                   <div class="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 mb-8 flex items-start gap-4">
                      <Clock class="w-5 h-5 text-orange-500 shrink-0" />
                      <p class="text-xs font-bold text-orange-800 leading-relaxed">
                        审核操作将影响文章的公开可见性。批准后文章将进入已发布池，拒绝将退回作者草稿箱。
                      </p>
                   </div>

                   <button
                     @click="handleReview(true)"
                     :disabled="submitting"
                     class="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-green-200 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                     <CheckCircle class="w-5 h-5" />
                     批准发布此内容
                   </button>

                   <button
                     @click="handleReview(false)"
                     :disabled="submitting"
                     class="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                     <XCircle class="w-5 h-5" />
                     拦截并驳回请求
                   </button>

                   <p v-if="errorMsg" class="text-red-500 text-[10px] font-black text-center animate-shake">{{ errorMsg }}</p>
                </div>
             </div>
             
             <!-- Decorative elements -->
             <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-50 rounded-full blur-2xl opacity-50"></div>
          </div>
       </div>
    </div>
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
