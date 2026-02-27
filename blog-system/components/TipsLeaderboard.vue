<script setup lang="ts">
import { Trophy, Coins } from 'lucide-vue-next'

const props = defineProps<{
  postId: string
}>()

const client = useSupabaseClient()
const leaderboard = ref<any[]>([])
const loading = ref(true)

const loadLeaderboard = async () => {
  loading.value = true
  try {
    const { data, error } = await client.rpc('get_post_tips_leaderboard', {
      p_post_id: props.postId,
      p_limit: 10
    })
    
    if (!error && data) {
      leaderboard.value = data
    }
  } catch (err) {
    console.error('加载打赏排行榜失败:', err)
  } finally {
    loading.value = false
  }
}

// 初始加载
onMounted(() => {
  loadLeaderboard()
})

// 暴露刷新方法
const refresh = async () => {
  await loadLeaderboard()
}

defineExpose({ refresh })
</script>

<template>
  <div v-if="!loading && leaderboard.length > 0" class="mt-6 sm:mt-8">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
        <Trophy class="w-5 h-5 text-white" />
      </div>
      <h3 class="text-lg font-black text-gray-900 dark:text-white">打赏排行榜</h3>
    </div>
    
    <div class="space-y-3">
      <div
        v-for="(item, index) in leaderboard"
        :key="item.user_id"
        class="flex items-center gap-3 p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl hover:shadow-md transition-all"
      >
        <!-- 排名 -->
        <div 
          :class="[
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black',
            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md' :
            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md' :
            'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'
          ]"
        >
          {{ index + 1 }}
        </div>
        
        <!-- 用户头像 -->
        <div v-if="item.user_avatar" class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          <img :src="item.user_avatar" :alt="item.user_name" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          {{ item.user_name?.charAt(0).toUpperCase() || 'U' }}
        </div>
        
        <!-- 用户信息 -->
        <div class="flex-1 min-w-0">
          <div class="font-black text-sm text-gray-900 dark:text-white truncate">{{ item.user_name }}</div>
          <div v-if="item.latest_message" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {{ item.latest_message }}
          </div>
        </div>
        
        <!-- 打赏金额 -->
        <div class="flex items-center gap-1 text-[#FF4D94] font-black flex-shrink-0">
          <Coins class="w-4 h-4" />
          <span class="text-lg">{{ item.total_amount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
