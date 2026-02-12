<script setup lang="ts">
// 懒加载评论组件
const Comments = defineAsyncComponent(() =>
  import('~/components/Comments.vue')
)

const props = defineProps<{
  postId: string
}>()
</script>

<template>
  <Suspense>
    <template #default>
      <Comments :post-id="postId" />
    </template>
    <template #fallback>
      <div class="w-full bg-white rounded-2xl border border-gray-200 p-8">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-[#FF4D94] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600 font-bold">加载评论中...</p>
        </div>
      </div>
    </template>
  </Suspense>
</template>
