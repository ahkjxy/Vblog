<script setup lang="ts">
import { 
  Sparkles, 
  BookOpen, 
  FolderOpen, 
  Tag, 
  Calendar, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X 
} from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'

const { user, profile, fetchProfile } = useAuth()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const router = useRouter()

const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => {
  isDropdownOpen.value = false
})

const navLinks = [
  { name: '社区讨论', href: '/blog', icon: BookOpen },
  { name: '分类', href: '/categories', icon: FolderOpen },
  { name: '标签', href: '/tags', icon: Tag },
  { name: '更新日志', href: '/changelog', icon: Calendar },
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  await client.auth.signOut()
  isDropdownOpen.value = false
  isMobileMenuOpen.value = false
  if (import.meta.client) {
    window.location.href = `${config.public.siteUrl}/auth/unified`
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-gray-100/50 bg-white/90 backdrop-blur-xl shadow-sm">
    <div class="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink href="/" class="flex items-center gap-2 md:gap-3 group">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-xl md:rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div class="relative w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white p-1.5 md:p-2 shadow-lg group-hover:scale-105 transition-transform">
            <Logo class="w-full h-full" />
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-base md:text-xl font-black tracking-tight bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent leading-tight">
            元气银行
          </span>
          <span class="text-[10px] md:text-xs text-gray-500 font-bold hidden sm:block uppercase tracking-wider">Family Bank</span>
        </div>
      </NuxtLink>
      
      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-2">
        <NuxtLink 
          v-for="link in navLinks" 
          :key="link.href"
          :to="link.href"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all"
        >
          <component :is="link.icon" class="w-4 h-4" />
          <span>{{ link.name }}</span>
        </NuxtLink>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <a 
          href="https://www.familybank.chat" 
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all"
        >
          <Sparkles class="w-4 h-4" />
          <span>元气银行</span>
        </a>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <template v-if="user">
          <div class="relative" ref="dropdownRef">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-purple-50 transition-all group"
            >
              <div v-if="profile?.avatar_url || user.user_metadata?.avatar_url" class="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-purple-200 group-hover:border-purple-400 transition-colors">
                <img :src="profile?.avatar_url || user.user_metadata.avatar_url" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-md">
                <span class="text-white text-xs md:text-sm font-bold">
                  {{ (profile?.name || user.user_metadata?.name || user.email)?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="text-sm font-semibold text-gray-800">{{ profile?.name || user.user_metadata?.name || user.email?.split('@')[0] }}</span>
              <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" />
            </button>

            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-if="isDropdownOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-purple-100 py-2 overflow-hidden">
                <div class="px-4 py-4 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5 border-b border-gray-100">
                  <p class="text-sm font-bold text-gray-900">{{ profile?.name || user.user_metadata?.name || user.email?.split('@')[0] }}</p>
                  <div class="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white rounded-full text-xs font-bold">
                    <Sparkles class="w-3 h-3 text-[#FF4D94]" />
                    <span class="text-[#FF4D94]">社区成员</span>
                  </div>
                </div>
                
                <div class="py-2">
                  <NuxtLink
                    to="/dashboard"
                    @click="isDropdownOpen = false"
                    class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#FF4D94]/5 hover:text-[#FF4D94] transition-colors"
                  >
                    <div class="w-8 h-8 rounded-lg bg-[#FF4D94]/10 flex items-center justify-center">
                      <LayoutDashboard class="w-4 h-4 text-[#FF4D94]" />
                    </div>
                    <span>进入 Blog 后台</span>
                  </NuxtLink>
                  
                  <a
                    href="https://www.familybank.chat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#FF4D94]/5 hover:text-[#FF4D94] transition-colors"
                  >
                    <div class="w-8 h-8 rounded-lg bg-[#FF4D94]/10 flex items-center justify-center">
                      <Sparkles class="w-4 h-4 text-[#FF4D94]" />
                    </div>
                    <span>进入元气银行后台</span>
                  </a>
                  
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut class="w-4 h-4 text-red-600" />
                    </div>
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </template>
        <template v-else>
          <NuxtLink 
            to="/auth/unified" 
            class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black shadow-[0_10px_20px_-5px_rgba(255,77,148,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(255,77,148,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles class="w-4 h-4" />
            <span>登录</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Mobile Menu Button -->
      <div class="flex items-center gap-2 lg:hidden">
        <NuxtLink v-if="user" 
          to="/dashboard"
          class="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
        >
          <LayoutDashboard class="w-4 h-4 text-purple-600" />
        </NuxtLink>
        <button
          @click="toggleMobileMenu"
          class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors"
        >
          <X v-if="isMobileMenuOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="lg:hidden border-t border-purple-100 bg-white shadow-xl">
        <nav class="container mx-auto px-4 py-4 space-y-1">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.href"
            :to="link.href"
            @click="closeMobileMenu"
            class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all"
          >
            <component :is="link.icon" class="w-5 h-5" />
            <span>{{ link.name }}</span>
          </NuxtLink>
          
          <div class="h-px bg-gray-100 my-2"></div>
          
          <a 
            href="https://www.familybank.chat" 
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all"
          >
            <Sparkles class="w-5 h-5" />
            <span>元气银行</span>
          </a>
          
          <template v-if="user">
            <div class="h-px bg-gray-100 my-2"></div>
            <div class="px-4 py-3 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5 rounded-xl">
              <div class="flex items-center gap-3 mb-3">
                <div v-if="user.user_metadata?.avatar_url" class="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200">
                  <img :src="user.user_metadata.avatar_url" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <span class="text-white text-sm font-bold">
                    {{ user.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ profile?.name || user.user_metadata?.name || user.email?.split('@')[0] }}</p>
                  <p class="text-xs text-[#FF4D94] font-bold">社区成员</p>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors shadow-sm"
              >
                <LogOut class="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="h-px bg-gray-100 my-2"></div>
            <NuxtLink 
              to="/auth/unified"
              @click="closeMobileMenu"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black"
            >
              <Sparkles class="w-4 h-4" />
              <span>登录</span>
            </NuxtLink>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>
