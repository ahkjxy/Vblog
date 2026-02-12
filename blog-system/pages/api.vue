<script setup lang="ts">
import { Globe, Shield, Database, LayoutDashboard, ArrowRight, Sparkles } from 'lucide-vue-next'

useSeoMeta({
  title: 'API 文档',
  description: '详细了解元气银行提供的公共 API 和后端能力。'
})

const sections = [
  {
    title: '认证',
    color: 'text-brand-purple',
    endpoints: [
      { method: 'POST', path: '/auth/v1/signup', color: 'bg-green-100 text-green-700' },
      { method: 'POST', path: '/auth/v1/token', color: 'bg-green-100 text-green-700' },
      { method: 'POST', path: '/auth/v1/logout', color: 'bg-green-100 text-green-700' },
    ]
  },
  {
    title: '文章管理',
    color: 'text-brand-pink',
    endpoints: [
      { method: 'GET', path: '/rest/v1/posts', color: 'bg-blue-100 text-blue-700' },
      { method: 'POST', path: '/rest/v1/posts', color: 'bg-green-100 text-green-700' },
      { method: 'PATCH', path: '/rest/v1/posts?id=eq.{id}', color: 'bg-yellow-100 text-yellow-700' },
    ]
  }
]

const examples = [
  {
    title: '获取文章列表',
    code: `const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)`
  },
  {
    title: '创建新文章',
    code: `const { data, error } = await supabase
  .from('posts')
  .insert({
    title: '文章标题',
    content: '文章内容',
    status: 'draft'
  })
  .select()`
  }
]
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-12 sm:pb-24">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">API 文档</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          元气银行基于 Supabase 提供的强大的 REST/Realtime 接口能力。
          开发者可以通过这些接口与家庭数据进行深度集成。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-8 sm:mt-12 md:mt-16 max-w-5xl">
      <div class="space-y-12 sm:space-y-16">
        <!-- API Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div class="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div class="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-brand-purple">
              <Database class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-black mb-3">REST API</h3>
            <p class="text-gray-600 font-medium leading-relaxed">提供完整的 CRUD 能力，支持复杂的过滤、排序和分页查询。</p>
          </div>
          <div class="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div class="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-brand-pink">
              <Globe class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-black mb-3">Realtime</h3>
            <p class="text-gray-600 font-medium leading-relaxed">通过 WebSocket 实时监听数据库变更，实现瞬间同步体验。</p>
          </div>
        </div>

        <!-- Endpoints -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-gray-100 shadow-lg">
          <h2 class="text-3xl sm:text-4xl font-black mb-8 bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">核心端点</h2>
          <div class="space-y-12">
            <div v-for="section in sections" :key="section.title" class="border-l-4 border-brand-purple pl-6 sm:pl-8">
              <h3 :class="`text-2xl font-black mb-6 ${section.color}`">{{ section.title }}</h3>
              <div class="space-y-4">
                <div v-for="(endpoint, idx) in section.endpoints" :key="idx" class="flex flex-col sm:flex-row sm:items-center gap-3 font-mono text-sm">
                  <span :class="`px-3 py-1.5 ${endpoint.color} rounded-lg font-black text-center sm:w-20`">{{ endpoint.method }}</span>
                  <span class="text-gray-600 font-bold bg-gray-50 px-3 py-1.5 rounded-lg flex-1 overflow-x-auto whitespace-nowrap">{{ endpoint.path }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Examples -->
        <div class="bg-gray-900 text-gray-100 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <h2 class="text-3xl font-black mb-8 text-white">SDK 示例代码</h2>
          <div class="space-y-8">
            <div v-for="example in examples" :key="example.title">
              <div class="text-sm text-gray-400 mb-3 font-black uppercase tracking-widest">{{ example.title }}</div>
              <pre class="text-sm overflow-x-auto bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50"><code>{{ example.code }}</code></pre>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="bg-gradient-to-br from-brand-purple to-brand-pink rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 class="text-3xl font-black mb-4 tracking-tight">需要更详细的文档？</h2>
              <p class="text-white/80 font-medium">查看完整的技术概览或联系我们。</p>
            </div>
            <div class="flex gap-4">
              <NuxtLink to="/docs" class="px-8 py-4 bg-white text-brand-purple rounded-2xl font-black hover:shadow-xl transition-all">产品文档</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
