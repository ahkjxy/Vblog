<script setup lang="ts">
import { 
  Settings, 
  Globe, 
  Search, 
  MessageSquare, 
  Shield, 
  Save, 
  Loader2,
  Layout,
  MousePointer2,
  AppWindow,
  Zap,
  Check
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { profile } = useAuth()

// 权限检查
onMounted(() => {
  if (profile.value && profile.value.role !== 'admin') {
    useRouter().push('/dashboard')
  }
})

const activeTab = ref('general')
const isSaving = ref(false)

const settings = ref({
  siteTitle: '元气银行博客',
  siteDescription: '记录家庭点滴，共享成长快乐。',
  siteUrl: 'https://vblog.familybank.chat',
  metaTitle: '元气银行官方博客',
  metaDescription: '专业的家庭教育与习惯养成记录平台',
  metaKeywords: '家庭, 教育, 博客, 习惯养成',
  commentModeration: true,
  anonymousComments: false,
  autoApproveTrusted: true
})

const handleSave = async () => {
  isSaving.value = true
  // 模拟保存操作
  await new Promise(resolve => setTimeout(resolve, 1500))
  isSaving.value = false
  alert('系统设置已更新')
}

const tabs = [
  { id: 'general', name: '常规设置', icon: Globe, desc: '基础信息与站点定义' },
  { id: 'seo', name: '搜索引擎 (SEO)', icon: Search, desc: '优化搜索排名与展示' },
  { id: 'comments', name: '交互控制', icon: MessageSquare, desc: '评论审核与参与规则' },
  { id: 'security', name: '安全防护', icon: Shield, desc: '访问控制与数据安全' }
]
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent mb-2 tracking-tight">
          全局核心配置
        </h1>
        <p class="text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">System architecture and global preference management</p>
      </div>
      
      <button 
        @click="handleSave"
        :disabled="isSaving"
        class="group flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl hover:bg-brand-pink hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
      >
        <Loader2 v-if="isSaving" class="w-5 h-5 animate-spin" />
        <Save v-else class="w-5 h-5" />
        部署配置变更
      </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
       <!-- Tab Navigation -->
       <aside class="xl:col-span-4 space-y-3 sticky top-32">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['w-full text-left p-6 sm:p-8 rounded-[40px] border-4 transition-all flex items-center gap-6 relative overflow-hidden group',
              activeTab === tab.id 
                ? 'bg-white border-brand-pink shadow-2xl scale-[1.02] z-10' 
                : 'bg-white border-transparent border-opacity-0 hover:bg-gray-50/50 hover:border-gray-100 text-gray-400']"
          >
             <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
               activeTab === tab.id ? 'bg-gradient-to-br from-brand-pink to-brand-purple text-white shadow-lg' : 'bg-gray-50 text-gray-300']">
                <component :is="tab.icon" class="w-6 h-6" />
             </div>
             <div>
                <h3 :class="['font-black text-sm uppercase tracking-widest mb-1', activeTab === tab.id ? 'text-gray-900' : 'text-gray-400']">{{ tab.name }}</h3>
                <p class="text-[10px] font-bold text-gray-400 opacity-60 line-clamp-1">{{ tab.desc }}</p>
             </div>
             
             <ChevronRight v-if="activeTab === tab.id" class="absolute right-8 w-5 h-5 text-brand-pink animate-pulse" />
          </button>
       </aside>

       <!-- Settings Forms -->
       <main class="xl:col-span-8 bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
          <!-- Form Header -->
          <div class="px-10 py-12 border-b border-gray-50 bg-gray-50/20 relative">
             <div class="absolute right-12 top-12">
                <Settings class="w-20 h-20 text-gray-900 opacity-[0.03]" />
             </div>
             <div class="relative z-10">
                <h2 class="text-2xl font-black text-gray-900 mb-2">
                   {{ tabs.find(t => t.id === activeTab)?.name }}
                </h2>
                <p class="text-sm font-medium text-gray-400">更新对应的全局系统参数</p>
             </div>
          </div>

          <!-- Form Content -->
          <div class="p-10 flex-1">
             <!-- General Tab -->
             <div v-if="activeTab === 'general'" class="space-y-10 animate-fade-in">
                <div class="space-y-4">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div class="w-1 h-3 bg-brand-pink rounded-full"></div> 网站名称 (SITE TITLE)
                   </label>
                   <input v-model="settings.siteTitle" type="text" class="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[24px] text-lg font-black text-gray-900 outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all" />
                </div>

                <div class="space-y-4">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div class="w-1 h-3 bg-brand-purple rounded-full"></div> 网站描述 (DESCRIPTION)
                   </label>
                   <textarea v-model="settings.siteDescription" rows="3" class="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-brand-purple/5 transition-all resize-none"></textarea>
                </div>

                <div class="space-y-4">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div class="w-1 h-3 bg-gray-900 rounded-full"></div> 官方域名 (BASE URL)
                   </label>
                   <div class="relative">
                      <Globe class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input v-model="settings.siteUrl" type="url" class="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-gray-100 transition-all font-mono" />
                   </div>
                </div>
             </div>

             <!-- SEO Tab -->
             <div v-if="activeTab === 'seo'" class="space-y-10 animate-fade-in">
                <div class="space-y-4">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">默认 META 标题</label>
                   <input v-model="settings.metaTitle" type="text" class="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all" />
                </div>

                <div class="space-y-4">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">META 描述摘要</label>
                   <textarea v-model="settings.metaDescription" rows="4" class="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all resize-none"></textarea>
                </div>

                <div class="space-y-4">
                   <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">全局关键词集</label>
                   <input v-model="settings.metaKeywords" type="text" placeholder="用英文逗号分隔..." class="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all" />
                </div>
             </div>

             <!-- Interactive Tab -->
             <div v-if="activeTab === 'comments'" class="space-y-6 animate-fade-in">
                <div 
                  v-for="(val, key) in { commentModeration: '启用评论先审后发', anonymousComments: '允许未登录访客评论', autoApproveTrusted: '自动信任优质作者评论' }" 
                  :key="key"
                  @click="(settings as any)[key] = !(settings as any)[key]"
                  :class="['p-8 rounded-[32px] border-4 cursor-pointer transition-all flex items-center justify-between', (settings as any)[key] ? 'bg-brand-pink/[0.03] border-brand-pink/10' : 'bg-gray-50/50 border-transparent hover:border-gray-100']"
                >
                   <div class="flex items-center gap-6">
                      <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center transition-all', (settings as any)[key] ? 'bg-brand-pink text-white rotate-12' : 'bg-white text-gray-300']">
                         <Zap class="w-6 h-6" />
                      </div>
                      <div>
                        <h4 class="font-black text-gray-900 uppercase tracking-widest text-xs mb-1">{{ val }}</h4>
                        <p class="text-[10px] text-gray-400 font-bold">交互行为受全局安全协议监控</p>
                      </div>
                   </div>
                   <div :class="['w-10 h-6 rounded-full relative transition-all', (settings as any)[key] ? 'bg-brand-pink' : 'bg-gray-200']">
                      <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all', (settings as any)[key] ? 'left-5 shadow-lg' : 'left-1']"></div>
                   </div>
                </div>
             </div>

             <!-- Security Tab placeholder -->
             <div v-if="activeTab === 'security'" class="h-64 flex flex-col items-center justify-center gap-6 animate-fade-in">
                <div class="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
                   <Shield class="w-10 h-10" />
                </div>
                <p class="text-xs font-black text-gray-400 uppercase tracking-widest">高级安全配置暂不可用</p>
                <div class="px-6 py-2 bg-brand-purple/5 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest">Enterprise Only</div>
             </div>
          </div>

          <!-- Bottom Advice -->
          <div class="p-8 bg-gray-50/50 text-center border-t border-gray-50/50">
             <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">修改系统配置可能影响缓存和全局分发 · 建议在非高峰期操作</p>
          </div>
       </main>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
