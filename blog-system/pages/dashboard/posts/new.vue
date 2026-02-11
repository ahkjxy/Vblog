<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { user } = useAuth()
const router = useRouter()

// 获取分类和标签
const { data: formOptions } = await useAsyncData('form-options', async () => {
  const [catRes, tagRes] = await Promise.all([
    client.from('categories').select('id, name').order('name'),
    client.from('tags').select('id, name').order('name')
  ])
  return {
    categories: catRes.data || [],
    tags: tagRes.data || []
  }
})

const handleSave = async (postData: any) => {
  if (!user.value) return

  const { data: post, error } = await client
    .from('posts')
    .insert({
      ...postData.post,
      author_id: user.value.id,
      published_at: postData.post.status === 'published' ? new Date().toISOString() : null,
      review_status: 'pending'
    })
    .select()
    .single() as { data: any, error: any }

  if (error) {
    alert('保存失败: ' + error.message)
    return
  }

  // 保存分类关系
  if (postData.categories?.length) {
    await client.from('post_categories').insert(
      postData.categories.map((id: string) => ({ post_id: post.id, category_id: id }))
    )
  }

  // 保存标签关系
  if (postData.tags?.length) {
    await client.from('post_tags').insert(
      postData.tags.map((id: string) => ({ post_id: post.id, tag_id: id }))
    )
  }

  router.push('/dashboard/posts')
}
</script>

<template>
  <DashboardPostEditor 
    v-if="formOptions"
    :categories="formOptions.categories"
    :tags="formOptions.tags"
    @save="handleSave" 
  />
</template>
