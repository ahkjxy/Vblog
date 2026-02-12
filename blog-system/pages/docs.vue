<script setup lang="ts">
import { Target, Star, ShoppingBag, History, Settings, Sparkles, ArrowRight, BookOpen } from 'lucide-vue-next'

useSeoMeta({
  title: '帮助文档 | 元气银行',
  description: '详细了解元气银行的功能、使用方法和技术规范。'
})

const features = [
  {
    icon: Target,
    title: '任务激励',
    desc: '自定义各类学习、生活任务。支持周期性任务设定，完成后自动结算积分，建立正向反馈机制。',
    features: ['自定义分值', '周期性重复', '自动审核流程'],
    gradient: 'from-blue-100 to-indigo-100',
    color: 'text-blue-600'
  },
  {
    icon: Star,
    title: '许愿星广场',
    desc: '每个家庭成员都可以创建自己的心愿单。通过达成任务积累积分，最终实现心愿。',
    features: ['心愿单管理', '积分进度可视化', '成员互助互动'],
    gradient: 'from-amber-100 to-orange-100',
    color: 'text-amber-600'
  },
  {
    icon: ShoppingBag,
    title: '梦想商店',
    desc: '使用积分兑换心仪的奖励。支持实物奖励和特权奖励，让激励更有吸引力。',
    features: ['丰富的奖励类型', '库存管理', '兑换记录追踪'],
    gradient: 'from-pink-100 to-rose-100',
    color: 'text-pink-600'
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-12 sm:pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">产品文档</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          详细了解元气银行的核心逻辑与功能。
          我们致力于通过游戏化的方式，帮助家庭建立更好的习惯培养体系。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-8 sm:mt-12 md:mt-16 max-w-6xl">
      <div class="space-y-16 lg:space-y-24">
        <!-- Core Features -->
        <div>
          <div class="text-center mb-8 sm:mb-12">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">核心逻辑</h2>
            <p class="text-sm sm:text-base md:text-lg text-gray-600 font-medium">任务、积分、奖励的完美闭环</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div v-for="feature in features" :key="feature.title" class="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all">
              <div :class="`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`">
                <component :is="feature.icon" :class="`w-6 h-6 sm:w-7 sm:h-7 ${feature.color}`" />
              </div>
              <h3 class="text-xl sm:text-2xl font-black mb-3 text-gray-900">{{ feature.title }}</h3>
              <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">{{ feature.desc }}</p>
              <ul class="space-y-2">
                <li v-for="item in feature.features" :key="item" class="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                  <div class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF]"></div>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Technical Specs -->
        <div class="bg-white rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 border border-gray-100 shadow-lg">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">技术架构</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 class="text-lg sm:text-xl font-black mb-4 sm:mb-6 text-[#FF4D94] flex items-center gap-2">
                <div class="w-1 h-6 bg-gradient-to-b from-[#FF4D94] to-[#7C4DFF] rounded-full"></div>
                前端技术
              </h3>
              <ul class="space-y-3 text-sm sm:text-base text-gray-600">
                <li v-for="tech in ['Vue 3 + TypeScript', 'Nuxt 3 (SSR)', 'Tailwind CSS', 'Lucide Icons']" :key="tech" class="flex items-center gap-3 font-medium">
                  <Sparkles class="w-4 h-4 text-[#FF4D94]" />
                  {{ tech }}
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-black mb-4 sm:mb-6 text-[#7C4DFF] flex items-center gap-2">
                <div class="w-1 h-6 bg-gradient-to-b from-[#7C4DFF] to-[#FF4D94] rounded-full"></div>
                后端技术
              </h3>
              <ul class="space-y-3 text-sm sm:text-base text-gray-600">
                <li v-for="tech in ['Supabase (BaaS)', 'PostgreSQL 数据库', '实时数据推送', 'Edge Functions']" :key="tech" class="flex items-center gap-3 font-medium">
                  <Sparkles class="w-4 h-4 text-[#7C4DFF]" />
                  {{ tech }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="relative overflow-hidden bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-3xl p-8 sm:p-12 md:p-16 text-white shadow-2xl">
          <div class="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div class="relative z-10 text-center">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-black mb-4">需要更多帮助？</h2>
            <p class="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium">
              查看我们的 API 文档或联系技术支持团队
            </p>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <NuxtLink to="/api" class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#FF4D94] rounded-2xl font-black text-sm sm:text-base md:text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl">
                API 文档
                <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5" />
              </NuxtLink>
              <NuxtLink to="/support" class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-black text-sm sm:text-base md:text-lg hover:bg-white/20 transition-all border-2 border-white/30">
                联系中心
                <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
