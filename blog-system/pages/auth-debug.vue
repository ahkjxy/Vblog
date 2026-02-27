<script setup lang="ts">
definePageMeta({
  middleware: [] // 不使用任何 middleware，允许未登录访问
})

const debugInfo = ref<any>({})
const loading = ref(true)

onMounted(async () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  
  try {
    // 1. 检查客户端 user
    debugInfo.value.clientUser = {
      exists: !!user.value,
      id: user.value?.id,
      email: user.value?.email,
    }

    // 2. 检查 session
    const { data: { session }, error: sessionError } = await client.auth.getSession()
    debugInfo.value.session = {
      exists: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      expiresAt: session?.expires_at,
      error: sessionError?.message,
    }

    // 3. 检查 cookies
    if (process.client) {
      const cookies = document.cookie.split(';').map(c => c.trim())
      debugInfo.value.cookies = {
        all: cookies,
        supabaseCookies: cookies.filter(c => c.includes('sb-')),
      }
    }

    // 4. 检查 profile
    if (user.value) {
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      debugInfo.value.profile = {
        exists: !!profile,
        data: profile,
        error: profileError?.message,
      }
    }

    // 5. 测试服务端 API
    try {
      const testResponse = await $fetch('/api/auth/test-session')
      debugInfo.value.serverTest = testResponse
    } catch (error: any) {
      debugInfo.value.serverTest = {
        error: error.message
      }
    }

  } catch (error: any) {
    debugInfo.value.error = error.message
  } finally {
    loading.value = false
  }
})

const copyToClipboard = () => {
  navigator.clipboard.writeText(JSON.stringify(debugInfo.value, null, 2))
  alert('调试信息已复制到剪贴板')
}

const refreshPage = () => {
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen py-12 px-4" style="background: var(--app-bg);">
    <div class="max-w-4xl mx-auto">
      <div class="vibrant-card rounded-3xl p-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-black font-display">认证调试信息</h1>
          <div class="flex gap-2">
            <button
              @click="refreshPage"
              class="px-4 py-2 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              刷新页面
            </button>
            <button
              @click="copyToClipboard"
              class="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all"
            >
              复制信息
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="inline-block w-8 h-8 border-4 border-[#FF4D94] border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">加载中...</p>
        </div>

        <div v-else class="space-y-6">
          <div class="bg-gray-50 rounded-xl p-6">
            <h2 class="text-lg font-bold mb-4">1. 客户端用户状态</h2>
            <pre class="text-sm overflow-x-auto">{{ JSON.stringify(debugInfo.clientUser, null, 2) }}</pre>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h2 class="text-lg font-bold mb-4">2. Session 状态</h2>
            <pre class="text-sm overflow-x-auto">{{ JSON.stringify(debugInfo.session, null, 2) }}</pre>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h2 class="text-lg font-bold mb-4">3. Cookies</h2>
            <pre class="text-sm overflow-x-auto">{{ JSON.stringify(debugInfo.cookies, null, 2) }}</pre>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h2 class="text-lg font-bold mb-4">4. Profile 数据</h2>
            <pre class="text-sm overflow-x-auto">{{ JSON.stringify(debugInfo.profile, null, 2) }}</pre>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h2 class="text-lg font-bold mb-4">5. 服务端 Session 测试</h2>
            <pre class="text-sm overflow-x-auto">{{ JSON.stringify(debugInfo.serverTest, null, 2) }}</pre>
          </div>

          <div v-if="debugInfo.error" class="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 class="text-lg font-bold text-red-600 mb-4">错误信息</h2>
            <pre class="text-sm text-red-600">{{ debugInfo.error }}</pre>
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <NuxtLink
            to="/dashboard"
            class="px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all"
          >
            尝试访问 Dashboard
          </NuxtLink>
          <NuxtLink
            to="/auth/unified"
            class="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            前往登录页
          </NuxtLink>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p class="text-sm text-blue-800 font-bold mb-2">测试步骤：</p>
          <ol class="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>登录后访问此页面</li>
            <li>检查所有信息是否正确</li>
            <li>点击"刷新页面"按钮</li>
            <li>查看刷新后信息是否还在</li>
            <li>如果刷新后信息消失，说明 SSR session 读取有问题</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
