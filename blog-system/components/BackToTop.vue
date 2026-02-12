<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'

const showButton = ref(false)

const handleScroll = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-90"
  >
    <button
      v-if="showButton"
      @click="scrollToTop"
      class="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      aria-label="返回顶部"
      title="返回顶部"
    >
      <ArrowUp class="w-5 h-5 group-hover:animate-bounce" />
    </button>
  </Transition>
</template>
