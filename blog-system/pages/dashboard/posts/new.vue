<script setup lang="ts">
import { Sparkles, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
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

// 生成 slug（支持中文转拼音）
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 自动生成摘要
const generateExcerpt = () => {
  // 从 Markdown 内容提取文本
  let text = form.value.content
    .replace(/#{1,6}\s/g, '') // 移除标题标记
    .replace(/\*\*|__/g, '') // 移除加粗标记
    .replace(/\*|_/g, '') // 移除斜体标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // 移除代码块
    .replace(/\n+/g, ' ') // 换行转空格
    .replace(/\s+/g, ' ') // 多个空格转单个
    .trim()
  
  // 截取前 150 个字符
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

    // 检查是否是超级管理员
    const { data: userProfile } = await client
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.value!.id)
      .maybeSingle()

    const isSuperAdmin = userProfile?.role === 'admin' && 
                        userProfile?.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

    // 插入文章
    const postData: any = {
      title: form.value.title,
      slug: finalSlug,
      content: form.value.content,
      excerpt: finalExcerpt,
      status: form.value.status,
      author_id: user.value!.id,
      published_at: form.value.status === 'published' ? new Date().toISOString() : null,
      review_status: isSuperAdmin ? 'approved' : 'pending',
      reviewed_by: isSuperAdmin ? user.value!.id : null,
      reviewed_at: isSuperAdmin ? new Date().toISOString() : null,
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
        selectedCategories.value.map(catId => ({ post_id: post.id, category_id: catId }))
      )
    }

    // 添加标签关联
    if (selectedTags.value.length > 0) {
      await client.from('post_tags').insert(
        selectedTags.value.map(tagId => ({ post_id: post.id, tag_id: tagId }))
      )
    }

    router.push('/dashboard/posts')
  } catch (err: any) {
    error.value = err.message || '保存失败'
    saving.value = false
  }
}

useSeoMeta({
  title: '新建文章'
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        新建文章
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
        {{ error }}
      </div>

      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium mb-2">
          标题 *
        </label>
        <input
          id="title"
          type="text"
          required
          v-model="form.title"
          @input="form.slug = generateSlug(form.title)"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="输入文章标题"
        />
      </div>

      <!-- Slug -->
      <div>
        <label for="slug" class="block text-sm font-medium mb-2">
          URL 别名 (Slug)
        </label>
        <input
          id="slug"
          type="text"
          v-model="form.slug"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="自动生成拼音或手动输入"
        />
        <p class="text-xs text-gray-500 mt-1">
          文章 URL 将是: /blog/{{ form.slug || 'your-slug-here' }}
        </p>
        <p class="text-xs text-purple-600 mt-1">
          💡 中文标题会自动转换为拼音，也可以手动修改
        </p>
      </div>

      <!-- Categories -->
      <div v-if="taxonomies && taxonomies.categories.length > 0">
        <label class="block text-sm font-medium mb-2">
          分类 <span v-if="selectedCategories.length === 0" class="text-gray-400">(未选择将归入"未分类")</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="category in taxonomies.categories"
            :key="category.id"
            :class="[
              'px-4 py-2 rounded-lg border-2 cursor-pointer transition-all',
              selectedCategories.includes(category.id)
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-purple-300'
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
            <span class="text-sm font-medium">{{ category.name }}</span>
          </label>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="taxonomies && taxonomies.tags.length > 0">
        <label class="block text-sm font-medium mb-2">
          标签 <span class="text-gray-400">(可选)</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="tag in taxonomies.tags"
            :key="tag.id"
            :class="[
              'px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all text-sm',
              selectedTags.includes(tag.id)
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-pink-300'
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
            <span>#{{ tag.name }}</span>
          </label>
        </div>
      </div>

      <!-- Excerpt -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label for="excerpt" class="block text-sm font-medium">
            摘要 <span class="text-gray-400">(留空自动生成)</span>
          </label>
          <button
            type="button"
            @click="generateExcerpt"
            class="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <Sparkles class="w-4 h-4" />
            自动生成
          </button>
        </div>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="输入文章摘要，或点击自动生成从正文提取"
          rows="3"
        />
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium mb-2">
          内容 * <span class="text-gray-400 text-xs">(支持 Markdown 格式)</span>
        </label>
        <DashboardMarkdownEditor v-model="form.content" />
      </div>

      <!-- Status -->
      <div>
        <label for="status" class="block text-sm font-medium mb-2">
          状态
        </label>
        <select
          id="status"
          v-model="form.status"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 pt-4 border-t">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
        >
          {{ saving ? '保存中...' : form.status === 'published' ? '发布文章' : '保存草稿' }}
        </button>
        <button
          type="button"
          @click="router.back()"
          class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  </div>
</template>
