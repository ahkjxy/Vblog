export default defineNuxtPlugin(() => {
  // 预加载公共数据
  const commonData = useCommonData()
  
  // 在后台预加载所有公共数据
  if (process.client) {
    // 使用 requestIdleCallback 在浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        commonData.preloadAll()
      })
    } else {
      // 降级方案：使用 setTimeout
      setTimeout(() => {
        commonData.preloadAll()
      }, 1000)
    }
  }
})
