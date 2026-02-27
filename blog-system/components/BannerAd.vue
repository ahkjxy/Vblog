<script setup lang="ts">
const { shouldShowAds, adsenseClientId, bannerSlot } = useAdsense()

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
  
  if (shouldShowAds.value && adsenseClientId && bannerSlot) {
    try {
      // 推送广告到 AdSense
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }
})
</script>

<template>
  <!-- 只在允许的页面显示广告 -->
  <div v-if="mounted && shouldShowAds" class="adsense-container">
    <!-- 开发环境占位符 -->
    <div v-if="!adsenseClientId || !bannerSlot" class="text-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-sm text-gray-500 mb-2">📢 广告位置</p>
      <p class="text-xs text-gray-400">配置 AdSense 后显示</p>
    </div>
    
    <!-- AdSense 广告 -->
    <div v-else>
      <div class="text-xs text-gray-400 text-center mb-2">广告</div>
      <ins
        class="adsbygoogle"
        style="display:block"
        :data-ad-client="adsenseClientId"
        :data-ad-slot="bannerSlot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  </div>
</template>
