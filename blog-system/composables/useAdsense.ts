export const useAdsense = () => {
  const route = useRoute()
  const config = useRuntimeConfig()
  
  // 检查是否应该显示广告
  const shouldShowAds = computed(() => {
    const path = route.path
    
    // 不显示广告的页面（低价值或功能性页面）
    const noAdsPages = [
      '/dashboard',      // 所有 dashboard 页面
      '/auth',           // 所有认证页面
      '/profile/edit',   // 个人资料编辑
      '/auth-debug',     // 调试页面
      '/test',           // 测试页面
      '/test-auth',      // 测试认证页面
      '/blog/new',       // 新建文章页面
    ]
    
    // 检查是否在禁止广告的页面
    const isNoAdsPage = noAdsPages.some(page => path.startsWith(page))
    
    // 检查是否配置了 AdSense
    const hasAdsenseConfig = !!(config.public.adsenseClientId)
    
    return hasAdsenseConfig && !isNoAdsPage
  })
  
  // 加载 AdSense 脚本
  const loadAdsenseScript = () => {
    if (!shouldShowAds.value) return
    
    const clientId = config.public.adsenseClientId
    if (!clientId) return
    
    useHead({
      script: [
        {
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`,
          async: true,
          crossorigin: 'anonymous'
        }
      ]
    })
  }
  
  return {
    shouldShowAds,
    loadAdsenseScript,
    adsenseClientId: config.public.adsenseClientId,
    bannerSlot: config.public.adsenseBannerSlot,
    sidebarSlot: config.public.adsenseSidebarSlot,
    articleSlot: config.public.adsenseArticleSlot,
  }
}
