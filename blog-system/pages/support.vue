<script setup lang="ts">
import { 
  MessageCircle, 
  Send, 
  User, 
  HelpCircle, 
  Search,
  ChevronRight
} from 'lucide-vue-next'

useSeoMeta({
  title: '帮助与支持',
  description: '遇到问题了？查看常见问题或联系我们的团队获取帮助。'
})

const faqs = [
  { q: '如何注册家庭账号？', a: '直接访问元气银行官网，通过邮箱注册即可。一个账号可以管理多个家庭。' },
  { q: '积分系统怎么玩？', a: '家长设定任务（如按时完成作业），孩子完成后获得积分，积分可以兑换愿望。' },
  { q: '数据安全吗？', a: '我们使用 Supabase 的企业级加密技术，确保您的家庭数据仅对自己可见。' }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <header class="bg-white border-b border-gray-100 pt-16 pb-12">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">寻求帮助</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto">
          遇到问题了？看看常见问题，或者直接联系我们的团队。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-16 max-w-4xl space-y-16">
      <!-- Search -->
      <div class="relative max-w-2xl mx-auto">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input type="text" placeholder="搜索问题..." class="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[32px] shadow-xl font-bold outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all" />
      </div>

      <!-- FAQs -->
      <section class="space-y-6">
        <h2 class="text-2xl font-black text-gray-900 px-4">常见问题</h2>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="faq in faqs" :key="faq.q" class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-4">
                <h3 class="text-lg font-black text-gray-900 group-hover:text-brand-pink transition-colors">{{ faq.q }}</h3>
                <p class="text-gray-500 font-medium leading-relaxed">{{ faq.a }}</p>
              </div>
              <HelpCircle class="w-6 h-6 text-gray-200 group-hover:text-brand-pink/30 flex-shrink-0" />
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Card -->
      <section class="bg-gradient-to-br from-brand-pink to-brand-purple p-12 rounded-[48px] text-white text-center shadow-2xl relative overflow-hidden group">
        <div class="relative z-10">
          <MessageCircle class="w-16 h-16 mx-auto mb-8 opacity-50 group-hover:scale-110 transition-transform" />
          <h2 class="text-3xl font-black mb-4">没有找到答案？</h2>
          <p class="text-white/80 font-medium mb-12 max-w-md mx-auto">直接联系我们的支持邮箱，我们会在 24 小时内回复您。</p>
          <a href="mailto:support@catchi.io" class="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-pink rounded-2xl font-black hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
            发送邮件联系我们
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
