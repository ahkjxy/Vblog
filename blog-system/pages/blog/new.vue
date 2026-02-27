<script setup lang="ts">
import { Sparkles, Send, X, Tag, FolderOpen } from 'lucide-vue-next'
import { pinyin } from 'pinyin-pro'

definePageMeta({
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft' as 'draft' | 'published'
})

const selectedCategories = ref<string[]>([])
const selectedTags = ref<string[]>([])
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// 获取分类和标签（使用公共数据 Composable）
const commonData = useCommonData()
const { data: taxonomies } = await useAsyncData('new-post-taxonomies', async () => {
  const [categories, tags] = await Promise.all([
    commonData.fetchCategories(),
    commonData.fetchTags()
  ])

  return {
    categories,
    tags
  }
})

// 生成 slug（中文转拼音）
function generateSlug(text: string) {
  if (!text) return ''
  
  // 使用 pinyin-pro 将中文转为拼音
  let slug = pinyin(text, {
    toneType: 'none',  // 不带声调
    type: 'array',     // 返回数组
    separator: '-'     // 用连字符分隔
  })
  
  // 如果返回的是数组，转为字符串
  if (Array.isArray(slug)) {
    slug = slug.join('-')
  }
  
  // 清理和格式化
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')      // 空格和下划线转为连字符
    .replace(/[·•]/g, '-')         // 中文间隔号转为连字符
    .replace(/[^\w-]/g, '')        // 只保留字母、数字和连字符
    .replace(/-+/g, '-')           // 多个连字符合并为一个
    .replace(/^-+|-+$/g, '')       // 删除首尾连字符
  
  return slug
}

// 自动生成 slug
watch(() => form.value.title, (newTitle) => {
  // 只有当 slug 为空时才自动生成
  if (!form.value.slug) {
    form.value.slug = generateSlug(newTitle)
  }
})

// 自动生成摘要
const generateExcerpt = () => {
  let text = form.value.content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  const maxLength = 150
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...'
  }
  
  form.value.excerpt = text
}

// 保存文章
const handleSubmit = async () => {
  error.value = null
  
  if (!form.value.title.trim()) {
    error.value = '请输入文章标题'
    return
  }

  if (!form.value.content.trim()) {
    error.value = '请输入文章内容'
    return
  }

  saving.value = true

  try {
    // 验证 slug
    let finalSlug = form.value.slug.trim() || generateSlug(form.value.title)
    
    // 检查 slug 是否重复
    let slugExists = true
    let counter = 1
    while (slugExists) {
      const { data: existingPost } = await client
        .from('posts')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle()

      if (!existingPost) {
        slugExists = false
      } else {
        finalSlug = `${form.value.slug || generateSlug(form.value.title)}-${counter}`
        counter++
      }
    }

    // 如果没有摘要，自动生成
    let finalExcerpt = form.value.excerpt.trim()
    if (!finalExcerpt && form.value.content) {
      const text = form.value.content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*|__/g, '')
        .replace(/\*|_/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (text.length > 150) {
        finalExcerpt = text.substring(0, 150).trim() + '...'
      } else {
        finalExcerpt = text
      }
    }

    // 检查是否是超管
    const { data: userProfile } = await client
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.value!.id)
      .maybeSingle()

    const isSuperAdmin = userProfile?.role === 'admin' && 
                        userProfile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

    // 确定文章状态和审核状态
    let finalStatus = form.value.status
    let reviewStatus = 'pending'
    let reviewedBy = null
    let reviewedAt = null
    
    if (isSuperAdmin) {
      // 超管：自动审核通过
      reviewStatus = 'approved'
      reviewedBy = user.value!.id
      reviewedAt = new Date().toISOString()
    } else if (form.value.status === 'published') {
      // 普通用户选择发布：需要审核，先设为草稿
      finalStatus = 'draft'
      reviewStatus = 'pending'
    }

    // 插入文章
    const postData: any = {
      title: form.value.title,
      slug: finalSlug,
      content: form.value.content,
      excerpt: finalExcerpt,
      status: finalStatus,
      author_id: user.value!.id,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      review_status: reviewStatus,
      reviewed_by: reviewedBy,
      reviewed_at: reviewedAt,
    }

    const { data: post, error: insertError } = await client
      .from('posts')
      .insert(postData)
      .select()
      .single()

    if (insertError) throw insertError

    // 添加分类关联
    if (selectedCategories.value.length > 0) {
      await client.from('post_categories').insert(
        selectedCategories.value.map((catId: string) => ({ post_id: post.id, category_id: catId }))
      )
    }

    // 添加标签关联
    if (selectedTags.value.length > 0) {
      await client.from('post_tags').insert(
        selectedTags.value.map((tagId: string) => ({ post_id: post.id, tag_id: tagId }))
      )
    }

    success.value = true
    
    // 显示成功消息后跳转
    setTimeout(() => {
      if (isSuperAdmin && finalStatus === 'published') {
        // 超管发布的文章直接跳转到文章页
        router.push(`/blog/${post.slug}`)
      } else {
        // 其他情况跳转到列表页
        router.push('/blog')
      }
    }, 2000)
  } catch (err: any) {
    error.value = err.message || '发布失败，请重试'
    saving.value = false
  }
}

useSeoMeta({
  title: '发布新主题',
  description: '在元气银行社区发布新的讨论主题，分享您的家庭教育经验和心得。',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <NuxtLink 
            to="/blog"
            class="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#FF4D94] transition-colors mb-4"
          >
            <X class="w-4 h-4" />
            返回讨论板
          </NuxtLink>
          <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent">
            发布新主题
          </h1>
          <p class="text-gray-600 mt-2 font-medium">分享您的经验，与社区成员交流互动</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <Send class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="font-black text-green-900 text-lg">提交成功！</h3>
              <p class="text-sm text-green-700 font-medium">
                {{ form.status === 'published' ? '您的主题已提交审核，审核通过后将自动发布' : '草稿已保存' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p class="text-red-600 font-bold text-sm">{{ error }}</p>
          </div>

          <!-- Main Card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                主题标题 *
              </label>
              <input
                id="title"
                type="text"
                required
                v-model="form.title"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4D94] transition-all text-lg font-bold"
                placeholder="输入一个吸引人的标题..."
              />
            </div>

            <!-- Slug -->
            <div>
              <label for="slug" class="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                URL 别名
              </label>
              <input
                id="slug"
                type="text"
                v-model="form.slug"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4D94] transition-all font-medium"
                placeholder="自动生成或手动输入"
              />
              <p class="text-xs text-gray-500 mt-2 font-medium">
                文章链接: /blog/{{ form.slug || 'your-slug-here' }}
              </p>
            </div>

            <!-- Categories -->
            <div v-if="taxonomies && taxonomies.categories.length > 0">
              <label class="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">
                <FolderOpen class="w-4 h-4 inline mr-1" />
                选择分类
              </label>
              <div class="flex flex-wrap gap-3">
                <label
                  v-for="category in taxonomies.categories"
                  :key="category.id"
                  :class="[
                    'px-5 py-3 rounded-xl border-2 cursor-pointer transition-all font-bold text-sm',
                    selectedCategories.includes(category.id)
                      ? 'border-[#7C4DFF] bg-[#7C4DFF]/10 text-[#7C4DFF]'
                      : 'border-gray-200 hover:border-[#7C4DFF]/30 text-gray-700'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="selectedCategories.includes(category.id)"
                    @change="(e) => {
                      const target = e.target as HTMLInputElement
                      if (target.checked) {
                        selectedCategories.push(category.id)
                      } else {
                        const index = selectedCategories.indexOf(category.id)
                        if (index > -1) selectedCategories.splice(index, 1)
                      }
                    }"
                    class="sr-only"
                  />
                  {{ category.name }}
                </label>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="taxonomies && taxonomies.tags.length > 0">
              <label class="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">
                <Tag class="w-4 h-4 inline mr-1" />
                添加标签 <span class="text-gray-400 normal-case">(可选)</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="tag in taxonomies.tags"
                  :key="tag.id"
                  :class="[
                    'px-4 py-2 rounded-full border-2 cursor-pointer transition-all text-sm font-bold',
                    selectedTags.includes(tag.id)
                      ? 'border-[#FF4D94] bg-[#FF4D94]/10 text-[#FF4D94]'
                      : 'border-gray-200 hover:border-[#FF4D94]/30 text-gray-600'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="selectedTags.includes(tag.id)"
                    @change="(e) => {
                      const target = e.target as HTMLInputElement
                      if (target.checked) {
                        selectedTags.push(tag.id)
                      } else {
                        const index = selectedTags.indexOf(tag.id)
                        if (index > -1) selectedTags.splice(index, 1)
                      }
                    }"
                    class="sr-only"
                  />
                  #{{ tag.name }}
                </label>
              </div>
            </div>

            <!-- Excerpt -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="excerpt" class="block text-sm font-black text-gray-700 uppercase tracking-wider">
                  摘要 <span class="text-gray-400 normal-case">(可选)</span>
                </label>
                <button
                  type="button"
                  @click="generateExcerpt"
                  class="flex items-center gap-1 text-sm text-[#7C4DFF] hover:text-[#FF4D94] font-bold transition-colors"
                >
                  <Sparkles class="w-4 h-4" />
                  自动生成
                </button>
              </div>
              <textarea
                id="excerpt"
                v-model="form.excerpt"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4D94] transition-all font-medium"
                placeholder="简短描述您的主题内容，留空将自动从正文提取"
                rows="3"
              />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
                内容 * <span class="text-gray-400 text-xs normal-case">(支持 Markdown 格式)</span>
              </label>
              <DashboardMarkdownEditor v-model="form.content" />
              <p class="text-xs text-gray-500 mt-2 font-medium">
                💡 支持 Markdown 语法：**粗体**、*斜体*、[链接](url)、图片等
              </p>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">
              发布状态
            </label>
            <select
              id="status"
              v-model="form.status"
              class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF4D94] transition-all font-bold"
            >
              <option value="draft">保存为草稿</option>
              <option value="published">立即发布</option>
            </select>
            <p class="text-xs text-gray-500 mt-2 font-medium">
              💡 草稿不会公开显示，可以稍后编辑后再发布
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 font-black text-lg"
            >
              <Send class="w-5 h-5" />
              {{ saving ? '保存中...' : form.status === 'published' ? '发布主题' : '保存草稿' }}
            </button>
            <button
              type="button"
              @click="router.push('/blog')"
              :disabled="saving"
              class="px-8 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 disabled:opacity-50"
            >
              取消
            </button>
          </div>

          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p class="text-sm text-blue-800 font-medium">
              📝 <strong>发布说明：</strong>
            </p>
            <ul class="text-sm text-blue-700 font-medium mt-2 space-y-1 ml-4">
              <li>• 选择"保存为草稿"：内容不会公开，可以稍后继续编辑</li>
              <li>• 选择"立即发布"：提交后进入审核队列，审核通过后自动发布</li>
              <li>• 超管发布的内容会自动审核通过</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
