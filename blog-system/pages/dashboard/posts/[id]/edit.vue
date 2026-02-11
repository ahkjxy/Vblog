<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const { user, profile } = useAuth()
const postId = route.params.id as string

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

interface EditData {
  post: any
  categories: { id: string, name: string }[]
  tags: { id: string, name: string }[]
  initialCategories: string[]
  initialTags: string[]
}

const { data: editData, refresh } = await useAsyncData<EditData>(`edit-post-${postId}`, async () => {
  if (!user.value) throw createError({ statusCode: 401, statusMessage: '未登录' })

  // 1. 获取文章内容
  const { data: postData, error: postError } = await client
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  const post = postData as any
  if (postError || !post) throw createError({ statusCode: 404, statusMessage: '文章未找到' })

  // 2. 检查权限：只有作者或管理员可以编辑
  const isSuperAdmin = profile.value?.role === 'admin'
  if (!isSuperAdmin && post && post.author_id !== user.value?.id) {
    throw createError({ statusCode: 403, statusMessage: '您没有权限编辑此文章' })
  }

  // 3. 获取所有分类和标签
  const [catRes, tagRes] = await Promise.all([
    client.from('categories').select('id, name').order('name'),
    client.from('tags').select('id, name').order('name')
  ])

  // 4. 获取文章当前的分类和标签关系
  const [postCatsRes, postTagsRes] = await Promise.all([
    client.from('post_categories').select('category_id').eq('post_id', postId),
    client.from('post_tags').select('tag_id').eq('post_id', postId)
  ])

  return {
    post,
    categories: (catRes.data as any[]) || [],
    tags: (tagRes.data as any[]) || [],
    initialCategories: (postCatsRes.data as any[])?.map(c => c.category_id) || [],
    initialTags: (postTagsRes.data as any[])?.map(t => t.tag_id) || []
  }
})

const handleSave = async (payload: any) => {
  if (!user.value) return

  try {
    // 1. 更新文章主体
    const { error: postError } = await (client
      .from('posts') as any)
      .update({
        ...payload.post,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)

    if (postError) throw postError

    // 2. 更新分类关系（先删后增）
    await client.from('post_categories').delete().eq('post_id', postId)
    if (payload.categories?.length) {
      await client.from('post_categories').insert(
        payload.categories.map((id: string) => ({ post_id: postId, category_id: id }))
      )
    }

    // 3. 更新标签关系（先删后增）
    await client.from('post_tags').delete().eq('post_id', postId)
    if (payload.tags?.length) {
      await client.from('post_tags').insert(
        payload.tags.map((id: string) => ({ post_id: postId, tag_id: id }))
      )
    }

    router.push('/dashboard/posts')
  } catch (err: any) {
    alert('保存失败: ' + err.message)
  }
}

// 转换 initialData 格式给 PostEditor
const initialDataForEditor = computed(() => {
  if (!editData.value) return null
  return {
    ...editData.value.post,
    categories: editData.value.initialCategories.map(id => ({ id })),
    tags: editData.value.initialTags.map(id => ({ id }))
  }
})
</script>

<template>
  <div v-if="editData">
    <DashboardPostEditor 
      :is-editing="true"
      :initial-data="initialDataForEditor"
      :categories="editData.categories"
      :tags="editData.tags"
      @save="handleSave"
    />
  </div>
</template>
