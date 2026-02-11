<script setup lang="ts">
import { FolderOpen, ArrowRight, MessageCircle, FileText } from 'lucide-vue-next'

const client = useSupabaseClient()

const { data: categories } = await useAsyncData('categories', async () => {
  const { data } = await client
    .from('categories')
    .select('id, name, slug, description')
    .order('name')
  
  // 获取每个分类的文章数 (简化逻辑)
  if (data) {
     return await Promise.all(data.map(async (cat) => {
       const { count } = await client
         .from('post_categories')
         .select('*', { count: 'exact', head: true })
         .eq('category_id', cat.id)
       return { ...cat, post_count: count || 0 }
     }))
  }
  return []
})
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <header class="bg-white border-b border-gray-100 pt-16 pb-12">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">内容分类</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto">
          按主题浏览文章，快速找到你感兴趣的知识领域。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink 
          v-for="cat in categories" 
          :key="cat.id" 
          :to="`/categories/${cat.slug}`"
          class="group bg-white p-10 rounded-[48px] border border-gray-100 hover:shadow-2xl hover:border-brand-pink/20 transition-all duration-500 relative overflow-hidden"
        >
          <!-- Decoration -->
          <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-gray-50 rounded-full group-hover:bg-brand-pink/5 transition-colors"></div>
          
          <div class="relative z-10 space-y-6">
            <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-pink/10 to-brand-purple/10 flex items-center justify-center text-brand-pink group-hover:scale-110 transition-all duration-500 shadow-inner">
               <FolderOpen class="w-8 h-8" />
            </div>
            
            <div>
              <h2 class="text-2xl font-black text-gray-900 group-hover:text-brand-pink transition-colors mb-3">{{ cat.name }}</h2>
              <p class="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">{{ cat.description }}</p>
            </div>
            
            <div class="flex items-center justify-between pt-6 border-t border-gray-50">
              <span class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText class="w-4 h-4 text-brand-purple" />
                {{ cat.post_count }} 篇文章
              </span>
              <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-brand-pink group-hover:text-white transition-all">
                <ArrowRight class="w-5 h-5" />
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
