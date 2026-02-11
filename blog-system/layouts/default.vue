<template>
  <div class="min-h-screen flex flex-col bg-[#FDFCFD]">
    <LayoutAppHeader />
    
    <main class="flex-grow">
      <slot />
    </main>
    
    <LayoutAppFooter />
    
    <!-- 全局组件，如弹窗、加载条等可以放在这里 -->
    <div id="modal-container"></div>
    <CustomerSupport />
  </div>
</template>

<script setup lang="ts">
const { user, profile, fetchProfile } = useAuth()

onMounted(() => {
  if (user.value) {
    fetchProfile()
  }
})

watch(user, (newUser) => {
  if (newUser) {
    fetchProfile()
  } else {
    profile.value = null
  }
})
</script>

<style>
/* 可以在这里添加针对 Layout 的特定样式 */
</style>
