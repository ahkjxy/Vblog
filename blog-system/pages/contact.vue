<script setup lang="ts">
import { Send, MessageSquare, Github, Twitter, Calendar } from 'lucide-vue-next'

useSeoMeta({
  title: '联系我们 | 元气银行',
  description: '如果您有任何疑问、建议或需要支持，请通过以下方式联系我们。'
})

const faqs = [
  {
    question: '如何开始使用元气银行？',
    color: '#FF4D94',
    answer: '只需注册账户，创建家庭空间，添加成员，设置任务和奖励即可开始使用。整个过程不超过 5 分钟。'
  },
  {
    question: '元气银行是免费的吗？',
    color: '#7C4DFF',
    answer: '是的，元气银行是一个完全免费的公益平台。所有功能都可以免费使用，没有任何付费限制。我们的目标是让每个家庭都能享受到优质的家庭教育管理工具。'
  },
  {
    question: '为什么网站上有广告？',
    color: '#FF4D94',
    answer: '为了维持平台的持续运营和发展，我们会展示少量广告。所有广告都经过严格筛选，确保不影响您的使用体验。'
  },
  {
    question: '数据安全吗？',
    color: '#7C4DFF',
    answer: '我们使用 Supabase 云服务，采用企业级加密和安全措施，确保您的数据安全。'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-12 sm:pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">联系我们</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          如果您有任何疑问、建议或需要支持，请随时与我们联系。
          我们非常重视每一位用户的反馈。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-8 sm:mt-12 md:mt-16 max-w-6xl">
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8 sm:gap-12 md:gap-16">
        <!-- Contact Methods -->
        <div class="space-y-12 sm:space-y-16 lg:space-y-24">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div class="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Send class="w-6 h-6 sm:w-7 sm:h-7 text-[#FF4D94]" />
              </div>
              <h3 class="text-xl sm:text-2xl font-black mb-3 text-gray-900">电子邮件</h3>
              <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                发送邮件至我们的支持邮箱，我们通常在 24 小时内回复。
              </p>
              <a 
                href="mailto:ahkjxy@qq.com" 
                class="inline-flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-sm sm:text-base transition-colors"
              >
                ahkjxy@qq.com
                <Send class="w-4 h-4" />
              </a>
            </div>

            <div class="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare class="w-6 h-6 sm:w-7 sm:h-7 text-[#7C4DFF]" />
              </div>
              <h3 class="text-xl sm:text-2xl font-black mb-3 text-gray-900">在线客服</h3>
              <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                工作日 9:00-18:00 在线为您服务
              </p>
              <button class="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black text-sm sm:text-base hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                开始对话
                <MessageSquare class="w-4 h-4" />
              </button>
            </div>

            <div class="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#7C4DFF]/10 to-[#FF4D94]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Github class="w-6 h-6 sm:w-7 sm:h-7 text-[#7C4DFF]" />
              </div>
              <h3 class="text-xl sm:text-2xl font-black mb-3 text-gray-900">GitHub</h3>
              <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                查看我们的开源项目和技术文档
              </p>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-flex items-center gap-2 text-[#7C4DFF] hover:text-[#FF4D94] font-black text-sm sm:text-base transition-colors"
              >
                访问 GitHub
                <Github class="w-4 h-4" />
              </a>
            </div>

            <div class="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Twitter class="w-6 h-6 sm:w-7 sm:h-7 text-[#FF4D94]" />
              </div>
              <h3 class="text-xl sm:text-2xl font-black mb-3 text-gray-900">社交媒体</h3>
              <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">
                关注我们获取最新动态和更新
              </p>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-sm sm:text-base transition-colors"
              >
                关注我们
                <Twitter class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- FAQ -->
          <div class="bg-white rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 border border-gray-100 shadow-lg">
            <div class="text-center mb-8 sm:mb-12">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">常见问题</h2>
              <p class="text-sm sm:text-base md:text-lg text-gray-600 font-medium">快速找到您需要的答案</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div v-for="faq in faqs" :key="faq.question" class="border-l-4 pl-4 sm:pl-6 transition-all" :style="{ borderColor: faq.color }">
                <h3 class="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">{{ faq.question }}</h3>
                <p class="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                  {{ faq.answer }}
                </p>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="relative overflow-hidden bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-3xl p-8 sm:p-12 md:p-16 text-white shadow-2xl">
            <div class="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div class="relative z-10 text-center">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-black mb-4">还有其他问题？</h2>
              <p class="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
                我们的支持团队随时准备为您提供帮助
              </p>
              <a
                href="mailto:ahkjxy@qq.com"
                class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#FF4D94] rounded-2xl font-black text-sm sm:text-base md:text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                发送邮件
                <Send class="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
