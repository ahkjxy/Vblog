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
  <footer class="bg-white border-t border-gray-100 pt-16 sm:pt-20 pb-10">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-16 sm:mb-20">
        <!-- Logo & Bio -->
        <div class="space-y-6">
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div class="w-10 h-10 bg-gradient-to-br from-brand-pink to-brand-purple rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Logo class="w-6 h-6" />
            </div>
            <span class="text-xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
              元气银行博客
            </span>
          </NuxtLink>
          <p class="text-gray-500 text-sm leading-relaxed font-medium">
            元气银行官方博客。我们致力于通过游戏化的方式，让家庭教育变得更有趣、更有成就感，记录每一个好习惯的养成。
          </p>
          <div class="flex items-center gap-4">
            <a href="https://github.com/liaoyuan" target="_blank" class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-pink hover:bg-brand-pink/5 hover:scale-110 transition-all">
              <Github class="w-5 h-5" />
            </a>
            <a href="mailto:contact@familybank.chat" class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-brand-pink hover:bg-brand-pink/5 hover:scale-110 transition-all">
              <Mail class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Links Groups -->
        <div v-for="(links, group) in footerLinks" :key="group" class="space-y-6 font-medium">
          <h3 class="text-gray-900 font-black text-sm uppercase tracking-[0.2em]">
            {{ group === 'products' ? '旗下产品' : group === 'resources' ? '相关资源' : '法律条规' }}
          </h3>
          <ul class="space-y-4">
            <li v-for="link in links" :key="link.name">
              <template v-if="link.href.startsWith('http')">
                <a 
                  :href="link.href" 
                  target="_blank"
                  class="text-gray-500 hover:text-brand-pink transition-colors text-sm flex items-center gap-1.5"
                >
                  {{ link.name }}
                  <ExternalLink class="w-3 h-3 opacity-50" />
                </a>
              </template>
              <template v-else>
                <NuxtLink 
                  :to="link.href"
                  class="text-gray-500 hover:text-brand-pink transition-colors text-sm"
                >
                  {{ link.name }}
                </NuxtLink>
              </template>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs sm:text-sm font-bold text-gray-400">
        <div class="flex items-center gap-2">
          <span>© {{ currentYear }} 元气银行</span>
          <span class="w-1 h-1 rounded-full bg-gray-200"></span>
          <span class="flex items-center gap-1">
            Made with <Heart class="w-3 h-3 text-brand-pink fill-brand-pink" /> by 
            <a href="https://www.familybank.chat" target="_blank" class="text-gray-600 hover:text-brand-pink">元气银行团队</a>
          </span>
        </div>
        <div class="flex items-center gap-6">
          <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-brand-pink transition-colors flex items-center gap-1.5">
            <ShieldCheck class="w-4 h-4" />
            粤ICP备2024254xxx号
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
