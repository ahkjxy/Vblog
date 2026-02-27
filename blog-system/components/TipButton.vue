<script setup lang="ts">
import { Heart, Coins, X, Send } from 'lucide-vue-next'

const props = defineProps<{
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  tipsCount: number
  tipsTotal: number
}>()

const emit = defineEmits<{
  tipped: []
}>()

const client = useSupabaseClient()
const user = useSupabaseUser()
const { profile } = useUserProfile()

const showModal = ref(false)
const selectedAmount = ref(0)
const customAmount = ref('')
const message = ref('')
const loading = ref(false)
const error = ref('')

const quickAmounts = [1, 5, 10, 20]

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  customAmount.value = ''
}

const handleCustomAmount = () => {
  const amount = parseInt(customAmount.value)
  if (amount > 0 && amount <= 100) {
    selectedAmount.value = amount
  }
}

const canTip = computed(() => {
  if (!user.value || !selectedAmount.value || selectedAmount.value <= 0) {
    return false
  }
  
  if (isOwnPost.value) {
    return false
  }
  
  const balance = profile.value?.balance ?? 0
  return balance >= selectedAmount.value
})

const handleTip = async () => {
  if (!canTip.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const { data, error: rpcError } = await client.rpc('create_post_tip', {
      p_post_id: props.postId,
      p_amount: selectedAmount.value,
      p_message: message.value || null
    })
    
    if (rpcError) throw rpcError
    
    if (data?.success) {
      showModal.value = false
      selectedAmount.value = 0
      customAmount.value = ''
      message.value = ''
      emit('tipped')
      
      // 刷新用户 profile
      const { loadProfile } = useUserProfile()
      await loadProfile(true)
    } else {
      error.value = data?.message || '打赏失败'
    }
  } catch (err: any) {
    error.value = err.message || '打赏失败，请重试'
  } finally {
    loading.value = false
  }
}

const isOwnPost = computed(() => {
  return user.value && user.value.id === props.authorId
})

const openModal = () => {
  if (!user.value) {
    navigateTo('/auth/unified')
    return
  }
  
  if (isOwnPost.value) {
    alert('不能给自己的文章打赏哦 😊')
    return
  }
  
  showModal.value = true
}
</script>

<template>
  <div>
    <!-- 打赏按钮 -->
    <button
      @click="openModal"
      class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all"
    >
      <Heart class="w-4 h-4" />
      <span>打赏</span>
      <span v-if="tipsTotal > 0" class="text-xs opacity-90">({{ tipsTotal }})</span>
    </button>

    <!-- 打赏弹窗 -->
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
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showModal = false"
        >
          <div class="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-[#1E293B] border-b border-gray-100 dark:border-white/10 p-6 flex items-center justify-between">
              <h3 class="text-xl font-black">打赏作者</h3>
              <button
                @click="showModal = false"
                class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- 作者信息 -->
              <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 rounded-2xl">
                <div v-if="authorAvatar" class="w-12 h-12 rounded-xl overflow-hidden">
                  <img :src="authorAvatar" :alt="authorName" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black">
                  {{ authorName.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="font-black text-gray-900 dark:text-white">{{ authorName }}</div>
                  <div class="text-xs text-gray-500">感谢您的支持</div>
                </div>
              </div>

              <!-- 我的余额 -->
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <span class="text-sm font-bold text-gray-600 dark:text-gray-400">我的余额</span>
                <div class="flex items-center gap-1 text-lg font-black text-[#FF4D94]">
                  <Coins class="w-5 h-5" />
                  <span>{{ profile?.balance || 0 }}</span>
                </div>
              </div>

              <!-- 快捷金额 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">选择金额</label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="amount in quickAmounts"
                    :key="amount"
                    @click="selectAmount(amount)"
                    :class="[
                      'py-3 rounded-xl font-bold transition-all',
                      selectedAmount === amount
                        ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10'
                    ]"
                  >
                    {{ amount }}
                  </button>
                </div>
              </div>

              <!-- 自定义金额 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">自定义金额 (1-100)</label>
                <input
                  v-model="customAmount"
                  @input="handleCustomAmount"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="输入金额"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent bg-white dark:bg-white/5"
                />
              </div>

              <!-- 留言 -->
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">留言（可选）</label>
                <textarea
                  v-model="message"
                  placeholder="说点什么..."
                  rows="3"
                  maxlength="200"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#FF4D94] focus:border-transparent resize-none bg-white dark:bg-white/5"
                ></textarea>
                <div class="text-xs text-gray-400 text-right mt-1">{{ message.length }}/200</div>
              </div>

              <!-- 错误提示 -->
              <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {{ error }}
              </div>

              <!-- 确认按钮 -->
              <button
                @click="handleTip"
                :disabled="!canTip || loading"
                :class="[
                  'w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2',
                  canTip && !loading
                    ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                ]"
              >
                <Send class="w-5 h-5" />
                <span v-if="loading">打赏中...</span>
                <span v-else-if="selectedAmount > 0">确认打赏 {{ selectedAmount }} 积分</span>
                <span v-else>请选择金额</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
