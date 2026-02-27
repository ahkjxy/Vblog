<script setup lang="ts">
import { 
  MessageCircle, 
  Send, 
  User, 
  CheckCircle, 
  XCircle, 
  Smile, 
  Reply, 
  Loader2 
} from 'lucide-vue-next'

interface Comment {
  id: string
  content: string
  created_at: string
  author_name: string
  author_email: string
  parent_id: string | null
  user_id: string | null
  profiles?: {
    name?: string
    avatar_url?: string
  }
  replies?: Comment[]
  parent?: Comment
}

const props = defineProps<{
  postId: string
}>()

const client = useSupabaseClient()
const user = useSupabaseUser()
const { formatDate } = useUtils()

const comments = ref<Comment[]>([])
const loading = ref(true)
const submitting = ref(false)
const content = ref('')
const authorName = ref('')
const authorEmail = ref('')
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const showEmojiPicker = ref(false)
const replyingTo = ref<{ id: string; name: string } | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const emojiPickerRef = ref<HTMLElement | null>(null)
const currentUserName = ref('')

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '😝',
  '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  '👍', '👎', '👏', '🙌', '👌', '✌️', '🤞', '🤟',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'
]

const showToast = (type: 'success' | 'error', message: string) => {
  toast.value = { type, message }
  setTimeout(() => toast.value = null, 3000)
}

const loadComments = async () => {
  try {
    const { data, error } = await client
      .from('comments')
      .select(`
        *,
        profiles!comments_user_id_fkey(name, avatar_url)
      `)
      .eq('post_id', props.postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) throw error
    
    // Organize comments into a tree
    const commentsMap = new Map<string, Comment>()
    const topLevelComments: Comment[] = []
    
    data?.forEach((comment: any) => {
      commentsMap.set(comment.id, { ...comment, replies: [] })
    })
    
    data?.forEach((comment: any) => {
      const commentWithReplies = commentsMap.get(comment.id)!
      if (comment.parent_id) {
        const parent = commentsMap.get(comment.parent_id)
        if (parent) {
          commentWithReplies.parent = parent
          parent.replies = parent.replies || []
          parent.replies.push(commentWithReplies)
        }
      } else {
        topLevelComments.push(commentWithReplies)
      }
    })
    
    comments.value = topLevelComments
  } catch (err) {
    console.error('加载评论失败:', err)
  } finally {
    loading.value = false
  }
}

const insertEmoji = (emoji: string) => {
  if (!textareaRef.value) return
  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  content.value = content.value.substring(0, start) + emoji + content.value.substring(end)
  showEmojiPicker.value = false
  nextTick(() => {
    textareaRef.value?.focus()
    textareaRef.value?.setSelectionRange(start + emoji.length, start + emoji.length)
  })
}

const handleReply = (commentId: string, name: string) => {
  replyingTo.value = { id: commentId, name }
  textareaRef.value?.focus()
  textareaRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const handleSubmit = async () => {
  if (!content.value.trim()) return
  
  submitting.value = true
  try {
    const { data: profile } = await client
      .from('profiles')
      .select('role, family_id, name')
      .eq('id', user.value?.id || '')
      .maybeSingle()

    const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

    const commentData = {
      post_id: props.postId,
      content: content.value.trim(),
      author_name: profile?.name || user.value?.email?.split('@')[0] || authorName.value || '匿名用户',
      author_email: user.value?.email || authorEmail.value || '',
      user_id: user.value?.id || null,
      parent_id: replyingTo.value?.id || null,
      status: isSuperAdmin ? 'approved' : 'pending'
    }

    const { error } = await client.from('comments').insert([commentData])
    if (error) throw error

    showToast('success', isSuperAdmin ? '发布成功' : '提交成功，等待审核')
    content.value = ''
    replyingTo.value = null
    if (isSuperAdmin) loadComments()
  } catch (err) {
    showToast('error', '提交失败')
  } finally {
    submitting.value = false
  }
}

// 获取当前用户名称
const loadCurrentUserName = async () => {
  if (!user.value) return
  
  const { data: profile } = await client
    .from('profiles')
    .select('name')
    .eq('id', user.value.id)
    .maybeSingle()
  
  currentUserName.value = profile?.name || user.value.email?.split('@')[0] || '用户'
}

onMounted(() => {
  loadComments()
  loadCurrentUserName()
})
</script>

<template>
  <div class="vibrant-card mobile-rounded mobile-spacing overflow-hidden mt-8 sm:mt-12">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center text-white shadow-md">
          <MessageCircle class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-black text-gray-900">探讨交流</h3>
          <p class="text-xs font-bold text-gray-400 capitalize">Join the conversation</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
      <div v-if="replyingTo" class="flex items-center justify-between bg-brand-pink/5 text-brand-pink px-4 py-2 rounded-xl text-sm font-bold border border-brand-pink/10">
        <span>正在回复：{{ replyingTo.name }}</span>
        <button @click="replyingTo = null" class="text-xs hover:underline">取消</button>
      </div>

      <div v-if="!user" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input v-model="authorName" placeholder="您的姓名 *" class="px-4 py-3 rounded-2xl border border-gray-100 focus:border-brand-pink outline-none text-sm font-bold bg-gray-50/30" required />
        <input v-model="authorEmail" type="email" placeholder="您的邮箱 *" class="px-4 py-3 rounded-2xl border border-gray-100 focus:border-brand-pink outline-none text-sm font-bold bg-gray-50/30" required />
      </div>

      <div class="relative">
        <textarea 
          ref="textareaRef"
          v-model="content" 
          placeholder="分享您的经验与想法..." 
          rows="4"
          class="w-full px-4 py-4 rounded-2xl border border-gray-100 focus:border-brand-pink outline-none text-sm font-medium bg-gray-50/30 resize-none"
          required
        ></textarea>
        
        <!-- 表情按钮 - 左下角 -->
        <button 
          type="button" 
          @click="showEmojiPicker = !showEmojiPicker" 
          class="absolute bottom-4 left-4 text-gray-400 hover:text-brand-pink transition-colors p-1 hover:bg-gray-100 rounded-lg"
        >
          <Smile class="w-5 h-5" />
        </button>
      </div>

      <!-- 表情选择器弹窗 -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div 
            v-if="showEmojiPicker" 
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            @click.self="showEmojiPicker = false"
          >
            <div 
              ref="emojiPickerRef"
              class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all"
              :class="showEmojiPicker ? 'scale-100' : 'scale-95'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-black text-gray-900 dark:text-white">选择表情</h3>
                <button 
                  @click="showEmojiPicker = false"
                  class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
                <button 
                  v-for="e in EMOJIS" 
                  :key="e" 
                  type="button" 
                  @click="insertEmoji(e)" 
                  class="text-3xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-3 transition-all hover:scale-110 active:scale-95"
                >
                  {{ e }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <div class="flex items-center justify-between pt-2">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {{ user ? `以 ${currentUserName}的家庭 登录` : '仅支持已审核内容显示' }}
        </p>
        <button 
          type="submit" 
          :disabled="submitting"
          class="bg-gradient-to-r from-brand-pink to-brand-purple text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
          <Send v-else class="w-4 h-4" />
          {{ replyingTo ? '发表回复' : '发布评论' }}
        </button>
      </div>
    </form>

    <!-- List -->
    <div class="border-t border-gray-50 px-6 py-8">
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 class="w-8 h-8 text-brand-pink animate-spin" />
        <span class="text-xs font-black text-gray-400 uppercase tracking-widest">加载探讨中...</span>
      </div>
      <div v-else-if="!comments.length" class="text-center py-12">
        <MessageCircle class="w-12 h-12 text-gray-100 mx-auto mb-4" />
        <p class="text-sm font-black text-gray-300">还没有人开始这场对话，快来抢沙发吧！</p>
      </div>
      <div v-else class="space-y-8">
        <div v-for="comment in comments" :key="comment.id" class="group">
          <!-- Main Comment -->
          <div class="flex gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-pink/10 to-brand-purple/10 flex-shrink-0 flex items-center justify-center text-brand-purple border border-brand-purple/10 overflow-hidden shadow-sm">
              <img v-if="comment.profiles?.avatar_url" :src="comment.profiles.avatar_url" class="w-full h-full object-cover" />
              <User v-else class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-gray-900">{{ (comment.profiles?.name || comment.author_name) + '的家庭' }}</span>
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ formatDate(comment.created_at) }}</span>
                </div>
                <button @click="handleReply(comment.id, (comment.profiles?.name || comment.author_name) + '的家庭')" class="text-[10px] font-black text-brand-pink uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">回复</button>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed font-medium mb-4 whitespace-pre-wrap">{{ comment.content }}</p>

              <!-- Replies -->
              <div v-if="comment.replies?.length" class="space-y-6 mt-6 pl-6 border-l-2 border-gray-50">
                <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden">
                    <img v-if="reply.profiles?.avatar_url" :src="reply.profiles.avatar_url" class="w-full h-full object-cover" />
                    <User v-else class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-black text-gray-900">{{ (reply.profiles?.name || reply.author_name) + '的家庭' }}</span>
                      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ formatDate(reply.created_at) }}</span>
                    </div>
                    <p class="text-xs text-gray-600 leading-relaxed font-medium">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
          <XCircle v-else class="w-5 h-5" />
          <span class="text-sm font-black">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
