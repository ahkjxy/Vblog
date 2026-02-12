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
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
// Layout 不需要额外的逻辑，认证状态由各个组件自己管理
</script>

<style>
/* 可以在这里添加针对 Layout 的特定样式 */
</style>
