<script setup lang="ts">


definePageMeta({
  layout: 'auth'
})

type Mode = 'password' | 'magic'

const mode = ref<Mode>('password')
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

const route = useRoute()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const router = useRouter()

// 获取重定向目标
const redirectTarget = (route.query.redirect as string) || 'blog'
const returnUrl = route.query.returnUrl as string

const showToast = (type: 'success' | 'error' | 'info', text: string) => {
  message.value = { type, text }
  setTimeout(() => message.value = null, 5000)
}

const handlePasswordAuth = async () => {
  if (!email.value || !password.value) {
    showToast('error', '请输入邮箱和密码')
    return
  }
  
  loading.value = true
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      if (error.message === "Invalid login credentials") {
        // 尝试注册
        const { error: signUpError } = await client.auth.signUp({
          email: email.value,
          password: password.value,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTarget}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`,
          }
        })
        if (signUpError) throw signUpError
        showToast('info', '注册成功！请前往邮箱验证链接以完成激活')
      } else {
        throw error
      }
    } else {
      showToast('success', '登录成功，正在进入...')
      navigateToDashboard()
    }
  } catch (err: any) {
    showToast('error', err.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const navigateToDashboard = () => {
  if (returnUrl) {
    window.location.href = returnUrl
  } else if (redirectTarget === 'family') {
    window.location.href = config.public.familyBankUrl
  } else {
    router.push('/dashboard')
  }
}

const handleMagicLink = async () => {
  if (!email.value) {
    showToast('error', '请输入邮箱')
    return
  }
  
  loading.value = true
  try {
    const { error } = await client.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTarget}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`,
      }
    })
    if (error) throw error
    showToast('info', '已发送登录链接，请前往邮箱点击确认')
  } catch (err: any) {
    showToast('error', err.message || '发送失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] sm:px-6 py-12 relative overflow-hidden">
    <!-- Abstract Background Orbs -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-pink/10 blur-[120px] rounded-full animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/10 blur-[100px] rounded-full animate-pulse duration-[4000ms]"></div>
    
    <div class="w-full sm:max-w-[420px] bg-white sm:bg-white/80 backdrop-blur-3xl sm:rounded-[48px] sm:shadow-[0_32px_100px_-24px_rgba(0,0,0,0.12)] sm:border border-white/50 p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
      <div class="space-y-3 text-center">
        <NuxtLink to="/" class="inline-block">
          <div class="relative inline-block">
            <div class="absolute -inset-4 bg-gradient-to-br from-brand-pink to-brand-purple opacity-30 blur-2xl rounded-full animate-pulse" />
            <div class="w-16 h-16 bg-gradient-to-br from-brand-pink to-brand-purple rounded-[24px] flex items-center justify-center relative shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 group overflow-hidden">
              <Logo class="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        </NuxtLink>
        
        <div class="mt-2 text-center">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink">
            {{ redirectTarget === 'family' ? '家 庭 系 统' : '元 气 银 行' }}
          </p>
          <h2 class="text-3xl font-black text-gray-900 tracking-tighter mt-1">
            {{ redirectTarget === 'family' ? '欢迎来到元气银行' : '统一认证中心' }}
          </h2>
        </div>
      </div>

      <div v-if="message" :class="`p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`">
        {{ message.text }}
      </div>

      <!-- Mode Switch -->
      <div class="flex gap-1.5 p-1 bg-gray-50 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-brand-pink">
        <button @click="mode = 'password'" :class="`flex-1 py-3.5 rounded-[18px] transition-all ${mode === 'password' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`">
          密码登录 / 注册
        </button>
        <button @click="mode = 'magic'" :class="`flex-1 py-3.5 rounded-[18px] transition-all ${mode === 'magic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`">
          魔法链接
        </button>
      </div>

      <form v-if="mode === 'password'" @submit.prevent="handlePasswordAuth" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700">电子邮箱</label>
          <input v-model="email" type="email" placeholder="请输入您的邮箱" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple outline-none transition-all" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700">通行密码</label>
          <input v-model="password" type="password" placeholder="请输入您的密码" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple outline-none transition-all" />
        </div>
        <button type="submit" :disabled="loading" class="w-full py-4 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50">
          {{ loading ? '处理中...' : '一键登录' }}
        </button>
      </form>

      <form v-else @submit.prevent="handleMagicLink" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-bold text-gray-700">验证邮箱</label>
          <input v-model="email" type="email" placeholder="you@example.com" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple outline-none transition-all" />
        </div>
        <button type="submit" :disabled="loading" class="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50">
          {{ loading ? '发送中...' : '发送魔法链接' }}
        </button>
      </form>

      <div class="text-center text-sm text-gray-500">
        还没有元气银行账号？
        <a href="https://www.familybank.chat" class="text-brand-pink font-bold hover:underline">前往注册</a>
      </div>
    </div>
  </div>
</template>
