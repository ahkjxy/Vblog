import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default defineNuxtPlugin((nuxtApp) => {
  // 配置 NProgress
  NProgress.configure({
    showSpinner: false, // 不显示加载旋转器
    trickleSpeed: 200,  // 自动递增间隔
    minimum: 0.3,       // 最小百分比
    easing: 'ease',     // 动画方式
    speed: 500,         // 递增进度条的速度
  })

  // 路由开始时启动进度条
  nuxtApp.hook('page:start', () => {
    NProgress.start()
  })

  // 路由完成时结束进度条
  nuxtApp.hook('page:finish', () => {
    NProgress.done()
  })

  // 路由错误时也要结束进度条
  nuxtApp.hook('page:error', () => {
    NProgress.done()
  })
})
