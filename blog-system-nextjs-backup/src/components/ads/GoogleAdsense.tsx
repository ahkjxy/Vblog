'use client'

import { useEffect } from 'react'

interface GoogleAdsenseProps {
  adSlot: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  adLayout?: string
  adLayoutKey?: string
  fullWidthResponsive?: boolean
  className?: string
}

/**
 * Google AdSense 广告组件
 * 
 * 使用方法：
 * 1. 在 Google AdSense 后台创建广告单元，获取 data-ad-slot
 * 2. 在需要显示广告的地方使用此组件
 * 
 * 示例：
 * <GoogleAdsense adSlot="1234567890" />
 */
export function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  fullWidthResponsive = true,
  className = '',
}: GoogleAdsenseProps) {
  useEffect(() => {
    try {
      // 推送广告到 AdSense
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // 从环境变量获取 AdSense 客户端 ID
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // 如果没有配置 AdSense ID，显示占位符（仅在开发环境）
  if (!adClient) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`adsense-container ${className}`}>
          <div className="text-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">📢 广告位置</p>
            <p className="text-xs text-gray-400">
              配置 NEXT_PUBLIC_ADSENSE_CLIENT_ID 后显示
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(adLayout && { 'data-ad-layout': adLayout })}
        {...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey })}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  )
}

/**
 * 文章内广告 - 自适应横幅
 */
export function InArticleAd({ className = '' }: { className?: string }) {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT
  
  if (!adSlot) return null
  
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-2">广告</div>
      <GoogleAdsense
        adSlot={adSlot}
        adFormat="fluid"
        adLayout="in-article"
      />
    </div>
  )
}

/**
 * 侧边栏广告 - 竖版
 */
export function SidebarAd({ className = '' }: { className?: string }) {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT
  
  if (!adSlot) return null
  
  return (
    <div className={`sticky top-24 ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-2">广告</div>
      <GoogleAdsense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={true}
      />
    </div>
  )
}

/**
 * 横幅广告 - 页面顶部或底部
 */
export function BannerAd({ className = '' }: { className?: string }) {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT
  
  if (!adSlot) return null
  
  return (
    <div className={`w-full ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-2">广告</div>
      <GoogleAdsense
        adSlot={adSlot}
        adFormat="auto"
        fullWidthResponsive={true}
      />
    </div>
  )
}

/**
 * 信息流广告 - 适合文章列表
 */
export function FeedAd({ className = '' }: { className?: string }) {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_FEED_SLOT
  
  if (!adSlot) return null
  
  return (
    <div className={`my-6 ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-2">推广</div>
      <GoogleAdsense
        adSlot={adSlot}
        adFormat="fluid"
      />
    </div>
  )
}
