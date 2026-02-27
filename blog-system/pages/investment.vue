<script setup lang="ts">
import { TrendingUp, Users, Target, Rocket, Mail, Phone, MapPin, CheckCircle } from 'lucide-vue-next'

useSeoMeta({
  title: '投资融资',
  description: '元气银行正在寻求战略投资伙伴，共同打造家庭教育科技领域的领先平台',
  ogTitle: '投资融资 - 元气银行',
  ogDescription: '元气银行正在寻求战略投资伙伴，共同打造家庭教育科技领域的领先平台',
})

const stats = [
  { label: '注册用户', value: '1,200+', icon: Users },
  { label: '活跃家庭', value: '800+', icon: TrendingUp },
  { label: '用户满意度', value: '92%', icon: Target },
  { label: '产品迭代', value: '50+', icon: Rocket },
]

const highlights = [
  '创新的家庭积分管理系统，解决家庭教育痛点',
  '产品已上线运营，持续迭代优化中',
  '用户反馈积极，产品价值得到验证',
  '创始团队深耕教育科技领域多年',
  '清晰的产品规划和发展路线',
  '家庭教育市场潜力巨大',
]

const milestones = [
  { year: '2024 Q1', title: '项目启动', desc: '完成产品设计和技术架构' },
  { year: '2024 Q2', title: '产品上线', desc: '元气银行 1.0 正式发布' },
  { year: '2024 Q3', title: '功能完善', desc: '推出社区、博客等核心功能' },
  { year: '2024 Q4', title: '用户增长', desc: '持续优化产品，积累种子用户' },
  { year: '2025 Q1', title: '寻求融资', desc: '计划启动天使轮/Pre-A 轮融资' },
]

const contactEmail = 'ahkjxy@qq.com'
const contactPhone = 'WX: liaoyuan3256'
</script>

<template>
  <div class="min-h-screen" style="background: var(--app-bg);">
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 sm:py-32">
      <div class="absolute inset-0 bg-gradient-to-br from-[#FF4D94]/5 via-transparent to-[#7C4DFF]/5"></div>
      <div class="container mx-auto px-4 sm:px-6 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/10 rounded-full mb-6">
            <Rocket class="w-4 h-4 text-[#FF4D94]" />
            <span class="text-sm font-bold text-[#FF4D94]">寻求天使轮/Pre-A 融资</span>
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF]">
            投资未来，共创价值
          </h1>
          
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            元气银行正在寻求战略投资伙伴，共同打造家庭教育科技领域的领先平台，让每个家庭都能享受科学、有趣的教育管理工具
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              :href="`mailto:${contactEmail}`"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Mail class="w-5 h-5" />
              <span>联系我们</span>
            </a>
            <a 
              href="#details"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 dark:border-white/10 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <span>了解详情</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 sm:py-20">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="stat in stats" 
            :key="stat.label"
            class="vibrant-card rounded-3xl p-6 text-center hover:scale-105 transition-transform"
          >
            <component :is="stat.icon" class="w-8 h-8 mx-auto mb-4 text-[#FF4D94]" />
            <div class="text-3xl sm:text-4xl font-black font-display mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF]">
              {{ stat.value }}
            </div>
            <div class="text-sm font-bold text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="details" class="py-16 sm:py-20">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl sm:text-4xl font-black font-display mb-4">关于元气银行</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              创新的家庭教育管理平台，让成长可见，让努力有价值
            </p>
          </div>

          <div class="vibrant-card rounded-3xl p-8 sm:p-12 mb-8">
            <h3 class="text-2xl font-black font-display mb-6">产品介绍</h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              元气银行是一款专注于家庭教育管理的创新产品，通过积分系统、任务管理、成就体系等功能，帮助家长科学管理孩子的成长，培养良好习惯，建立正向激励机制。
            </p>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              我们不仅提供工具，更构建了一个家庭教育社区，让家长们可以分享经验、交流心得，共同成长。产品目前处于早期阶段，正在积累种子用户并持续优化产品体验。
            </p>
          </div>

          <div class="vibrant-card rounded-3xl p-8 sm:p-12">
            <h3 class="text-2xl font-black font-display mb-6">投资亮点</h3>
            <div class="space-y-4">
              <div 
                v-for="(highlight, index) in highlights" 
                :key="index"
                class="flex items-start gap-3"
              >
                <CheckCircle class="w-6 h-6 text-[#FF4D94] flex-shrink-0 mt-0.5" />
                <span class="text-gray-700 dark:text-gray-300">{{ highlight }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Milestones Section -->
    <section class="py-16 sm:py-20 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl sm:text-4xl font-black font-display mb-4">发展历程</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              从产品上线到快速成长，我们一直在前进
            </p>
          </div>

          <div class="space-y-6">
            <div 
              v-for="(milestone, index) in milestones" 
              :key="index"
              class="vibrant-card rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-20 text-center">
                  <div class="text-sm font-black text-[#FF4D94] uppercase tracking-wider">
                    {{ milestone.year }}
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-xl font-black font-display mb-2">{{ milestone.title }}</h4>
                  <p class="text-gray-600 dark:text-gray-400">{{ milestone.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 sm:py-20">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-4xl mx-auto">
          <div class="vibrant-card rounded-3xl p-8 sm:p-12 text-center">
            <h2 class="text-3xl sm:text-4xl font-black font-display mb-6">联系我们</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
              如果您对投资元气银行感兴趣，欢迎与我们联系
            </p>

            <div class="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <a 
                :href="`mailto:${contactEmail}`"
                class="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-[#FF4D94] hover:bg-[#FF4D94]/5 transition-all"
              >
                <Mail class="w-5 h-5 text-[#FF4D94]" />
                <div class="text-left">
                  <div class="text-xs font-bold text-gray-500 dark:text-gray-400">邮箱</div>
                  <div class="text-sm font-bold">{{ contactEmail }}</div>
                </div>
              </a>

              <a 
                :href="`tel:${contactPhone}`"
                class="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-[#7C4DFF] hover:bg-[#7C4DFF]/5 transition-all"
              >
                <Phone class="w-5 h-5 text-[#7C4DFF]" />
                <div class="text-left">
                  <div class="text-xs font-bold text-gray-500 dark:text-gray-400">电话</div>
                  <div class="text-sm font-bold">{{ contactPhone }}</div>
                </div>
              </a>
            </div>

            <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin class="w-4 h-4" />
              <span>中国 · 深圳</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-20 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF]">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mx-auto text-center text-white">
          <h2 class="text-3xl sm:text-4xl font-black font-display mb-4">
            携手共创美好未来
          </h2>
          <p class="text-lg mb-8 opacity-90">
            加入我们，一起改变家庭教育的未来
          </p>
          <a 
            :href="`mailto:${contactEmail}`"
            class="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#FF4D94] rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Mail class="w-5 h-5" />
            <span>立即联系</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Back to Top -->
    <BackToTop />
  </div>
</template>
