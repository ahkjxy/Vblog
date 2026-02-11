<script setup lang="ts">
const route = useRoute()
const client = useSupabaseClient()
const { formatDate, formatAuthorName } = useUtils()

const slug = route.params.slug as string

const { data: categoryData } = await useAsyncData(`category-${slug}`, async () => {
  // 1. 获取分类基础信息
  const { data: category } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (!category) throw createError({ statusCode: 404, message: '分类未找到' })

  // 2. 获取该分类下的文章
  const { data: postCategories } = await client
    .from('post_categories')
    .select('post_id')
    .eq('category_id', category.id)
  
  const postIds = postCategories?.map(pc => pc.post_id) || []
  
  let posts = []
  if (postIds.length > 0) {
    const { data } = await client
      .from('posts')
      .select(`
        id, title, slug, excerpt, published_at, view_count,
        profiles!posts_author_id_fkey(name, avatar_url)
      `)
      .in('id', postIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    posts = data || []
  }

  return { category, posts }
})
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <header class="bg-white border-b border-gray-100 pt-16 pb-12">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          {{ categoryData?.category.name }}
        </h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto">
          {{ categoryData?.category.description }}
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article v-for="post in categoryData?.posts" :key="post.id" 
          class="group bg-white rounded-[40px] border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div class="p-8 lg:p-10 space-y-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                <img v-if="post.profiles?.avatar_url" :src="post.profiles.avatar_url" class="w-full h-full object-cover" />
                <span v-else class="text-[10px] font-black text-gray-400">{{ post.profiles?.name?.[0] }}</span>
              </div>
              <span class="text-xs font-bold text-gray-400">
                {{ formatAuthorName(post.profiles) }} • {{ formatDate(post.published_at) }}
              </span>
            </div>
            
            <NuxtLink :to="`/blog/${post.slug}`" class="block">
              <h2 class="text-2xl font-black text-gray-900 group-hover:text-brand-pink transition-colors mb-4 line-clamp-2">
                {{ post.title }}
              </h2>
              <p class="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
                {{ post.excerpt }}
              </p>
            </NuxtLink>

            <div class="pt-8 border-t border-gray-50 flex items-center justify-between mt-auto">
               <span class="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <div class="w-2 h-2 rounded-full bg-brand-purple"></div>
                  {{ post.view_count }} 阅读
               </span>
               <NuxtLink :to="`/blog/${post.slug}`" class="text-brand-pink font-black text-xs uppercase tracking-widest flex items-center gap-1 group/btn">
                 详情 <ArrowRight class="w-4 h-4 group-hover/btn:translate-x-1 transition-all" />
               </NuxtLink>
            </div>
          </div>
        </article>
      </div>
      
      <div v-if="!categoryData?.posts.length" class="py-32 text-center bg-white rounded-[48px] border border-gray-100">
        <p class="text-gray-400 font-bold">该分类下暂时没有文章</p>
      </div>
    </div>
  </div>
</template>

