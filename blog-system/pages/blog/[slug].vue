<script setup lang="ts">
import { Calendar, Eye, User, ArrowLeft, TrendingUp, Clock } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatAuthorName = (profile: any) => {
  return profile?.name ? `${profile.name}的家庭` : '匿名家庭'
}

// 获取文章详情和推荐内容
const { data: pageData, error } = await useAsyncData(
  `post-${slug}`,
  async () => {
    const client = useSupabaseClient()
    
    const { data, error } = await client
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey(name, avatar_url, bio),
        post_categories(categories(name, slug)),
        post_tags(tags(name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    
    if (error || !data) {
      throw createError({ statusCode: 404, statusMessage: '文章未找到' })
    }
    
    // 增加浏览量
    await client
      .from('posts')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id)
    
    // 获取推荐文章（热门和最新）
    const [
      { data: hotPosts },
      { data: recentPosts }
    ] = await Promise.all([
      client.from('posts')
        .select('id, title, slug, view_count')
        .eq('status', 'published')
        .neq('id', data.id)
        .order('view_count', { ascending: false })
        .limit(5),
      client.from('posts')
        .select('id, title, slug, published_at')
        .eq('status', 'published')
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(5)
    ])
    
    return {
      post: data,
      hotPosts: hotPosts || [],
      recentPosts: recentPosts || []
    }
  }
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: '文章未找到' })
}

const post = computed(() => pageData.value?.post)

// SEO 优化
if (post.value) {
  const categories = post.value.post_categories?.map((pc: any) => pc.categories.name) || []
  const tags = post.value.post_tags?.map((pt: any) => pt.tags.name) || []
  const authorName = formatAuthorName(post.value.profiles)
  const description = cleanDescription(post.value.seo_description || post.value.excerpt || post.value.content, 160)
  const keywords = generateKeywords(tags, categories, [post.value.title])
  
  const seoConfig = {
    title: post.value.seo_title || post.value.title,
    description,
    keywords,
    image: post.value.featured_image || undefined,
    url: `/blog/${post.value.slug}`,
    type: 'article' as const,
    author: authorName,
    publishedTime: post.value.published_at,
    modifiedTime: post.value.updated_at,
    section: categories[0] || '家庭教育',
    tags,
  }
  
  useSeoMeta(generateSeoMeta(seoConfig))
  
  // 添加结构化数据
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(generateJsonLd('article', {
          title: post.value.title,
          description,
          image: post.value.featured_image || 'https://blog.familybank.chat/favicon.png',
          publishedTime: post.value.published_at,
          modifiedTime: post.value.updated_at,
          author: authorName,
          url: `https://blog.familybank.chat/blog/${post.value.slug}`,
        })),
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(generateJsonLd('breadcrumb', {
          items: generateBreadcrumbs([
            { name: '首页', url: '/' },
            { name: '社区讨论', url: '/blog' },
            { name: post.value.title, url: `/blog/${post.value.slug}` },
          ]),
        })),
      },
    ],
  })
}

// 添加 AdSense 脚本
const config = useRuntimeConfig()
if (config.public.adsenseClientId) {
  useHead({
    script: [
      {
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.public.adsenseClientId}`,
        async: true,
        crossorigin: 'anonymous'
      }
    ]
  })
}
</script>

<template>
  <div v-if="post" class="min-h-screen" style="background: var(--app-bg);">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        <!-- 主内容区 -->
        <article class="lg:col-span-8">
          <!-- Header -->
          <header class="py-6 sm:py-8 md:py-12 lg:py-16 border-b border-gray-100 dark:border-white/5">
            <!-- Back Button -->
            <NuxtLink 
              to="/blog"
              class="mobile-btn inline-flex items-center gap-2 text-sm text-[#FF4D94] hover:text-[#7C4DFF] mb-4 sm:mb-6 font-bold transition-colors touch-feedback"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>返回文章列表</span>
            </NuxtLink>

            <!-- Categories -->
            <div v-if="post.post_categories && post.post_categories.length > 0" class="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <NuxtLink
                v-for="pc in post.post_categories"
                :key="pc.categories.slug"
                :to="`/categories/${pc.categories.slug}`"
                class="mobile-tag px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors touch-feedback"
              >
                {{ pc.categories.name }}
              </NuxtLink>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-display mb-3 sm:mb-4 md:mb-6 text-gray-900 dark:text-white leading-tight tracking-tight">
              {{ post.title }}
            </h1>
            
            <!-- Excerpt -->
            <p v-if="post.excerpt" class="mobile-text-base text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 md:mb-8 leading-relaxed font-medium">
              {{ post.excerpt }}
            </p>

            <!-- Meta Info -->
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-2 sm:gap-3">
                <div v-if="post.profiles?.avatar_url" class="avatar-mobile w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 border-gray-100 dark:border-white/10 overflow-hidden flex-shrink-0">
                  <img 
                    :src="post.profiles.avatar_url" 
                    :alt="post.profiles.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div v-else class="avatar-mobile w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0">
                  {{ post.profiles?.name?.charAt(0).toUpperCase() || 'U' }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 dark:text-white truncate">{{ formatAuthorName(post.profiles) }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">{{ formatDate(post.published_at) }}</div>
                </div>
              </div>
              <span class="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
              <div class="flex items-center gap-1.5">
                <Eye class="icon-mobile w-3 h-3 sm:w-4 sm:h-4" />
                <span>{{ post.view_count + 1 }}</span>
              </div>
            </div>
          </header>

          <!-- Content -->
          <div class="py-6 sm:py-8 md:py-12 lg:py-16">
            <div class="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert">
              <MarkdownContent :content="post.content" />
            </div>
          </div>

          <!-- Tags -->
          <div v-if="post.post_tags && post.post_tags.length > 0" class="py-4 sm:py-6 md:py-8 border-t border-gray-100 dark:border-white/5">
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="pt in post.post_tags"
                :key="pt.tags.slug"
                :to="`/tags/${pt.tags.slug}`"
                class="mobile-tag px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-xs sm:text-sm hover:bg-[#FF4D94]/5 hover:border-[#FF4D94]/30 hover:text-[#FF4D94] transition-all font-bold touch-feedback"
              >
                #{{ pt.tags.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Author Bio -->
          <div v-if="post.profiles?.bio" class="py-4 sm:py-6 md:py-8 border-t border-gray-100 dark:border-white/5">
            <div class="mobile-card-spacing flex gap-3 sm:gap-4 items-start vibrant-card p-4 sm:p-6">
              <div v-if="post.profiles.avatar_url" class="avatar-mobile w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-white dark:border-white/10 shadow-sm flex-shrink-0 overflow-hidden">
                <img 
                  :src="post.profiles.avatar_url" 
                  :alt="post.profiles.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="avatar-mobile w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] text-white flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0 shadow-sm border-2 border-white dark:border-white/10">
                {{ post.profiles.name?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">关于作者</div>
                <p class="font-semibold text-gray-900 mb-2">{{ formatAuthorName(post.profiles) }}</p>
                <p class="text-sm text-gray-600 leading-relaxed">{{ post.profiles.bio }}</p>
              </div>
            </div>
          </div>

          <!-- Comments Section - 使用懒加载优化 -->
          <div class="py-8 sm:py-12 border-t border-gray-100">
            <LazyComments :post-id="post.id" />
          </div>

          <!-- Back to Blog -->
          <div class="py-8 sm:py-12 border-t border-gray-100 text-center">
            <NuxtLink 
              to="/blog"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl hover:shadow-xl transition-all font-black text-sm sm:text-base"
            >
              <ArrowLeft class="w-4 h-4" />
              返回文章列表
            </NuxtLink>
          </div>
        </article>

        <!-- 侧边栏 -->
        <aside class="lg:col-span-4">
          <div class="space-y-6">
            <!-- 广告位 -->
            <BannerAd />

            <!-- 热门文章 -->
            <div v-if="pageData?.hotPosts && pageData.hotPosts.length > 0" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <TrendingUp class="w-5 h-5 text-white" />
                </div>
                <h3 class="font-black text-gray-900 text-lg">热门文章</h3>
              </div>
              <div class="space-y-4">
                <NuxtLink 
                  v-for="(hotPost, index) in pageData.hotPosts" 
                  :key="hotPost.id" 
                  :to="`/blog/${hotPost.slug}`"
                  class="block group"
                >
                  <div class="flex gap-3">
                    <div 
                      :class="[
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm',
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                        'bg-gray-100 text-gray-600'
                      ]"
                    >
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                        {{ hotPost.title }}
                      </h4>
                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
                          <div class="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                            <Eye class="w-3 h-3 text-blue-600" />
                          </div>
                          <span>{{ hotPost.view_count || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- 最新文章 -->
            <div v-if="pageData?.recentPosts && pageData.recentPosts.length > 0" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <Clock class="w-5 h-5 text-white" />
                </div>
                <h3 class="font-black text-gray-900 text-lg">最新文章</h3>
              </div>
              <div class="space-y-4">
                <NuxtLink 
                  v-for="recentPost in pageData.recentPosts" 
                  :key="recentPost.id" 
                  :to="`/blog/${recentPost.slug}`"
                  class="block group"
                >
                  <h4 class="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                    {{ recentPost.title }}
                  </h4>
                  <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
                    <Clock class="w-3 h-3" />
                    {{ formatDate(recentPost.published_at) }}
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- 提示卡片 -->
            <div class="bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5 rounded-2xl p-4 sm:p-6 border border-[#FF4D94]/10">
              <h3 class="font-black text-gray-900 mb-3 text-sm sm:text-base">💡 提示</h3>
              <p class="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                喜欢这篇文章？欢迎在下方留言分享你的想法！
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
