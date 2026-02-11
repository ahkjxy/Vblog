<script setup lang="ts">
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  FolderOpen, 
  Tag, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Bell,
  ChevronRight,
  Search,
  Heart,
  ShieldCheck
} from 'lucide-vue-next'

const { user, profile } = useAuth()
const client = useSupabaseClient()
const config = useRuntimeConfig()

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const navItems = [
  { group: '核心', items: [
    { name: '概览', href: '/dashboard', icon: LayoutDashboard },
    { name: '文章管理', href: '/dashboard/posts', icon: FileText },
    { name: '评论审核', href: '/dashboard/comments', icon: MessageSquare },
  ]},
  { group: '内容组织', items: [
    { name: '分类管理', href: '/dashboard/categories', icon: FolderOpen },
    { name: '标签管理', href: '/dashboard/tags', icon: Tag },
    { name: '媒体库', href: '/dashboard/media', icon: ImageIcon },
  ]},
  { group: '系统', items: [
    { name: '用户管理', href: '/dashboard/users', icon: Users },
    { name: '系统设置', href: '/dashboard/settings', icon: Settings },
  ]}
]

const handleLogout = async () => {
  await client.auth.signOut()
  window.location.href = `${config.public.siteUrl}/auth/unified`
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FD] flex">
    <!-- Desktop Sidebar -->
    <aside 
      class="hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 z-50"
      :class="isSidebarOpen ? 'w-72' : 'w-24'"
    >
      <div class="p-8 pb-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 group overflow-hidden">
          <div class="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-brand-pink to-brand-purple rounded-xl flex items-center justify-center text-white shadow-lg">
            <Logo class="w-6 h-6" />
          </div>
          <span v-if="isSidebarOpen" class="text-xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent truncate whitespace-nowrap">
            元气银行
          </span>
        </NuxtLink>
      </div>

      <nav class="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
        <div v-for="group in navItems" :key="group.group">
          <p v-if="isSidebarOpen" class="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
            {{ group.group }}
          </p>
          <div class="space-y-1">
            <NuxtLink 
              v-for="item in group.items" 
              :key="item.href"
              :to="item.href"
              class="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all group"
              :class="$route.path === item.href ? 'bg-brand-pink/10 text-brand-pink shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span v-if="isSidebarOpen" class="truncate capitalize">{{ item.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="p-4 mt-auto">
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
          <span v-if="isSidebarOpen">退出登录</span>
        </button>
      </div>

      <!-- Toggle Button -->
      <button 
        @click="toggleSidebar"
        class="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-100 rounded-lg shadow-md flex items-center justify-center text-gray-400 hover:text-brand-pink transition-colors"
      >
        <ChevronRight class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': isSidebarOpen }" />
      </button>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <!-- Search -->
        <div class="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 w-96 group focus-within:border-brand-pink/30 focus-within:bg-white transition-all">
          <Search class="w-4 h-4 text-gray-400 group-focus-within:text-brand-pink" />
          <input type="text" placeholder="全局搜索..." class="bg-transparent text-sm font-bold border-none outline-none w-full text-gray-700 placeholder-gray-400" />
        </div>

        <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 text-gray-500">
          <Menu class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-2 sm:gap-6">
          <NuxtLink to="/" class="hidden sm:flex items-center gap-2 text-xs font-black text-gray-400 hover:text-brand-pink tracking-widest uppercase px-4 py-2 rounded-xl hover:bg-brand-pink/5 transition-all">
            <Home class="w-4 h-4" />
            查看首页
          </NuxtLink>
          
          <button class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-purple transition-all relative">
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-white"></span>
          </button>

          <div class="h-8 w-px bg-gray-100 mx-2"></div>

          <div class="flex items-center gap-3 pl-2">
            <div class="hidden sm:block text-right">
              <div class="text-sm font-black text-gray-900 leading-none mb-1">{{ profile?.name || user?.email?.split('@')[0] }}</div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ profile?.role === 'admin' ? '超级管理员' : '家庭成员' }}</div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-pink to-brand-purple p-0.5">
              <div class="w-full h-full rounded-lg bg-white overflow-hidden flex items-center justify-center font-black text-brand-pink shadow-inner">
                <img v-if="profile?.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" />
                <span v-else>{{ (profile?.name || user?.email)?.[0].toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <slot />
        
        <!-- Dashboard Footer -->
        <footer class="mt-20 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest pb-8">
          <div class="flex items-center gap-2">
            <span>© 2026 元气银行</span>
            <span class="w-1 h-1 rounded-full bg-gray-200"></span>
            <span class="flex items-center gap-1">
              Made with <Heart class="w-3 h-3 text-brand-pink fill-brand-pink" /> by 
              <a href="https://www.familybank.chat" target="_blank" class="text-gray-600 hover:text-brand-pink transition-colors">元气银行团队</a>
            </span>
          </div>
          <div class="flex items-center gap-6">
            <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-brand-pink transition-colors flex items-center gap-2">
              <ShieldCheck class="w-4 h-4" />
              粤ICP备2024254xxx号
            </a>
          </div>
        </footer>
      </main>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 lg:hidden" @click="isMobileMenuOpen = false">
        <div class="w-72 h-full bg-white animate-slide-right p-6 pt-12 flex flex-col" @click.stop>
          <div class="flex items-center justify-between mb-12">
            <Logo class="w-8 h-8 text-brand-pink" />
            <button @click="isMobileMenuOpen = false" class="p-2 bg-gray-50 rounded-lg">
              <X class="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <!-- Mobile Links -->
          <div class="flex-1 space-y-2">
             <NuxtLink 
                v-for="item in navItems.flatMap(g => g.items)" 
                :key="item.href"
                :to="item.href"
                class="flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black text-gray-500 hover:bg-brand-pink/5 hover:text-brand-pink transition-all"
                @click="isMobileMenuOpen = false"
              >
                <component :is="item.icon" class="w-5 h-5" />
                {{ item.name }}
              </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

    <CustomerSupport />
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}

@keyframes slide-right {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-slide-right {
  animation: slide-right 0.3s ease-out;
}
</style>
