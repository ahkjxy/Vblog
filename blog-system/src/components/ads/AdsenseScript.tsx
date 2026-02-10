/**
 * Google AdSense 脚本组件
 * 在根布局中引入此组件以加载 AdSense 脚本
 */
export function AdsenseScript() {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // 如果没有配置 AdSense ID，不加载脚本
  if (!adClient) {
    return null
  }

  return (
    <>
      <link
        rel="preconnect"
        href="https://pagead2.googlesyndication.com"
      />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
      />
    </>
  )
}
