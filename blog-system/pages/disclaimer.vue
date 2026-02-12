<script setup lang="ts">
import { 
  AlertTriangle, 
  Stethoscope, 
  ExternalLink, 
  Search, 
  ShieldAlert,
  Info,
  Mail,
  Zap,
  Heart
} from 'lucide-vue-next'

useSeoMeta({
  title: '免责声明',
  description: '阅读元气银行的免责声明，了解我们平台内容的局限性。'
})

const disclaimers = [
  {
    title: '1. 仅限教育参考',
    icon: Info,
    from: 'from-blue-500',
    to: 'to-indigo-500',
    content: '元气银行提供的所有内容仅供参考和个人展示。',
    items: ['内容具有主观性，因人而异', '不构成权威性的教育指南', '平台致力于分享真实体验，但不保证所有案例的普适性']
  },
  {
    title: '2. 非专业咨询建议',
    icon: Stethoscope,
    from: 'from-amber-500',
    to: 'to-orange-500',
    content: '我们并非专业的心理咨询机构或医疗机构。',
    items: ['内容无法替代专业的心理测试或咨询', '如遇严重的家庭矛盾或青少年问题，请务必咨询专业机构', '用户根据博客建议采取的任何行动风险自担']
  },
  {
    title: '3. 外部链接声明',
    icon: ExternalLink,
    from: 'from-purple-500',
    to: 'to-pink-500',
    content: '博客可能包含指向第三方网站的链接。',
    items: ['我们不参与管理第三方网站的内容', '不对第三方内容的准确性或安全性负责', '点击链接即视为知晓风险']
  },
  {
    title: '4. 信息准确性原则',
    icon: Search,
    from: 'from-emerald-500',
    to: 'to-teal-500',
    content: '虽然我们力求信息准确，但不保证没有任何错误或遗漏。',
    items: ['技术操作可能存在滞后性', '由于软件更新，部分截图或教程可能已失效', '我们保留随时更正错误的权利']
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-12 sm:pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <div class="container mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-100">
          <AlertTriangle class="w-4 h-4" />
          Legal Disclaimer
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">免责声明</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
          为了明确元气银行平台信息的性质并保障双方权益，请在使用本站前仔细阅读并知悉以下免责声明。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-8 sm:mt-12 md:mt-16 max-w-5xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div v-for="item in disclaimers" :key="item.title" class="bg-white rounded-[40px] p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
          <div class="flex items-center gap-5 mb-8">
            <div :class="`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.from} ${item.to} flex items-center justify-center text-white shadow-lg` ">
              <component :is="item.icon" class="w-7 h-7" />
            </div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ item.title }}</h2>
          </div>
          
          <p class="text-gray-600 mb-8 leading-relaxed font-bold italic">"{{ item.content }}"</p>
          
          <ul class="space-y-4">
            <li v-for="bullet in item.items" :key="bullet" class="flex items-start gap-4">
              <div :class="`w-2 h-2 rounded-full bg-gradient-to-br ${item.from} ${item.to} mt-2 flex-shrink-0` "></div>
              <span class="text-sm font-semibold text-gray-500 leading-relaxed">{{ bullet }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Critical Warning Box -->
      <div class="bg-red-50 border-2 border-red-100 rounded-[48px] p-10 sm:p-16 relative overflow-hidden group">
         <div class="absolute -right-16 -top-16 w-64 h-64 bg-red-100/50 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
         
         <div class="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div class="w-24 h-24 rounded-3xl bg-white flex items-center justify-center text-red-500 shadow-xl flex-shrink-0 animate-pulse">
               <ShieldAlert class="w-12 h-12" />
            </div>
            <div class="flex-1 text-center md:text-left">
               <h2 class="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">5. “自行承担风险”原则</h2>
               <p class="text-gray-600 font-medium leading-relaxed text-lg mb-0 text-justify">
                 本站提供的任何信息、建议或系统操作演示仅供一般参考。您根据本站内容所做的任何决定及后果均由您本人自行负责。元气银行及其运营团队明确表示不承担因您使用本站或相关服务而导致的任何形式的损失或损害责任。
               </p>
            </div>
         </div>
      </div>

      <!-- Footer CTA -->
      <div class="mt-24 bg-white rounded-[48px] border border-gray-100 p-12 sm:p-20 text-center relative overflow-hidden shadow-sm">
        <div class="absolute inset-0 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5"></div>
        <div class="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-pink to-brand-purple rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto rotate-12">
            <Heart class="w-8 h-8 fill-white" />
          </div>
          <h2 class="text-3xl font-black text-gray-900 tracking-tight">共同创造更好的环境</h2>
          <p class="text-gray-500 font-medium leading-relaxed">
            我们致力于构建一个透明、互助、可靠的家庭社区。如果您发现本站内容有任何法律合规性问题或事实错误，请通过以下渠道告知我们。
          </p>
          <div class="flex flex-wrap justify-center gap-4 pt-4">
             <a href="mailto:ahkjxy@qq.com" class="px-10 py-5 bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
               <Mail class="w-6 h-6" /> 联系法务/反馈
             </a>
             <NuxtLink to="/docs" class="px-10 py-5 bg-gray-50 text-gray-500 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all flex items-center gap-3 border border-gray-100">
               <Zap class="w-6 h-6" /> 使用指南
             </NuxtLink>
          </div>
        </div>
      </div>
      
      <p class="mt-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-[1em] mb-12">
        元气银行法律事务部 · 2026
      </p>
    </div>
  </div>
</template>

<style scoped>
.group:hover {
  border-color: rgba(255, 77, 148, 0.2);
}
</style>
