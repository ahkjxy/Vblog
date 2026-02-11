<template>
  <div class="my-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[32px] border border-gray-100 flex flex-col items-center justify-center text-center gap-4 group hover:border-brand-pink/20 transition-all">
    <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-300 group-hover:text-brand-pink transition-colors">
      <Sparkles class="w-6 h-6" />
    </div>
    <div>
      <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">赞助内容</p>
      <h4 class="text-sm font-black text-gray-900">广告位招租</h4>
    </div>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'
</script>
