export default defineNuxtPlugin(() => {
  // 只在生产环境注册 Service Worker，开发环境跳过
  if (process.dev) {
    console.log('🔧 开发环境：跳过 Service Worker 注册')
    return
  }

  if (process.client && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker 注册成功:', registration.scope)
        })
        .catch((error) => {
          console.error('❌ Service Worker 注册失败:', error)
        })
    })
  }
})
