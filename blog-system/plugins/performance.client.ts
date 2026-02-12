export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  // 等待页面完全加载
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!('performance' in window)) return

      const perfData = window.performance.timing
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (!navigation) return

      // 计算关键性能指标
      const metrics = {
        // DNS 查询时间
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        
        // TCP 连接时间
        tcp: perfData.connectEnd - perfData.connectStart,
        
        // 请求响应时间
        request: perfData.responseEnd - perfData.requestStart,
        
        // DOM 解析时间
        domParse: perfData.domInteractive - perfData.domLoading,
        
        // DOM 内容加载完成时间
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        
        // 页面完全加载时间
        pageLoad: perfData.loadEventEnd - perfData.navigationStart,
        
        // 首次渲染时间
        firstPaint: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        
        // 资源加载时间
        resources: perfData.loadEventEnd - perfData.domContentLoadedEventEnd
      }

      // 开发环境下输出性能指标
      if (process.dev) {
        console.group('📊 性能指标')
        console.log('DNS 查询:', `${metrics.dns}ms`)
        console.log('TCP 连接:', `${metrics.tcp}ms`)
        console.log('请求响应:', `${metrics.request}ms`)
        console.log('DOM 解析:', `${metrics.domParse}ms`)
        console.log('DOM 内容加载:', `${metrics.domContentLoaded}ms`)
        console.log('页面完全加载:', `${metrics.pageLoad}ms`)
        console.log('首次渲染:', `${metrics.firstPaint}ms`)
        console.log('资源加载:', `${metrics.resources}ms`)
        console.groupEnd()

        // 性能评分
        const score = metrics.pageLoad < 2000 ? '优秀 🎉' : 
                     metrics.pageLoad < 3000 ? '良好 👍' : 
                     metrics.pageLoad < 5000 ? '一般 😐' : '需要优化 ⚠️'
        console.log(`性能评分: ${score}`)
      }

      // 获取 Core Web Vitals
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1] as any
            if (process.dev) {
              console.log('LCP (最大内容绘制):', `${lastEntry.renderTime || lastEntry.loadTime}ms`)
            }
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (process.dev) {
                console.log('FID (首次输入延迟):', `${entry.processingStart - entry.startTime}ms`)
              }
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })

          // Cumulative Layout Shift (CLS)
          let clsScore = 0
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsScore += entry.value
              }
            })
            if (process.dev) {
              console.log('CLS (累积布局偏移):', clsScore.toFixed(3))
            }
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          // 某些浏览器可能不支持某些指标
        }
      }

      // 检测慢速资源
      if (navigation.getEntriesByType) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
        const slowResources = resources.filter(r => r.duration > 1000)
        
        if (slowResources.length > 0 && process.dev) {
          console.group('⚠️ 慢速资源 (>1s)')
          slowResources.forEach(r => {
            console.log(`${r.name}: ${r.duration.toFixed(0)}ms`)
          })
          console.groupEnd()
        }
      }
    }, 0)
  })
})
