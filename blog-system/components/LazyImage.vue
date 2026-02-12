<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
  class?: string
}>()

const isLoaded = ref(false)
const isInView = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

onMounted(() => {
  if (!imgRef.value) return

  // 使用 Intersection Observer 实现懒加载
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          observer.disconnect()
        }
      })
    },
    {
      rootMargin: '50px' // 提前 50px 开始加载
    }
  )

  observer.observe(imgRef.value)
})

const handleLoad = () => {
  isLoaded.value = true
}
</script>

<template>
  <div 
    ref="imgRef"
    :class="['relative overflow-hidden', props.class]"
    :style="{ 
      aspectRatio: width && height ? `${width}/${height}` : 'auto',
      minHeight: height ? `${height}px` : 'auto'
    }"
  >
    <!-- 占位符 -->
    <div 
      v-if="!isLoaded"
      class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
    />
    
    <!-- 实际图片 -->
    <img
      v-if="isInView"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :class="[
        'w-full h-full object-cover transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      ]"
      loading="lazy"
      decoding="async"
      @load="handleLoad"
    />
  </div>
</template>
