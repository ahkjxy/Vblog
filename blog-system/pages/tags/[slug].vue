<script setup lang="ts">
import { Calendar, Eye, ArrowRight, Tag as TagIcon, FileText } from 'lucide-vue-next'

const route = useRoute()
const client = useSupabaseClient()
const { formatDate, formatAuthorName } = useUtils()
const slug = route.params.slug as string

interface Tag {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  published_at: string
  view_count: number
  profiles: {
    name: string
    avatar_url: string | null
  } | null
}

const { data } = await useAsyncData<{ tag: Tag, posts: Post[] }>(`tag-${slug}`, async () => {
  const { data: tagData } = await client
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tagData) throw createError({ statusCode: 404, statusMessage: '标签未找到' })

  const { data: postTagsData } = await client
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tagData.id)

  const postTags = (postTagsData as any[]) || []
  const postIds = postTags.map((pt: any) => pt.post_id) || []

  const { data: postsData } = await client
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      view_count,
      status,
      review_status,
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .in('id', postIds)
    .eq('status', 'published')
    .eq('review_status', 'approved')
    .order('published_at', { ascending: false })

  return { 
    tag: tagData as Tag, 
    posts: (postsData as any[] || []).map(p => ({
      ...p,
      profiles: p.profiles || null
    })) as Post[] 
  }
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: '标签未找到' })
}

useSeoMeta({
  title: `#${data.value.tag.name} - 标签 | 元气银行博客`,
  description: `浏览标签 #${data.value.tag.name} 下的所有文章`
})

const getGradient = (index: number) => {
  const gradients = [
    { from: 'from-purple-500', to: 'to-pink-500' },
    { from: 'from-pink-500', to: 'to-rose-500' },
    { from: 'from-purple-600', to: 'to-indigo-500' },
    { from: 'from-fuchsia-500', to: 'to-pink-500' },
  ]
  return gradients[index % gradients.length]
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <!-- Hero -->
    <header class="bg-gradient-to-br from-[#FF4D94]/5 via-[#7C4DFF]/5 to-white border-b border-gray-100 pt-20 pb-16">
      <div class="container mx-auto px-4">
        <div v-if="data" class="max-w-6xl mx-auto">
          <NuxtLink to="/tags" class="inline-flex items-center gap-2 text-sm text-[#FF4D94] hover:text-[#7C4DFF] mb-6 font-black uppercase tracking-widest transition-colors">
            ← 返回标签列表
          </NuxtLink>
          <div class="flex items-center gap-4 mb-4">
             <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FF4D94] shadow-sm border border-[#FF4D94]/10">
               <TagIcon class="w-6 h-6" />
             </div>
             <h1 class="text-4xl md:text-6xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent tracking-tight">
               #{{ data.tag.name }}
             </h1>
          </div>
          <p class="text-lg md:text-xl text-gray-600 font-medium tracking-tight">
            共 <span class="text-[#FF4D94] font-black">{{ data.posts.length }}</span> 篇文章
          </p>
        </div>
      </div>
    </header>

    <!-- Posts List -->
    <div v-if="data" class="container mx-auto px-4 mt-16 max-w-6xl">
      <div v-if="data.posts.length > 0" class="space-y-8">
        <article v-for="(post, index) in data.posts" :key="post.id" class="group bg-white rounded-[32px] p-6 md:p-10 hover:shadow-2xl transition-all border border-gray-100 hover:border-[#FF4D94]/30 relative overflow-hidden">
          <div :class="`h-1.5 w-24 rounded-full bg-gradient-to-r ${getGradient(index).from} ${getGradient(index).to} mb-8` "></div>
          
          <NuxtLink :to="`/blog/${post.slug}`">
            <h2 class="text-2xl md:text-3xl font-black mb-6 group-hover:text-[#FF4D94] transition-colors leading-tight tracking-tight">
              {{ post.title }}
            </h2>
          </NuxtLink>
          <p v-if="post.excerpt" class="text-gray-600 mb-10 line-clamp-2 md:line-clamp-3 leading-relaxed font-medium text-base md:text-lg">
            {{ post.excerpt }}
          </p>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-gray-100">
            <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div class="flex items-center gap-3">
                <div v-if="post.profiles?.avatar_url" class="w-10 h-10 rounded-full ring-4 ring-gray-50 overflow-hidden">
                  <img :src="post.profiles.avatar_url" :alt="post.profiles.name" class="w-full h-full object-cover" />
                </div>
                <div v-else :class="`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(index).from} ${getGradient(index).to} flex items-center justify-center shadow-lg text-white font-black` ">
                  {{ post.profiles?.name?.[0].toUpperCase() || 'U' }}
                </div>
                <span class="font-black text-gray-900">{{ formatAuthorName(post.profiles) }}</span>
              </div>
              <div class="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                <Calendar class="w-4 h-4 text-[#FF4D94]" />
                {{ formatDate(post.published_at) }}
              </div>
              <div class="flex items-center gap-2 bg-[#FF4D94]/5 px-3 py-1.5 rounded-xl border border-[#FF4D94]/10 font-black text-[#FF4D94]">
                <Eye class="w-4 h-4" />
                {{ post.view_count }}
              </div>
            </div>
            <NuxtLink :to="`/blog/${post.slug}`" class="flex items-center gap-2 text-[#FF4D94] hover:text-[#7C4DFF] font-black text-sm uppercase tracking-widest group-hover:gap-3 transition-all">
              开始阅读 <ArrowRight class="w-5 h-5" />
            </NuxtLink>
          </div>
        </article>
      </div>
      <div v-else class="text-center py-24 bg-white rounded-[48px] border-2 border-dashed border-[#FF4D94]/10 text-sm font-bold">
          <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
             <FileText class="w-10 h-10 text-gray-200" />
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-4">暂无相关文章</h3>
          <p class="text-gray-500 font-medium mb-10">这个话题还没有人发布内容...</p>
          <NuxtLink to="/blog" class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
            浏览全站文章 <ArrowRight class="w-5 h-5" />
          </NuxtLink>
      </div>
    </div>
  </div>
</template>
