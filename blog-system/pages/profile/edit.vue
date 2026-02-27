<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const name = ref('')
const loading = ref(false)
const message = ref('')

// 加载当前用户信息
const { data: profile } = await useAsyncData('current-profile', async () => {
  if (!user.value) return null
  
  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single()
  
  if (data) {
    name.value = data.name || ''
  }
  
  return data
})

const updateName = async () => {
  if (!name.value.trim()) {
    message.value = '请输入名称'
    return
  }

  loading.value = true
  message.value = ''

  try {
    const response = await $fetch('/api/profile/update-name', {
      method: 'POST',
      body: {
        name: name.value.trim()
      }
    })

    message.value = '更新成功！'
    
    // 刷新页面数据
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error: any) {
    message.value = `更新失败: ${error.message || '未知错误'}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen py-12 px-4" style="background: var(--app-bg);">
    <div class="max-w-2xl mx-auto">
      <div class="vibrant-card rounded-3xl p-8">
        <h1 class="text-3xl font-black font-display mb-2">编辑个人资料</h1>
        <p class="text-gray-600 mb-8">更新您的显示名称</p>

        <div v-if="profile" class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              当前邮箱
            </label>
            <div class="px-4 py-3 bg-gray-50 rounded-xl text-gray-600">
              {{ user?.email }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              当前数据库中的 name 字段
            </label>
            <div class="px-4 py-3 bg-gray-50 rounded-xl text-gray-600">
              {{ profile.name || '(空)' }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              当前数据库中的 name 字段（显示名称）
            </label>
            <div class="px-4 py-3 bg-gray-50 rounded-xl text-gray-600">
              {{ profile.name || '(空)' }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              新的显示名称
            </label>
            <input
              v-model="name"
              type="text"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent"
              placeholder="请输入您的名称"
            />
          </div>

          <div v-if="message" :class="[
            'p-4 rounded-xl text-sm font-bold',
            message.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          ]">
            {{ message }}
          </div>

          <div class="flex gap-4">
            <button
              @click="updateName"
              :disabled="loading"
              class="flex-1 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
            >
              {{ loading ? '更新中...' : '更新名称' }}
            </button>
            <NuxtLink
              to="/dashboard"
              class="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              返回
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
