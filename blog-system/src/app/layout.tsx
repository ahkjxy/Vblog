import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/JsonLd";
import { AdsenseScript } from "@/components/ads";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.familybank.chat'),
  title: {
    default: '元气银行博客 - 家庭教育与积分管理系统',
    template: '%s | 元气银行博客'
  },
  description: '元气银行官方博客，分享家庭教育、积分管理、习惯养成等内容。通过游戏化的方式激励家庭成员养成良好习惯，让家庭关系更加和谐。',
  keywords: ['元气银行', '家庭积分管理', '家庭教育', '习惯养成', '游戏化激励', '家庭管理系统', 'Family Bank'],
  authors: [{ name: '元气银行团队' }],
  creator: '元气银行',
  publisher: '元气银行',
  verification: {
    google: '3UEPzYJSWZBk1GTKL6rnijmHKqYTGJWngxP51zLUGWI',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://blog.familybank.chat',
    title: '元气银行博客 - 家庭教育与积分管理系统',
    description: '元气银行官方博客，分享家庭教育、积分管理、习惯养成等内容',
    siteName: '元气银行博客',
    images: [
      {
        url: '/app-icon.svg',
        width: 1200,
        height: 630,
        alt: '元气银行',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '元气银行博客 - 家庭教育与积分管理系统',
    description: '元气银行官方博客，分享家庭教育、积分管理、习惯养成等内容',
    images: ['/app-icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
        <AdsenseScript />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
