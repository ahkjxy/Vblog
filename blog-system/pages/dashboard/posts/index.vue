<script setup lang="ts">
import { createError } from 'nuxt/app'
import PostsTable from '~/components/dashboard/PostsTable.vue'

definePageMeta({
  layout: 'dashboard'
})

const client = useSupabaseClient()
const { user, profile } = useAuth()

const isSuperAdmin = computed(() => profile.value?.role === 'admin')

const { data: postsData } = await useAsyncData('dashboard-posts-list', async () => {
  if (!user.value) return null

  // 1. 构建查询
  let query = client
    .from('posts')
    .select(`
      *,
      profiles!posts_author_id_fkey(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // 2. 应用权限过滤
  if (!isSuperAdmin.value) {
    query = query.eq('author_id', user.value.id)
  }

  const { data: posts, count, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    throw createError({ statusCode: 500, statusMessage: '获取文章列表失败' })
  }

  return { 
    posts: posts || [], 
    count: count || 0,
    currentUserId: user.value.id
  }
})
</script>

<template>
  <div v-if="postsData">
    <PostsTable 
      :initial-posts="postsData.posts" 
      :total-count="postsData.count"
      :is-super-admin="isSuperAdmin"
      :current-user-id="postsData.currentUserId"
    />
  </div>
</template>
