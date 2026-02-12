/**
 * 资源提示 Composable
 * 用于预加载、预连接和预获取资源
 */

export const useResourceHints = () => {
  const addPreload = (href: string, as: string, type?: string) => {
    if (process.server) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    if (type) link.type = type
    document.head.appendChild(link)
  }

  const addPrefetch = (href: string) => {
    if (process.server) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }

  const addPreconnect = (href: string, crossorigin = false) => {
    if (process.server) return

    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    if (crossorigin) link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }

  const addDNSPrefetch = (href: string) => {
    if (process.server) return

    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = href
    document.head.appendChild(link)
  }

  // 预加载关键资源
  const preloadCriticalResources = () => {
    // 预连接到 Supabase
    const supabaseUrl = useRuntimeConfig().public.supabaseUrl
    if (supabaseUrl) {
      addPreconnect(supabaseUrl, true)
    }
  }

  // 预获取下一页资源
  const prefetchNextPage = (path: string) => {
    addPrefetch(path)
  }

  return {
    addPreload,
    addPrefetch,
    addPreconnect,
    addDNSPrefetch,
    preloadCriticalResources,
    prefetchNextPage
  }
}
