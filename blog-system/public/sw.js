// Service Worker for caching with auto-update
const CACHE_VERSION = `v1.01` // 使用时间戳自动生成版本号
const CACHE_NAME = `familybank-blog-${CACHE_VERSION}`
const STATIC_CACHE = [
  '/',
  '/favicon.svg',
  '/favicon.png',
  '/manifest.webmanifest'
]

// 安装 Service Worker - 立即激活新版本
self.addEventListener('install', (event) => {
  console.log('[SW] 安装新版本:', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE)
    }).then(() => {
      // 强制跳过等待，立即激活
      return self.skipWaiting()
    })
  )
})

// 激活 Service Worker - 清理旧缓存并立即接管页面
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活新版本:', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // 删除所有旧版本的缓存
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 删除旧缓存:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // 立即接管所有页面
      return self.clients.claim()
    })
  )
})

// 拦截请求 - 网络优先策略（确保获取最新内容）
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return

  // 跳过 API 请求和认证相关请求
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/auth/') ||
    event.request.url.includes('supabase')
  ) {
    return
  }

  // 对于 HTML 页面，使用网络优先策略
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 克隆并缓存响应
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // 网络失败时使用缓存
          return caches.match(event.request)
        })
    )
    return
  }

  // 对于静态资源，使用缓存优先策略
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // 后台更新缓存
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse)
            })
          }
        }).catch(() => {})
        return response
      }

      // 缓存未命中，发起网络请求
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})
