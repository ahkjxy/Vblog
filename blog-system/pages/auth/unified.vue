<script setup lang="ts">
definePageMeta({
  layout: false
})

const client = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
const showResetRequest = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)

// 获取重定向目标：blog 或 family
const redirectTarget = (route.query.redirect as string) || 'blog' // 默认为 blog
const returnUrl = route.query.returnUrl as string // 自定义返回 URL

onMounted(() => {
  const msg = route.query.message as string
  if (msg) {
    message.value = { type: 'info', text: msg }
  }
})

const showToast = (type: 'success' | 'error' | 'info', text: string) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 5000)
}

const handlePasswordAuth = async (e: Event) => {
  e.preventDefault()
  
  const em = email.value.trim()
  const pw = password.value.trim()
  
  if (!em || !pw) {
    showToast('error', '请输入邮箱和密码')
    return
  }
  
  loading.value = true

  try {
    // 1. 尝试登录
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: em,
      password: pw,
    })

    if (!signInError && signInData?.session) {
      showToast('success', '登录成功，正在进入...')
      // 根据 redirect 参数跳转到不同系统
      if (returnUrl) {
        window.location.href = returnUrl
      } else if (redirectTarget === 'family') {
        window.location.href = 'https://www.familybank.chat'
      } else {
        window.location.href = '/dashboard'
      }
      return
    }

    // 如果是其他错误（如"Email not confirmed"），直接提示
    const isCredentialError = signInError?.message === "Invalid login credentials"
    if (signInError && !isCredentialError) {
      showToast('error', signInError.message)
      return
    }

    // 2. 如果是凭证错误，尝试注册（可能是新用户）
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: em,
      password: pw,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTarget}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`,
        data: {
          username: em.split('@')[0],
        }
      }
    })

    if (signUpError) {
      // 注册失败
      console.error('注册错误:', signUpError)
      
      // 检查是否是用户已存在的错误
      const userExistsErrors = [
        'User already registered',
        'Database error',
        'already been registered',
        'duplicate key value'
      ]
      
      const isUserExists = userExistsErrors.some(msg => 
        signUpError.message?.toLowerCase().includes(msg.toLowerCase())
      )
      
      if (isUserExists) {
        // 用户已存在，说明是密码错误
        showToast('error', '密码错误，如忘记密码请点击下方找回')
      } else {
        // 其他注册错误
        showToast('error', `注册失败: ${signUpError.message}`)
      }
    } else {
      // 注册成功
      
      if (signUpData?.session) {
        // 自动登录成功
        showToast('success', '注册并登录成功，欢迎加入元气银行!')
        // 根据 redirect 参数跳转到不同系统
        if (returnUrl) {
          window.location.href = returnUrl
        } else if (redirectTarget === 'family') {
          window.location.href = 'https://www.familybank.chat'
        } else {
          window.location.href = '/dashboard'
        }
      } else if (signUpData?.user) {
        // 注册成功但需要验证邮件
        showToast('info', '注册成功！请前往邮箱验证链接以完成激活')
      } else {
        // 未知情况
        showToast('error', '注册状态未知，请刷新页面重试')
      }
    }

  } catch (err) {
    console.error('认证错误:', err)
    showToast('error', (err as Error)?.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const handleResetPassword = () => {
  resetEmail.value = email.value.trim()
  showResetRequest.value = true
}

const handleSendReset = async () => {
  const em = resetEmail.value.trim()
  
  if (!em) {
    showToast('error', '请输入邮箱')
    return
  }
  
  resetLoading.value = true
  
  try {
    const { error } = await client.auth.resetPasswordForEmail(em, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTarget}${returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`,
    })
    
    if (error) throw error
    showToast('success', '重置邮件已发送，请查收邮箱并按链接设置新密码')
    showResetRequest.value = false
  } catch (err) {
    showToast('error', (err as Error)?.message || '发送失败')
  } finally {
    resetLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] sm:px-6 py-12 relative overflow-hidden">
    <!-- Abstract Background Orbs -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D94]/10 blur-[120px] rounded-full animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C4DFF]/10 blur-[100px] rounded-full animate-pulse duration-[4000ms]"></div>
    
    <div class="w-full sm:max-w-[420px] bg-white sm:bg-white/80 backdrop-blur-3xl sm:rounded-[48px] sm:shadow-[0_32px_100px_-24px_rgba(0,0,0,0.12)] sm:border border-white/50 p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
      <div class="space-y-3 text-center">
        <NuxtLink to="/" class="inline-block">
          <div class="relative inline-block">
            <div class="absolute -inset-4 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] opacity-30 blur-2xl rounded-full animate-pulse" />
            <div class="w-16 h-16 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-[24px] flex items-center justify-center relative shadow-2xl shadow-[#FF4D94]/30 rotate-3 hover:rotate-0 transition-all duration-500 group overflow-hidden">
              <div class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Logo class="w-8 h-8 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
            </div>
          </div>
        </NuxtLink>
        
        <div class="mt-2">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D94]">
            {{ redirectTarget === 'family' ? '家 庭 系 统' : '元 气 银 行' }}
          </p>
          <h2 class="text-3xl font-black text-gray-900 tracking-tighter mt-1">
            {{ redirectTarget === 'family' ? '欢迎来到元气银行' : '统一认证中心' }}
          </h2>
          <p class="text-[11px] font-bold text-gray-400 leading-snug mt-2 max-w-[240px] mx-auto opacity-80">
            {{ redirectTarget === 'family' 
              ? '管理家庭积分，记录成长点滴' 
              : '一个账号，通行所有服务' }}
          </p>
        </div>
      </div>

      <div
        v-if="message"
        :class="[
          'p-4 rounded-xl text-sm',
          message.type === 'error' && 'bg-red-50 text-red-600 border border-red-200',
          message.type === 'success' && 'bg-green-50 text-green-600 border border-green-200',
          message.type === 'info' && 'bg-blue-50 text-blue-600 border border-blue-200'
        ]"
      >
        {{ message.text }}
      </div>

      <form @submit="handlePasswordAuth" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            电子邮箱
          </label>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
            placeholder="请输入您的邮箱"
            :disabled="loading"
            autocomplete="email"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            通行密码
          </label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
            placeholder="请输入您的密码"
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>
        
        <div class="pt-4 space-y-4">
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl hover:shadow-[#FF4D94]/20 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span v-else>一键登录</span>
          </button>
          
          <button
            type="button"
            :disabled="loading"
            @click="handleResetPassword"
            class="w-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-[#7C4DFF] transition-colors pb-2"
          >
            忘记密码？点击找回
          </button>
        </div>
      </form>

      <div class="pt-6 text-center">
        <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center justify-center gap-3 opacity-60">
          <span class="w-10 h-px bg-gray-100"></span>
          SUPABASE 安全支持
          <span class="w-10 h-px bg-gray-100"></span>
        </p>
      </div>

      <div class="text-center text-sm text-gray-600">
        <p>
          还没有元气银行账号？
          <a 
            href="https://www.familybank.chat" 
            class="text-[#FF4D94] hover:text-[#7C4DFF] font-bold ml-1 transition-colors"
          >
            前往注册
          </a>
        </p>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div
      v-if="showResetRequest"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showResetRequest = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div class="mb-6">
          <p class="text-xs font-bold text-[#FF4D94] uppercase tracking-[0.4em]">Reset Portal</p>
          <h3 class="text-2xl font-black text-gray-900 tracking-tight mt-2">找回通行密码</h3>
          <p class="text-sm font-medium text-gray-500 mt-2">
            我们将发送重置链接到您的注册邮箱
          </p>
        </div>
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">
              验证邮箱 / Email
            </label>
            <input
              v-model="resetEmail"
              type="email"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:border-transparent transition-all"
              placeholder="you@example.com"
              :disabled="resetLoading"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showResetRequest = false"
              :disabled="resetLoading"
              class="flex-1 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              取消
            </button>
            <button
              type="button"
              @click="handleSendReset"
              :disabled="resetLoading"
              class="flex-1 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <div v-if="resetLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>发送邮件</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
