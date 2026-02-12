<script setup lang="ts">
import { Shield, Eye, Lock, Share2, Cookie, UserCheck, Baby, RefreshCw, Mail } from 'lucide-vue-next'

useSeoMeta({
  title: '隐私政策',
  description: '了解元气银行如何收集、使用和保护您的个人信息。'
})

const sections = [
  {
    title: '1. 信息收集',
    icon: Eye,
    from: 'from-purple-500',
    to: 'to-pink-500',
    content: '我们收集必要的信息以提供更好的服务。',
    items: ['基础信息：账户邮件、用户名', '设备信息：IP地址、浏览器类型', '使用数据：访问页面、停留时间']
  },
  {
    title: '2. 信息使用',
    icon: RefreshCw,
    from: 'from-pink-500',
    to: 'to-rose-500',
    content: '您的信息主要用于优化产品体验。',
    items: ['提供和维护服务功能', '通知关于我们服务的变更', '收集分析或有价值的信息']
  },
  {
    title: '3. 广告服务',
    icon: Share2,
    from: 'from-green-500',
    to: 'to-emerald-500',
    content: '本网站使用 Google AdSense 展示广告以维持运营。',
    items: [
      'Google 等第三方供应商使用 Cookie 在本网站投放广告',
      'Google 使用 DART Cookie 根据用户访问记录投放个性化广告',
      '用户可访问 Google 广告设置页面选择停用个性化广告',
      '第三方广告商可能收集您的浏览信息用于广告投放'
    ]
  },
  {
    title: '4. 数据安全',
    icon: Lock,
    from: 'from-purple-600',
    to: 'to-indigo-500',
    content: '我们采用企业级安全措施保护您的数据。',
    items: ['SSL 加密传输', '身份验证机制', '数据库访问控制']
  },
  {
    title: '5. 信息共享',
    icon: Share2,
    from: 'from-fuchsia-500',
    to: 'to-pink-500',
    content: '我们不会出售您的数据或在未经同意下与第三方共享。',
    items: ['不向第三方出售数据', '法律要求的必要披露', '服务需要（如邮箱服务商、广告服务商）']
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-12 sm:pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">隐私政策</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          元气银行非常重视您的隐私。本页面详细说明了我们如何收集、使用和保护您的个人信息。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-8 sm:mt-12 md:mt-16 max-w-4xl">
      <div class="space-y-8">
        <div v-for="section in sections" :key="section.title" class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div class="flex items-center gap-4 mb-6">
            <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${section.from} ${section.to} flex items-center justify-center text-white shadow-lg`">
              <component :is="section.icon" class="w-6 h-6" />
            </div>
            <h2 class="text-2xl font-black text-gray-900">{{ section.title }}</h2>
          </div>
          <p class="text-gray-600 mb-6 leading-relaxed font-medium">{{ section.content }}</p>
          <ul class="space-y-3">
            <li v-for="item in section.items" :key="item" class="flex items-start gap-3 text-gray-700">
              <div :class="`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${section.from} ${section.to} mt-2 flex-shrink-0` "></div>
              <span class="text-sm font-medium leading-relaxed">{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Additional Sections -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div class="flex items-start gap-6">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
              <Cookie class="w-7 h-7" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-black mb-4 text-gray-900">6. Cookie 使用</h2>
              <p class="text-gray-600 mb-4 font-medium">我们使用 Cookie 保持登录状态并提升您的体验。</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in ['保持登录', '偏好设置', '使用分析', '个性化体验']" :key="tag" class="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div class="flex items-start gap-6">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
              <Baby class="w-7 h-7" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-black mb-4 text-gray-900">7. 儿童隐私</h2>
              <p class="text-gray-600 font-medium leading-relaxed">
                我们的服务面向家庭使用。家长或监护人负责管理儿童账户和数据。
                我们不会在未经家长同意的情况下收集 13 岁以下儿童的个人信息。
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div class="flex items-start gap-6">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
              <UserCheck class="w-7 h-7" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-black mb-4 text-gray-900">8. 用户权利</h2>
              <p class="text-gray-600 mb-4 font-medium leading-relaxed">
                您对自己的个人信息拥有以下权利：
              </p>
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  <span class="text-sm font-medium">访问和查看您的个人信息</span>
                </li>
                <li class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  <span class="text-sm font-medium">更正不准确的个人信息</span>
                </li>
                <li class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  <span class="text-sm font-medium">要求删除您的个人信息</span>
                </li>
                <li class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  <span class="text-sm font-medium">选择退出个性化广告（访问 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" class="text-indigo-600 hover:text-indigo-700 underline">Google 广告设置</a>）</span>
                </li>
                <li class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  <span class="text-sm font-medium">导出您的数据</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-3xl p-6 sm:p-8 border border-blue-100">
          <h3 class="text-lg font-black text-blue-900 mb-3">关于第三方广告</h3>
          <p class="text-blue-800 text-sm font-medium leading-relaxed mb-4">
            本网站使用 Google AdSense 展示广告。Google 及其合作伙伴可能会使用 Cookie 和其他技术来收集信息，
            以便根据您的兴趣向您展示相关广告。
          </p>
          <p class="text-blue-800 text-sm font-medium leading-relaxed mb-4">
            您可以通过以下方式管理广告偏好：
          </p>
          <div class="space-y-2">
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" class="block text-sm text-blue-600 hover:text-blue-700 underline font-bold">
              → Google 广告设置
            </a>
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener" class="block text-sm text-blue-600 hover:text-blue-700 underline font-bold">
              → Google 广告政策
            </a>
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener" class="block text-sm text-blue-600 hover:text-blue-700 underline font-bold">
              → 数字广告联盟退出页面
            </a>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
           <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div>
               <h2 class="text-3xl font-black mb-4 tracking-tight">隐私咨询</h2>
               <p class="text-white/80 font-medium max-w-md">对隐私政策有任何疑问？请随时联系我们。</p>
             </div>
             <a href="mailto:ahkjxy@qq.com" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#FF4D94] rounded-2xl font-black hover:shadow-xl transition-all">
               <Mail class="w-5 h-5" />
               发送咨询
             </a>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
