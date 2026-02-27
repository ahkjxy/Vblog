<script setup lang="ts">
definePageMeta({
  middleware: [] // 不使用任何 middleware
})

// 不使用 middleware，手动测试认证
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const status = ref('checking')
const info = ref<any>({})

onMounted(async () => {
  try {
    // 1. 检查 user
    info.value.user = {
      exists: !!user.value,
      id: user.value?.id,
      email: user.value?.email,
    }

    if (!user.value) {
      status.value = 'not_logged_in'
      return
    }

    // 2. 检查 session
    const { data: { session } } = await client.auth.getSession()
    info.value.session = {
      exists: !!session,
      userId: session?.user?.id,
    }

    if (!session) {
      status.value = 'no_session'
      return
    }

    // 3. 检查 profile
    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    info.value.profile = {
      exists: !!profile,
      data: profile,
      error: error?.message,
    }

    if (!profile) {
      status.value = 'no_profile'
      return
    }

    status.value = 'authenticated'
  } catch (error: any) {
    status.value = 'error'
    info.value.error = error.message
  }
})

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToLogin = () => {
  router.push('/auth/unified')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: var(--app-bg);">
    <div class="vibrant-card rounded-3xl p-8 max-w-2xl w-full">
      <h1 class="text-3xl font-black mb-6">认证测试页面</h1>

      <div class="space-y-4">
        <div class="p-4 rounded-xl" :class="{
          'bg-yellow-50 border border-yellow-200': status === 'checking',
          'bg-red-50 border border-red-200': ['not_logged_in', 'no_session', 'no_profile', 'error'].includes(status),
          'bg-green-50 border border-green-200': status === 'authenticated'
        }">
          <p class="font-bold mb-2">状态: {{ status }}</p>
          <pre class="text-sm overflow-x-auto">{{ JSON.stringify(info, null, 2) }}</pre>
        </div>

        <div class="flex gap-4">
          <button
            @click="goToDashboard"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all"
          >
            前往 Dashboard
          </button>
          <button
            @click="goToLogin"
            class="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            前往登录页
          </button>
        </div>

        <div class="text-sm text-gray-600">
          <p class="font-bold mb-2">说明：</p>
          <ul class="list-disc list-inside space-y-1">
            <li>这个页面不使用 auth middleware</li>
            <li>手动检查认证状态</li>
            <li>如果状态是 authenticated，点击"前往 Dashboard"应该能正常访问</li>
            <li>如果被重定向回登录页，说明 middleware 有问题</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
