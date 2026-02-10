import { Calendar, Sparkles, Bug, Zap, Shield, Palette, Code } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '更新日志',
  description: '查看元气银行博客系统的最新更新和改进，了解系统的发展历程和新功能发布。',
  openGraph: {
    title: '更新日志 | 元气银行博客',
    description: '查看元气银行博客系统的最新更新和改进',
    type: 'website',
  },
}

interface ChangelogEntry {
  version: string
  date: string
  type: 'feature' | 'fix' | 'improvement' | 'security'
  changes: {
    category: string
    items: string[]
  }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.4.1',
    date: '2026-02-10',
    type: 'fix',
    changes: [
      {
        category: 'AdSense 错误修复',
        items: [
          '修复 "data-nscript attribute not supported" 错误',
          '移除 Script 组件的 async 属性，改用 lazyOnload 策略',
          '修复 "Invalid data-ad-layout value: in-feed" 错误',
          '优化广告格式配置，移除不支持的布局参数',
          'BannerAd 改用 adFormat="auto" 提升兼容性',
          'FeedAd 移除 adLayout 参数，使用纯 fluid 格式',
          '改进 GoogleAdsense 组件，只在有值时添加 data-ad-layout 属性'
        ]
      },
      {
        category: '性能优化',
        items: [
          'AdSense 脚本使用 lazyOnload 策略，在浏览器空闲时加载',
          '不阻塞页面加载，提升用户体验',
          '减少控制台错误，提升开发体验'
        ]
      }
    ]
  },
  {
    version: '2.4.0',
    date: '2026-02-10',
    type: 'feature',
    changes: [
      {
        category: 'Google AdSense 集成',
        items: [
          '集成 Google AdSense 广告系统，支持多种广告格式',
          '首页添加横幅广告（英雄区域下方、最新文章列表下方）',
          '文章列表页添加横幅广告和信息流广告（每4篇插入）',
          '文章详情页添加文章内广告和侧边栏广告',
          '创建可复用的广告组件：GoogleAdsense、InArticleAd、SidebarAd、BannerAd、FeedAd',
          '开发环境显示广告占位符，生产环境显示真实广告',
          '完善 AdSense 配置文档和使用指南'
        ]
      },
      {
        category: '公益平台说明',
        items: [
          '创建 PublicWelfareNotice 组件，提供3种展示样式',
          '在首页、关于页、联系页、页脚添加公益说明',
          '移除所有"专业版"、"付费"等收费相关文字',
          '强调平台完全免费，所有功能无限制',
          '说明广告用途：维持运营，不影响用户体验'
        ]
      },
      {
        category: '域名更新',
        items: [
          '将所有下载链接从 www.familybank.chat 更新为 blog.familybank.chat',
          '更新 9 个文件中的域名引用',
          '配置 Next.js 和 Vercel 支持 APK 文件下载',
          '复制 APK 文件到博客系统 public 目录'
        ]
      },
      {
        category: '问题修复',
        items: [
          '修复文章详情页 JSX 结构错误（缺少闭合标签）',
          '修复关于页面重复的 from 导入语句',
          '修复首页最新评论显示在一行的问题',
          '优化评论内容使用单行省略显示',
          '统一页面容器宽度，保持视觉一致性'
        ]
      }
    ]
  },
  {
    version: '2.3.0',
    date: '2026-02-09',
    type: 'improvement',
    changes: [
      {
        category: '反馈管理优化',
        items: [
          '反馈管理中限制回复功能仅超级管理员可用，普通家长只能查看',
          '优化反馈列表显示，只显示提交人姓名信息',
          '新增家庭ID显示功能，超级管理员可查看完整的家庭UUID',
          '博客系统反馈管理添加分页功能（每页10条）',
          '家庭积分银行反馈管理添加分页功能（每页5条）',
          '优化反馈弹窗布局，增大弹窗宽度至max-w-6xl',
          '家庭ID单独一行显示，使用等宽字体，支持自动换行',
          '两个系统的反馈管理界面保持一致的显示风格'
        ]
      },
      {
        category: '用户体验',
        items: [
          '优化长文本显示，避免布局混乱',
          '改进信息层级结构，提升可读性',
          '统一超级管理员权限控制逻辑'
        ]
      }
    ]
  },
  {
    version: '2.2.0',
    date: '2026-02-08',
    type: 'improvement',
    changes: [
      {
        category: 'SEO 优化',
        items: [
          '为所有页面添加完整的 Meta 标签和 Open Graph 数据',
          '实现动态 SEO 元数据生成，文章页面自动生成标题和描述',
          '添加 JSON-LD 结构化数据，提升搜索引擎理解',
          '创建 sitemap.xml 自动生成功能，包含所有文章和页面',
          '优化 robots.txt 配置，控制搜索引擎爬取范围',
          '添加 canonical 链接，避免重复内容问题',
          '优化页面标题模板，提升搜索结果展示效果'
        ]
      },
      {
        category: '性能优化',
        items: [
          '优化元数据查询性能，减少数据库请求',
          '实现结构化数据缓存机制'
        ]
      }
    ]
  },
  {
    version: '2.1.0',
    date: '2026-02-06',
    type: 'feature',
    changes: [
      {
        category: '新功能',
        items: [
          '新增更新日志页面，方便用户查看系统更新历史',
          '客服消息系统集成数据库，超级管理员可查看和回复用户消息',
          '客服窗口自动加载历史聊天记录',
          '家庭删除后自动跳转登录页面，优化用户体验'
        ]
      },
      {
        category: '优化改进',
        items: [
          '登录页面移除 Dark 模式，统一使用亮色主题',
          '优化客服消息加载性能，提升响应速度',
          '改进错误处理逻辑，减少不必要的错误提示'
        ]
      }
    ]
  },
  {
    version: '2.0.0',
    date: '2026-02-04',
    type: 'feature',
    changes: [
      {
        category: '重大更新',
        items: [
          '全新的博客系统架构，基于 Next.js 14 和 Supabase',
          '实现完整的用户认证和权限管理系统',
          '支持 Markdown 编辑器，提供丰富的内容创作体验',
          '新增文章审核系统，超级管理员可审核待发布文章'
        ]
      },
      {
        category: '用户体验',
        items: [
          '响应式设计，完美支持移动端访问',
          '优化页面加载速度，提升用户体验',
          '新增评论系统，支持文章评论和回复',
          '实现媒体库功能，方便管理图片资源'
        ]
      }
    ]
  },
  {
    version: '1.5.0',
    date: '2026-02-02',
    type: 'improvement',
    changes: [
      {
        category: '性能优化',
        items: [
          '优化数据库查询性能，减少响应时间',
          '实现图片懒加载，提升页面加载速度',
          '优化缓存策略，减少服务器负载'
        ]
      },
      {
        category: '安全性',
        items: [
          '加强 RLS 策略，提升数据安全性',
          '实现 CSRF 保护机制',
          '优化密码重置流程，提升账户安全'
        ]
      }
    ]
  },
  {
    version: '1.4.0',
    date: '2026-01-31',
    type: 'feature',
    changes: [
      {
        category: '新功能',
        items: [
          '新增分类管理功能，支持文章分类',
          '实现标签系统，方便文章检索',
          '新增用户管理页面，管理员可管理用户权限',
          '支持文章草稿保存功能'
        ]
      },
      {
        category: '界面优化',
        items: [
          '优化仪表盘界面，提升视觉体验',
          '改进移动端导航菜单',
          '统一组件样式，提升界面一致性'
        ]
      }
    ]
  },
  {
    version: '1.3.0',
    date: '2026-01-29',
    type: 'fix',
    changes: [
      {
        category: '问题修复',
        items: [
          '修复用户注册后无法自动创建 Profile 的问题',
          '修复文章发布后 404 错误',
          '修复评论显示异常的问题',
          '修复图片上传失败的问题'
        ]
      },
      {
        category: '稳定性',
        items: [
          '优化错误处理机制',
          '改进数据库连接稳定性',
          '修复内存泄漏问题'
        ]
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2026-01-28',
    type: 'improvement',
    changes: [
      {
        category: '用户体验',
        items: [
          '优化文章编辑器，支持实时预览',
          '改进搜索功能，提升搜索准确度',
          '新增快捷键支持，提升操作效率',
          '优化加载动画，提升视觉反馈'
        ]
      }
    ]
  },
  {
    version: '1.1.0',
    date: '2026-01-27',
    type: 'feature',
    changes: [
      {
        category: '新功能',
        items: [
          '实现文章评论功能',
          '新增用户头像上传',
          '支持文章点赞功能',
          '新增阅读统计功能'
        ]
      }
    ]
  }
]

const typeConfig = {
  feature: { label: '新功能', color: 'from-purple-500 to-pink-500', icon: Sparkles },
  fix: { label: '问题修复', color: 'from-red-500 to-orange-500', icon: Bug },
  improvement: { label: '优化改进', color: 'from-blue-500 to-cyan-500', icon: Zap },
  security: { label: '安全更新', color: 'from-green-500 to-emerald-500', icon: Shield }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 mb-6 shadow-sm border border-purple-100">
              <Calendar className="w-4 h-4" />
              更新日志
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              持续改进<br />不断进化
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              查看我们的最新更新和改进，了解系统的发展历程
            </p>
          </div>
        </div>
      </div>

      {/* Changelog Timeline */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-transparent hidden md:block"></div>

            <div className="space-y-12">
              {changelog.map((entry) => {
                const config = typeConfig[entry.type]
                const Icon = config.icon
                
                return (
                  <div key={entry.version} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-white border-4 border-purple-500 hidden md:block z-10"></div>

                    {/* Content Card */}
                    <div className="md:ml-20 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white/80">{config.label}</div>
                              <div className="text-2xl font-bold">版本 {entry.version}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-white/90">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{entry.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Changes */}
                      <div className="p-6 space-y-6">
                        {entry.changes.map((change, changeIndex) => (
                          <div key={changeIndex}>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Code className="w-5 h-5 text-purple-600" />
                              {change.category}
                            </h3>
                            <ul className="space-y-2">
                              {change.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0"></span>
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
              <Palette className="w-5 h-5 text-purple-600" />
              <span className="text-gray-600">
                我们会持续更新和改进系统，为您提供更好的体验
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
