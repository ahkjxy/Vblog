<script setup lang="ts">
import { 
  FileText, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  Ban, 
  RefreshCw, 
  Mail,
  Scale,
  MessageCircle,
  Smartphone
} from 'lucide-vue-next'

useSeoMeta({
  title: '服务协议 | 元气银行博客',
  description: '阅读元气银行的服务协议，了解您在使用我们服务时的权利和义务。'
})

const sections = [
  {
    title: '1. 协议接受',
    icon: ShieldCheck,
    from: 'from-blue-500',
    to: 'to-indigo-500',
    content: '欢迎使用元气银行。通过访问或使用本博客及相关服务，您即表示同意受本协议的所有条款约束。',
    items: ['使用本服务即视为接受本协议', '如果您不同意，请停止访问本站', '本协议适用于所有访问者和用户']
  },
  {
    title: '2. 服务内容',
    icon: Smartphone,
    from: 'from-purple-500',
    to: 'to-pink-500',
    content: '元气银行提供家庭教育、积分管理及习惯养成的经验分享和系统服务。',
    items: ['包括但不限于文章、评论、积分系统demo', '服务的具体形式可能随迭代而变更', '我们保留随时修改或停止服务的权利']
  },
  {
    title: '3. 用户注册与安全',
    icon: UserPlus,
    from: 'from-pink-500',
    to: 'to-rose-500',
    content: '您在使用某些功能时需要创建账户，并负责维护账户的保密性。',
    items: ['请提供真实准确的个人信息', '您需对自己账户下的所有行为负责', '如发现未经授权的使用，请立即通知我们']
  },
  {
    title: '4. 用户发布内容',
    icon: MessageCircle,
    from: 'from-amber-500',
    to: 'to-orange-500',
    content: '您对在元气银行发布的任何内容保留所有权，但授予我们非排他性的展示权。',
    items: ['禁止发布非法、淫秽或侵权内容', '我们保留审核及删除不当内容的权利', '尊重他人的知识产权']
  },
  {
    title: '5. 禁止行为',
    icon: Ban,
    from: 'from-red-500',
    to: 'to-rose-600',
    content: '在使用服务过程中，您不得从事以下行为。',
    items: ['试图非法访问服务器或数据库', '分发恶意软件或进行 D-DoS 攻击', '滥用评分或评论系统干扰正常秩序']
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-12 sm:pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <div class="container mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-brand-pink/10 rounded-full text-brand-pink text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-pink/10">
          <Scale class="w-4 h-4" />
          Terms of Service
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">服务协议</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          在使用元气银行提供的各项服务前，请您务必审慎阅读并充分理解本协议。您的使用行为将视为对本协议的完全认可。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-8 sm:mt-12 md:mt-16 max-w-4xl">
      <div class="space-y-8">
        <div v-for="section in sections" :key="section.title" class="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
           <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-gray-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
           
           <div class="relative z-10">
            <div class="flex items-center gap-6 mb-8">
              <div :class="`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.from} ${section.to} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform` ">
                <component :is="section.icon" class="w-7 h-7" />
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{{ section.title }}</h2>
            </div>
            
            <p class="text-gray-600 mb-8 leading-relaxed font-medium text-base md:text-lg italic">
              "{{ section.content }}"
            </p>
            
            <ul class="space-y-4">
              <li v-for="item in section.items" :key="item" class="flex items-start gap-4 text-gray-700">
                <div :class="`w-2 h-2 rounded-full bg-gradient-to-br ${section.from} ${section.to} mt-2 flex-shrink-0 shadow-sm` "></div>
                <span class="text-sm sm:text-base font-bold leading-relaxed text-gray-600">{{ item }}</span>
              </li>
            </ul>
           </div>
        </div>

        <!-- Liability Section -->
        <div class="bg-white rounded-[40px] p-8 sm:p-12 border-2 border-dashed border-gray-100">
          <div class="flex items-start gap-6">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-300">
              <AlertCircle class="w-8 h-8" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-black mb-4 text-gray-900 uppercase tracking-tight">6. 免责声明与赔偿限制</h2>
              <p class="text-gray-500 font-medium leading-relaxed text-sm md:text-base mb-6">
                元气银行按“现状”提供，不承诺任何明示或暗示的保证。对于因使用或无法使用本服务而产生的任何直接、间接或后果性损害，我们不承担法律责任。
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  No Warranty of Uptime
                </div>
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  No Liability for Content
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact / Support Section -->
        <div class="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-[48px] p-10 sm:p-16 text-white shadow-2xl relative overflow-hidden group">
           <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           
           <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
             <div class="max-w-xl">
               <h2 class="text-3xl sm:text-4xl font-black mb-6 tracking-tight">对此协议有疑问？</h2>
               <p class="text-white/80 font-medium text-lg leading-relaxed">
                 如果您对以上任何条款存在疑问或建议，欢迎随时通过邮件与我们取得联系。我们将竭诚为您解答。
               </p>
             </div>
             <div class="flex flex-col gap-4">
               <a href="mailto:contact@familybank.chat" class="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#FF4D94] rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
                 <Mail class="w-5 h-5" />
                 在线咨询
               </a>
               <NuxtLink to="/contact" class="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 border-2 border-white/30 text-white rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                 联系我们
               </NuxtLink>
             </div>
           </div>
        </div>
      </div>
      
      <div class="mt-20 text-center">
        <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em]">
          Last Updated: 2026-02-11
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  color: #4B5563;
}
</style>
