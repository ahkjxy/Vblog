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

          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            console.log('🔄 发现新版本 Service Worker')

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('✨ 新版本已安装，准备更新')
                  // 新版本已安装，提示用户刷新
                  showUpdateNotification()
                }
              })
            }
          })

          // 定期检查更新（每小时）
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)

          // 立即检查一次更新
          registration.update()
        })
        .catch((error) => {
          console.error('❌ Service Worker 注册失败:', error)
        })

      // 监听 Service Worker 消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          console.log('📢 Service Worker 已更新到版本:', event.data.version)
          showUpdateNotification()
        }
      })
    })
  }
})

// 显示更新通知
function showUpdateNotification() {
  // 创建一个简单的通知提示
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #FF4D94 0%, #7C4DFF 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    animation: slideIn 0.3s ease-out;
  `
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span>🎉 发现新版本</span>
      <button style="
        background: white;
        color: #FF4D94;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 12px;
      ">立即更新</button>
    </div>
  `

  // 添加动画
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)

  document.body.appendChild(notification)

  // 点击刷新
  notification.addEventListener('click', () => {
    window.location.reload()
  })

  // 3秒后自动刷新
  setTimeout(() => {
    window.location.reload()
  }, 3000)
}
