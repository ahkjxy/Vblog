<script setup lang="ts">
import { 
  MessageCircle, 
  X, 
  Send, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  HelpCircle, 
  LogIn,
  CheckCircle,
  XCircle
} from 'lucide-vue-next'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

const FAQ_ITEMS = [
  {
    question: '如何开始使用元气银行？',
    answer: '访问 www.familybank.chat 即可免费体验，无需注册。您可以创建家庭、添加成员、设置任务和奖励。'
  },
  {
    question: '元气银行和博客系统是什么关系？',
    answer: '元气银行是家庭积分管理系统，博客系统用于分享使用经验和家庭管理智慧。两个系统共享同一个账号，登录后可以在两个系统间无缝切换。'
  },
  {
    question: '支持哪些平台？',
    answer: '元气银行支持网页版和安卓应用。博客系统支持所有现代浏览器。'
  },
  {
    question: '数据安全吗？',
    answer: '我们使用 Supabase 提供的企业级安全保障，所有数据都经过加密存储和传输。'
  }
]

const client = useSupabaseClient()
const user = useSupabaseUser()
const { profile } = useAuth()

const isOpen = ref(false)
const messages = ref<Message[]>([
  {
    id: '1',
    type: 'bot',
    content: '你好！我是元气银行智能助手 👋\n\n有什么可以帮助你的吗？你可以：\n• 点击下方常见问题快速了解\n• 直接输入你的问题\n• 联系人工客服',
    timestamp: new Date()
  }
])
const inputValue = ref('')
const showFAQ = ref(true)
const isSubmitting = ref(false)
const isLoadingHistory = ref(false)
const historyLoaded = ref(false)
const messagesEndRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const showToast = (type: 'success' | 'error', message: string) => {
  toast.value = { type, message }
  setTimeout(() => toast.value = null, 3000)
}

const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

watch(messages, () => scrollToBottom(), { deep: true })

const loadHistory = async () => {
  if (!user.value || !profile.value || historyLoaded.value || !profile.value.id) return

  isLoadingHistory.value = true
  try {
    const { data: feedbacks } = await client
      .from('feedback_messages')
      .select('id, message, created_at, status')
      .eq('profile_id', profile.value.id)
      .order('created_at', { ascending: true })
      .limit(20)

    if (!feedbacks || feedbacks.length === 0) {
      historyLoaded.value = true
      return
    }

    const { data: replies } = await client
      .from('feedback_replies')
      .select('feedback_id, message, created_at')
      .in('feedback_id', feedbacks.map(f => f.id))
      .order('created_at', { ascending: true })

    const historyMessages: Message[] = []
    feedbacks.forEach(feedback => {
      historyMessages.push({
        id: feedback.id,
        type: 'user',
        content: feedback.message,
        timestamp: new Date(feedback.created_at)
      })

      const feedbackReplies = replies?.filter(r => r.feedback_id === feedback.id) || []
      feedbackReplies.forEach(reply => {
        historyMessages.push({
          id: `reply-${reply.feedback_id}`,
          type: 'bot',
          content: `💬 客服回复：\n\n${reply.message}`,
          timestamp: new Date(reply.created_at)
        })
      })
    })

    if (historyMessages.length > 0) {
      messages.value = [
        { id: '0', type: 'bot', content: '📜 以下是您的历史消息记录：', timestamp: new Date() },
        ...historyMessages,
        { id: 'welcome-back', type: 'bot', content: '👋 欢迎回来！有什么可以帮助你的吗？', timestamp: new Date() }
      ]
      showFAQ.value = false
    }
    historyLoaded.value = true
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    isLoadingHistory.value = false
  }
}

watch(isOpen, (val) => {
  if (val && user.value && !historyLoaded.value) {
    loadHistory()
  }
  if (val) {
    nextTick(() => inputRef.value?.focus())
  }
})

const handleSendMessage = async () => {
  if (!inputValue.value.trim() || isSubmitting.value) return

  if (!user.value || !profile.value) {
    messages.value.push({
      id: Date.now().toString(),
      type: 'bot',
      content: '⚠️ 请先登录后再发送消息。\n\n登录后，您的消息将被保存，我们的客服团队会尽快回复。',
      timestamp: new Date()
    })
    return
  }

  const content = inputValue.value.trim()
  messages.value.push({
    id: Date.now().toString(),
    type: 'user',
    content,
    timestamp: new Date()
  })
  inputValue.value = ''
  showFAQ.value = false
  isSubmitting.value = true

  try {
    if (!profile.value?.family_id) {
       throw new Error('用户没有关联的家庭，请先在元气银行系统中完成设置')
    }

    const { error } = await client.from('feedback_messages').insert({
      family_id: profile.value.family_id,
      profile_id: profile.value.id,
      subject: '博客系统客服咨询',
      message: content,
      category: 'question',
      priority: 'normal',
      status: 'pending'
    })

    if (error) throw error

    messages.value.push({
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: '✅ 您的消息已成功发送！\n\n我们的客服团队会在24小时内回复您。您可以在元气银行后台的"系统设置 → 反馈与建议"中查看回复。',
      timestamp: new Date()
    })
  } catch (err: any) {
    showToast('error', err.message || '发送失败')
    messages.value.push({
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: `❌ 消息发送失败：${err.message || '未知错误'}\n\n如需紧急帮助，请发送邮件至：ahkjxy@qq.com`,
      timestamp: new Date()
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleFAQClick = (faq: typeof FAQ_ITEMS[0]) => {
  messages.value.push({
    id: Date.now().toString(),
    type: 'user',
    content: faq.question,
    timestamp: new Date()
  })
  showFAQ.value = false
  setTimeout(() => {
    messages.value.push({
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: faq.answer,
      timestamp: new Date()
    })
  }, 500)
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  window.addEventListener('openCustomerSupport', () => isOpen.value = true)
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[60]">
    <!-- Toggle Button -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="w-14 h-14 bg-gradient-to-br from-[#7C4DFF] to-[#FF4D94] text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group relative"
    >
      <MessageCircle class="w-6 h-6" />
      <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      <div class="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
        需要帮助？
        <div class="absolute top-full right-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>

    <!-- Chat Window -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-8 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-8 opacity-0 scale-95"
    >
      <div v-if="isOpen" class="w-96 h-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#7C4DFF] to-[#FF4D94] p-5 flex items-center justify-between text-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-sm uppercase tracking-wider">元气银行客服</h3>
              <p class="text-[10px] text-white/80 flex items-center gap-1 font-bold">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                在线咨询中
              </p>
            </div>
          </div>
          <button @click="isOpen = false" class="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          <div v-if="isLoadingHistory" class="flex justify-center py-4">
             <div class="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
               <div class="w-3 h-3 border-2 border-[#7C4DFF]/30 border-t-[#7C4DFF] rounded-full animate-spin"></div>
               加载历史记录...
             </div>
          </div>

          <div v-for="msg in messages" :key="msg.id" :class="`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`">
            <div :class="`max-w-[85%] rounded-[20px] px-4 py-3 shadow-sm ${msg.type === 'user' ? 'bg-[#7C4DFF] text-white' : 'bg-white border border-gray-100 text-gray-800'}`">
              <p class="text-sm whitespace-pre-wrap leading-relaxed font-medium">{{ msg.content }}</p>
              <p :class="`text-[9px] mt-1.5 font-bold uppercase ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400'}`">
                {{ formatTime(msg.timestamp) }}
              </p>
            </div>
          </div>

          <!-- FAQ Buttons -->
          <div v-if="showFAQ && messages.length === 1" class="space-y-2 mt-6">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">常见问题</p>
            <button
              v-for="(faq, idx) in FAQ_ITEMS"
              :key="idx"
              @click="handleFAQClick(faq)"
              class="w-full text-left px-4 py-3 bg-white border border-gray-100 rounded-2xl hover:border-[#7C4DFF]/30 hover:shadow-md transition-all text-sm font-medium text-gray-700 flex items-start gap-3"
            >
              <HelpCircle class="w-4 h-4 text-[#7C4DFF] flex-shrink-0 mt-0.5" />
              <span>{{ faq.question }}</span>
            </button>
          </div>

          <div ref="messagesEndRef" class="h-1"></div>
        </div>

        <!-- Input Area -->
        <div class="p-5 border-t border-gray-100 bg-white">
          <div v-if="!user" class="text-center">
             <p class="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">请登录后发起咨询</p>
             <NuxtLink to="/auth/unified" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7C4DFF] to-[#FF4D94] text-white rounded-2xl font-black text-xs shadow-lg hover:shadow-xl transition-all">
               <LogIn class="w-4 h-4" /> 立即登录
             </NuxtLink>
          </div>
          <div v-else class="flex items-center gap-3">
            <input
              ref="inputRef"
              v-model="inputValue"
              @keydown.enter="handleSendMessage"
              placeholder="需要什么帮助？"
              class="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/20 text-sm font-medium"
              :disabled="isSubmitting"
            />
            <button
              @click="handleSendMessage"
              :disabled="!inputValue.trim() || isSubmitting"
              class="w-12 h-12 bg-gradient-to-r from-[#7C4DFF] to-[#FF4D94] text-white rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 transition-all hover:scale-105"
            >
               <Send class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Global Toast inside component -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div v-if="toast" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70]">
        <div class="px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border"
          :class="toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'">
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4" />
          <XCircle v-else class="w-4 h-4" />
          <span class="text-xs font-black">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
