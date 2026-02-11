<script setup lang="ts">
import {
  Home, LayoutDashboard, FileText, Image, FolderOpen, Tag,
  MessageSquare, MessageCircle, Users, Settings, LogOut, Menu, X
} from 'lucide-vue-next'

const client = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 获取用户信息
const { data: userProfile } = await useAsyncData('user-profile', async () => {
  if (!user.value) return null
  
  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single()
  
  return data
})

// 检查是否是超级管理员
const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
const isSuperAdmin = computed(() => 
  userProfile.value?.role === 'admin' && userProfile.value?.family_id === SUPER_ADMIN_FAMILY_ID
)

const userName = computed(() => 
  userProfile.value?.name || user.value?.email?.split('@')[0] || '用户'
)

const userAvatar = computed(() => userProfile.value?.avatar_url)

const getRoleLabel = () => {
  if (isSuperAdmin.value) return '超级管理员'
  if (userProfile.value?.role === 'admin') return '家长'
  if (userProfile.value?.role === 'editor') return '编辑'
  return '作者'
}

// 导航菜单
const navItems = computed(() => {
  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: '概览' },
    { href: '/dashboard/posts', icon: FileText, label: '文章' },
    { href: '/dashboard/media', icon: Image, label: '媒体库' },
  ]

  if (isSuperAdmin.value) {
    items.push(
      { href: '/dashboard/categories', icon: FolderOpen, label: '分类' },
      { href: '/dashboard/tags', icon: Tag, label: '标签' },
      { href: '/dashboard/comments', icon: MessageSquare, label: '评论' },
      { href: '/dashboard/users', icon: Users, label: '用户' },
      { href: '/dashboard/settings', icon: Settings, label: '设置' }
    )
  }

  return items
})

// 判断是否激活
const isActive = (href: string) => {
  if (href === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(href)
}

// 退出登录
const handleLogout = async () => {
  await client.auth.signOut()
  navigateTo('/auth/unified')
}

// 关闭移动端菜单
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
    <!-- Top Bar - Desktop -->
    <div class="hidden lg:block fixed top-0 right-0 left-72 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-40 shadow-sm">
      <div class="flex items-center justify-between px-6 lg:px-8 py-4">
        <div class="text-sm font-bold text-gray-600">
          欢迎回来，<span class="text-[#FF4D94] font-black">{{ userName + '的家庭' }}</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div v-if="userAvatar" class="w-9 h-9 rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden">
              <img 
                :src="userAvatar" 
                :alt="userName"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-sm border-2 border-white">
              <span class="text-white text-sm font-black">
                {{ userName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex flex-col">
              <div class="text-sm font-black text-gray-900">{{ userName + '的家庭' }}</div>
              <div :class="['text-xs font-bold', isSuperAdmin ? 'text-[#FF4D94]' : 'text-gray-500']">
                {{ getRoleLabel() }}
              </div>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all text-sm font-bold"
          >
            <LogOut class="w-4 h-4" />
            <span>退出</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex">
      <!-- Sidebar - Desktop -->
      <aside class="hidden lg:flex lg:flex-col w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 min-h-screen fixed left-0 top-0 shadow-xl">
        <!-- Logo Section -->
        <div class="p-6 border-b border-gray-100 flex-shrink-0">
          <NuxtLink to="/dashboard" class="flex items-center gap-3 group">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div class="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white p-2.5 shadow-lg group-hover:scale-105 transition-transform">
                <Logo class="w-full h-full" />
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-lg font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">元气银行</span>
              <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">管理后台</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <div class="flex-1 overflow-y-auto p-5">
          <nav class="space-y-1.5">
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              :class="[
                'group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold relative overflow-hidden',
                isActive(item.href)
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg shadow-[#FF4D94]/20'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 hover:text-[#FF4D94]'
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'w-5 h-5 relative z-10 transition-colors',
                  isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-[#FF4D94]'
                ]"
              />
              <span class="relative z-10">{{ item.label }}</span>
              <div v-if="isActive(item.href)" class="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/40 rounded-l-full"></div>
            </NuxtLink>
          </nav>
        </div>

        <!-- Bottom Actions -->
        <div class="p-5 border-t border-gray-100 space-y-2 flex-shrink-0">
          <a 
            href="https://www.familybank.chat/"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white transition-all text-sm font-black hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>家庭积分系统</span>
          </a>
          <NuxtLink 
            to="/" 
            class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all text-sm font-bold text-gray-700 hover:text-[#FF4D94] border border-gray-100 hover:border-[#FF4D94]/30"
          >
            <Home class="w-5 h-5" />
            <span>返回首页</span>
          </NuxtLink>
        </div>
      </aside>

      <!-- Mobile Header -->
      <div class="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50 shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <NuxtLink to="/dashboard" class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white p-2 shadow-lg">
              <Logo class="w-full h-full" />
            </div>
            <span class="text-base font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">元气银行</span>
          </NuxtLink>
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6 text-gray-700" />
            <X v-else class="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="border-t border-gray-100 bg-white">
          <nav class="p-4 space-y-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold',
                isActive(item.href)
                  ? 'bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
          <div class="p-4 border-t border-gray-100">
            <button
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-bold"
            >
              <LogOut class="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <main class="flex-1 lg:ml-72 lg:mt-[73px] p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
