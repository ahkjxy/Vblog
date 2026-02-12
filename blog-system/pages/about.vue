<script setup lang="ts">
import { Heart, Sparkles, Zap, Shield, Rocket } from 'lucide-vue-next'

useSeoMeta({
  title: '关于我们',
  description: '了解元气银行的初衷、愿景和我们的团队。'
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <header class="py-24 bg-gradient-to-br from-brand-pink/5 via-brand-purple/5 to-white border-b border-gray-50">
      <div class="container mx-auto px-4 text-center">
        <div class="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Logo class="w-10 h-10 text-brand-pink" />
        </div>
        <h1 class="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">我们的故事</h1>
        <p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          让教育回归有趣，让习惯自然养成。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 py-24 max-w-4xl space-y-24">
      <section class="space-y-8">
        <h2 class="text-3xl font-black text-gray-900 flex items-center gap-4">
          <Sparkles class="w-8 h-8 text-brand-pink" />
          为什么是元气银行？
        </h2>
        <div class="prose prose-lg text-gray-600 font-medium leading-loose">
          <p>
            在忙碌的现代家庭生活中，教育往往变成了琐碎的叮嘱和重复的纠正。我们相信，最好的教育方式是激发孩子内在的驱动力。
          </p>
          <p>
            元气银行（Family Points Bank）的初衷，就是通过一套简单的“积分-愿望”系统，将枯燥的家务和习惯培养变成一项有趣的家庭游戏。
          </p>
        </div>
      </section>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="val in [
          { title: '完全公益', icon: Heart, desc: '我们是一个非盈利性质的项目，所有功能对所有家庭完全免费。' },
          { title: '数据隐私', icon: Shield, desc: '您的家庭数据受到严格保护，我们永远不会买卖您的任何信息。' }
        ]" :key="val.title" class="p-10 rounded-[48px] bg-gray-50 border border-gray-100 space-y-4">
          <component :is="val.icon" class="w-10 h-10 text-brand-purple" />
          <h3 class="text-2xl font-black text-gray-900">{{ val.title }}</h3>
          <p class="text-gray-500 font-medium leading-relaxed">{{ val.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
