<template>
  <div class="min-h-screen flex flex-col bg-[#FDFCFD]">
    <LayoutAppHeader />
    
    <!-- 添加 padding-top 避免被 fixed header 遮挡 -->
    <main class="flex-grow pt-16 lg:pt-0">
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
