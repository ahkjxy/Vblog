<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const postId = route.params.id as string

const error = ref<string | null>(null)
const saving = ref(false)

// 获取文章数据
const { data: editData } = await useAsyncData(`edit-post-${postId}`, async () => {
  if (!user.value) throw createError({ statusCode: 401, statusMessage: '未登录' })

  // 1. 获取文章
  const { data: post, error: postError } = await client
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (postError || !post) throw createError({ statusCode: 404, statusMessage: '文章未找到' })

  // 2. 检查权限
  const { data: profile } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.value.id)
    .single()

  const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
  const isSuperAdmin = profile?.role === 'admin' && profile?.family_id === SUPER_ADMIN_FAMILY_ID

  if (!isSuperAdmin && post.author_id !== user.value.id) {
    throw createError({ statusCode: 403, statusMessage: '您没有权限编辑此文章' })
  }

  // 3. 获取分类和标签（使用公共数据 Composable）
  const commonData = useCommonData()
  const [categories, tags] = await Promise.all([
    commonData.fetchCategories(),
    commonData.fetchTags()
  ])

  // 4. 获取文章的分类和标签
  const [postCatsRes, postTagsRes] = await Promise.all([
    client.from('post_categories').select('category_id').eq('post_id', postId),
    client.from('post_tags').select('tag_id').eq('post_id', postId)
  ])

  return {
    post,
    categories,
    tags,
    selectedCategories: postCatsRes.data?.map((c: any) => c.category_id) || [],
    selectedTags: postTagsRes.data?.map((t: any) => t.tag_id) || [],
    isSuperAdmin
  }
})

const form = ref({
  title: editData.value?.post.title || '',
  slug: editData.value?.post.slug || '',
  excerpt: editData.value?.post.excerpt || '',
  content: typeof editData.value?.post.content === 'string' 
    ? editData.value.post.content 
    : (editData.value?.post.content ? JSON.stringify(editData.value.post.content, null, 2) : ''),
  status: editData.value?.post.status || 'draft'
})

const selectedCategories = ref<string[]>(editData.value?.selectedCategories || [])
const selectedTags = ref<string[]>(editData.value?.selectedTags || [])

// 保存文章
const handleSubmit = async () => {
  error.value = null
  saving.value = true

  try {
    if (!user.value) throw new Error('未登录')

    // Slug check logic
    let finalSlug = form.value.slug
    if (editData.value?.post.slug !== form.value.slug) {
      let slugExists = true
      let counter = 1
      while (slugExists) {
        const { data: existingPost } = await client
          .from('posts')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', postId)
          .maybeSingle()

        if (!existingPost) {
          slugExists = false
        } else {
          finalSlug = `${form.value.slug}-${counter}`
          counter++
        }
      }
    }

    const updateData: Record<string, unknown> = {
      title: form.value.title,
      slug: finalSlug,
      content: form.value.content,
      excerpt: form.value.excerpt,
      status: form.value.status,
    }

    if (form.value.status === 'published' && editData.value?.post.status !== 'published') {
      updateData.published_at = new Date().toISOString()
    }

    if (editData.value?.isSuperAdmin && form.value.status === 'published') {
      updateData.review_status = 'approved'
      updateData.reviewed_by = user.value.id
      updateData.reviewed_at = new Date().toISOString()
    }

    const { error: updateError } = await client
      .from('posts')
      .update(updateData)
      .eq('id', postId)

    if (updateError) throw updateError

    // Update Categories
    await client.from('post_categories').delete().eq('post_id', postId)
    if (selectedCategories.value.length > 0) {
      await client.from('post_categories').insert(
        selectedCategories.value.map(catId => ({ post_id: postId, category_id: catId }))
      )
    }

    // Update Tags
    await client.from('post_tags').delete().eq('post_id', postId)
    if (selectedTags.value.length > 0) {
      await client.from('post_tags').insert(
        selectedTags.value.map(tagId => ({ post_id: postId, tag_id: tagId }))
      )
    }

    router.push('/dashboard/posts')
  } catch (err: any) {
    error.value = err.message || '保存失败'
    saving.value = false
  }
}

// 删除文章
const handleDelete = async () => {
  if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return

  try {
    const { error: deleteError } = await client
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) throw deleteError

    router.push('/dashboard/posts')
  } catch (err: any) {
    error.value = err.message || '删除失败'
  }
}

useSeoMeta({
  title: '编辑文章'
})
</script>

<template>
  <div v-if="editData" class="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0">
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent mb-2">
        编辑文章
      </h1>
      <p class="text-sm text-gray-600">修改文章内容并保存</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-bold text-gray-700 mb-2">
          标题 <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          v-model="form.title"
          class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94] transition-all text-sm sm:text-base font-medium"
          placeholder="输入文章标题"
        />
      </div>

      <!-- Slug -->
      <div>
        <label for="slug" class="block text-sm font-bold text-gray-700 mb-2">
          URL 别名 (Slug) <span class="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          required
          v-model="form.slug"
          class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94] transition-all font-mono text-sm"
          placeholder="文章 URL 别名"
        />
        <p class="text-xs text-gray-500 mt-1.5">
          文章 URL 将是: /blog/{{ form.slug || 'your-slug' }}
        </p>
      </div>

      <!-- Excerpt -->
      <div>
        <label for="excerpt" class="block text-sm font-bold text-gray-700 mb-2">
          摘要
        </label>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          class="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94] transition-all resize-none text-sm sm:text-base font-medium"
          placeholder="输入文章摘要"
          rows="3"
        />
      </div>

      <!-- Categories -->
      <div v-if="editData.categories.length > 0">
        <label class="block text-sm font-bold text-gray-700 mb-2">
          分类 <span v-if="selectedCategories.length === 0" class="text-gray-400 font-normal">(未选择将归入"未分类")</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="category in editData.categories"
            :key="category.id"
            :class="[
              'px-3 sm:px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-bold',
              selectedCategories.includes(category.id)
                ? 'border-[#FF4D94] bg-[#FF4D94]/10 text-[#FF4D94]'
                : 'border-gray-200 hover:border-[#FF4D94]/30 text-gray-700'
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
      <div v-if="editData.tags.length > 0">
        <label class="block text-sm font-medium mb-2">
          标签 <span class="text-gray-400">(可选)</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="tag in editData.tags"
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

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium mb-2">
          内容 <span class="text-gray-400 text-xs">(支持 Markdown 格式)</span>
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
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="draft">草稿</option>
          <option value="published">发布</option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存更改' }}
        </button>
        <button
          type="button"
          @click="router.back()"
          class="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleDelete"
          class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
        >
          删除文章
        </button>
      </div>
    </form>
  </div>
</template>
