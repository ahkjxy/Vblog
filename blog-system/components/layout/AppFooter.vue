<script setup lang="ts">
import { 
  Heart, 
  Github, 
  Mail, 
  ExternalLink, 
  Globe, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-vue-next'

const currentYear = new Date().getFullYear()

const footerLinks = {
  products: [
    { name: '元气银行', href: 'https://www.familybank.chat' },
    { name: '积分广场', href: 'https://www.familybank.chat/explore' },
  ],
  resources: [
    { name: '技术文档', href: '/docs' },
    { name: 'API 参考', href: '/api' },
    { name: '更新日志', href: '/changelog' },
  ],
  legal: [
    { name: '隐私政策', href: '/privacy' },
    { name: '用户协议', href: '/terms' },
    { name: '免责声明', href: '/disclaimer' },
  ]
}
</script>

<template>
  <footer class="bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-white/5 pt-16 sm:pt-20 pb-10 transition-colors">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-16 sm:mb-20">
        <!-- Logo & Bio -->
        <div class="space-y-6">
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-xl md:rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div class="relative w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#FF4D94] via-[#FF7AB8] to-[#7C4DFF] flex items-center justify-center text-white p-1.5 md:p-2 shadow-[0_8px_20px_-6px_rgba(255,77,148,0.5)] group-hover:scale-110 transition-transform duration-300">
                <Logo class="w-full h-full" />
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-base md:text-xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] leading-tight">
                元气银行
              </span>
              <span class="text-[10px] md:text-xs text-[#FF4D94] font-bold uppercase tracking-[0.2em] opacity-80">Family Bank</span>
            </div>
          </NuxtLink>
          <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
            元气银行社区。我们致力于通过游戏化的方式，让家庭教育变得更有趣、更有成就感，记录每一个好习惯的养成。
          </p>
          <div class="flex items-center gap-3">
            <a href="https://github.com/ahkjxy" target="_blank" class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#FF4D94] hover:scale-110 active:scale-95 transition-all duration-300">
              <Github class="w-5 h-5" />
            </a>
            <a href="mailto:ahkjxy@qq.com" class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#FF4D94] hover:scale-110 active:scale-95 transition-all duration-300">
              <Mail class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Links Groups -->
        <div v-for="(links, group) in footerLinks" :key="group" class="space-y-6 font-medium">
          <h3 class="text-gray-900 dark:text-white font-black text-sm uppercase tracking-[0.2em]">
            {{ group === 'products' ? '旗下产品' : group === 'resources' ? '相关资源' : '法律条规' }}
          </h3>
          <ul class="space-y-4">
            <li v-for="link in links" :key="link.name">
              <template v-if="link.href.startsWith('http')">
                <a 
                  :href="link.href" 
                  target="_blank"
                  class="text-gray-500 dark:text-gray-400 hover:text-[#FF4D94] transition-all duration-300 text-sm flex items-center gap-1.5 group"
                >
                  <span>{{ link.name }}</span>
                  <ExternalLink class="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              </template>
              <template v-else>
                <NuxtLink 
                  :to="link.href"
                  class="text-gray-500 dark:text-gray-400 hover:text-[#FF4D94] transition-all duration-300 text-sm"
                >
                  {{ link.name }}
                </NuxtLink>
              </template>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="pt-10 border-t border-gray-50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500">
        <div class="flex items-center gap-2">
          <span>© {{ currentYear }} 元气银行</span>
          <span class="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></span>
          <span class="flex items-center gap-1">
            Made with <Heart class="w-3 h-3 text-[#FF4D94] fill-[#FF4D94] animate-pulse" /> by 
            <a href="https://www.familybank.chat" target="_blank" class="text-gray-600 dark:text-gray-400 hover:text-[#FF4D94] transition-colors">元气银行团队</a>
          </span>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <BookOpen class="w-4 h-4" />
            <span>让家庭教育更有趣</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
