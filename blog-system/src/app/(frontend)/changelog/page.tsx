import { Calendar, Sparkles, Bug, Zap, Shield, Palette, Code, Layout, Users, Link2, CheckCircle, MessageSquare, FileText, Settings, Globe, Star } from 'lucide-react'
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
    icon?: any
    items: string[]
  }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.7.0',
    date: '2026-02-10',
    type: 'feature',
    changes: [
      {
        category: '文章管理增强',
        icon: FileText,
        items: [
          '新增分页功能：每页显示 20 篇文章，智能页码显示',
          '新增搜索功能：支持按标题和 Slug 搜索',
          '新增筛选功能：按发布状态（已发布/草稿/已归档）筛选',
          '新增审核状态筛选：按审核状态（已通过/待审核/已拒绝）筛选',
          '新增删除功能：支持删除文章，带确认对话框',
          '权限控制：普通用户只能删除自己的文章，超级管理员可删除所有文章',
          '实时筛选统计：显示当前筛选结果数量和条件'
        ]
      },
      {
        category: '用户体验优化',
        icon: Sparkles,
        items: [
          '作者显示格式统一：所有地方都显示"XX的家庭"',
          '图标化操作按钮：编辑、审核、删除都用图标表示',
          '状态徽章优化：带图标的彩色徽章，更直观',
          '空状态提示：无文章时显示友好提示',
          '加载状态：数据加载时显示加载动画',
          '响应式表格：移动端自适应显示'
        ]
      },
      {
        category: '权限管理',
        icon: Shield,
        items: [
          '普通用户：只能查看和管理自己的文章',
          '超级管理员：可以查看和管理所有文章',
          '作者列显示：只有超级管理员能看到作者列',
          '删除权限：严格控制删除操作权限',
          '审核按钮：只对超级管理员显示待审核文章的审核按钮'
        ]
      },
      {
        category: '认证系统修复',
        icon: Bug,
        items: [
          '修复客户端和服务端认证不一致问题',
          '回退到标准 Supabase 配置',
          '移除跨域登录同步功能（线上不稳定）',
          '使用默认 localStorage 存储认证信息',
          '服务端使用 ANON_KEY 而不是 SERVICE_ROLE_KEY'
        ]
      }
    ]
  },
  {
    version: '2.6.0',
    date: '2026-02-10',
    type: 'improvement',
    changes: [
      {
        category: 'UI 全面优化',
        icon: Palette,
        items: [
          '首页 Hero 区域全新设计：深度渐变背景、光晕效果、图标化统计卡片',
          '精选文章板块：自动展示浏览量最高的文章，带排名徽章和精选标识',
          '讨论板块优化：渐变图标、更大的分类标识、精美的统计框',
          '侧边栏重构：热门主题和最新主题带渐变图标背景',
          '下载卡片升级：紫粉渐变背景、装饰圆圈、悬停缩放效果',
          '快速链接优化：每个链接带图标背景和悬停效果',
          '统一设计语言：所有图标都有渐变背景，圆角统一为 xl'
        ]
      },
      {
        category: '精选文章功能',
        icon: Star,
        items: [
          '自动展示浏览量最高的 3 篇文章',
          '精美的卡片设计：排名徽章（金银铜色）、精选标识',
          '显示作者信息、发布时间、浏览量、评论数',
          '悬停效果：边框变色、阴影增强、箭头图标变色',
          '完全自动化，无需手动设置'
        ]
      },
      {
        category: '代码优化',
        icon: Code,
        items: [
          '移除所有 console.log 调试语句',
          '优化错误处理逻辑',
          '改进代码可读性和维护性',
          '减少不必要的日志输出'
        ]
      },
      {
        category: '视觉设计',
        items: [
          '配色方案：紫色、粉色、橙色、蓝色、绿色渐变',
          '图标使用：Lucide React 图标库，统一风格',
          '动画效果：悬停缩放、颜色过渡、阴影变化',
          '响应式设计：移动端自适应布局'
        ]
      }
    ]
  },
  {
    version: '2.5.0',
    date: '2026-02-10',
    type: 'feature',
    changes: [
      {
        category: '首页重构',
        icon: Layout,
        items: [
          '完全重构首页设计，更简洁专业的布局',
          '简化 Hero 区域，移除复杂装饰，保留核心功能',
          '优化两栏布局：左侧讨论板块（2/3）+ 右侧热门/最新主题（1/3）',
          '精简功能介绍，移除冗余内容',
          '统一视觉风格：圆角、内边距、间距保持一致',
          '优化下载应用卡片，合并到侧边栏',
          '改进信息层次结构，提升用户体验'
        ]
      },
      {
        category: '论坛风格改造',
        icon: MessageSquare,
        items: [
          '首页按分类展示论坛板块，显示主题数和最新帖子',
          '文章列表页改为论坛主题列表风格',
          '分类页改为论坛板块主题列表',
          '使用灰色背景 + 白色卡片的论坛风格',
          '列表式布局：左侧头像 + 中间内容 + 右侧统计',
          '后台管理界面保持不变'
        ]
      },
      {
        category: '分页功能',
        icon: FileText,
        items: [
          'Blog 列表页添加分页功能（每页 20 篇）',
          '分类页面添加分页功能（每页 20 篇）',
          '智能页码显示逻辑（最多显示 7 个页码）',
          '优化数据库查询性能',
          '显示总主题数和当前页码'
        ]
      },
      {
        category: '登录体验优化',
        icon: Users,
        items: [
          'Blog 系统和家庭积分系统实现登录状态同步',
          '优化认证机制，提升用户体验',
          '一个系统登录后，另一个系统自动保持登录状态',
          '简化登录流程，减少重复操作'
        ]
      },
      {
        category: 'UI 优化',
        icon: Palette,
        items: [
          '分类列表页修复文章数量显示错误（之前都显示 1）',
          '分类详情页文章列表添加间隙（修复 item 粘连问题）',
          '优化首页功能介绍区块，添加图标和专业设计',
          '改进下载按钮文案："下载 APK" 改为 "安卓应用"',
          '统一所有页面的视觉风格和间距'
        ]
      },
      {
        category: '导航优化',
        icon: Link2,
        items: [
          '优化系统间跳转体验',
          'Hero 区域添加下载按钮，方便快速访问',
          '优化快速链接布局和样式'
        ]
      }
    ]
  },
  {
    version: '2.4.1',
    date: '2026-02-10',
    type: 'fix',
    changes: [
      {
        category: '广告显示优化',
        icon: Bug,
        items: [
          '修复广告加载错误，提升显示稳定性',
          '优化广告格式配置，提升兼容性',
          '改进广告组件，确保正确显示'
        ]
      },
      {
        category: '性能优化',
        items: [
          '优化广告加载策略，在浏览器空闲时加载',
          '不阻塞页面加载，提升用户体验',
          '减少页面错误，提升浏览体验'
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
        icon: Globe,
        items: [
          '集成 Google AdSense 广告系统',
          '首页、文章列表页、文章详情页添加广告位',
          '支持多种广告格式，优化显示效果',
          '广告不影响阅读体验，布局合理'
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
        category: '链接优化',
        icon: Link2,
        items: [
          '优化系统间跳转链接',
          '更新下载链接地址',
          '改进文件下载体验'
        ]
      },
      {
        category: '问题修复',
        items: [
          '修复文章详情页显示错误',
          '修复页面加载问题',
          '修复首页最新评论显示在一行的问题',
          '优化评论内容显示，使用单行省略',
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
        icon: MessageSquare,
        items: [
          '优化反馈管理功能',
          '改进反馈列表显示',
          '新增管理员专用功能',
          '反馈管理添加分页功能，方便查看',
          '优化反馈弹窗布局，提升可读性',
          '统一界面风格，提升一致性'
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
        icon: Globe,
        items: [
          '为所有页面添加完整的 Meta 标签',
          '实现动态 SEO 元数据生成',
          '添加结构化数据，提升搜索引擎理解',
          '创建 sitemap.xml 自动生成功能',
          '优化 robots.txt 配置',
          '优化页面标题模板'
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
        icon: Shield,
        items: [
          '加强数据访问控制',
          '优化认证流程',
          '改进账户安全机制'
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
                        {entry.changes.map((change, changeIndex) => {
                          const CategoryIcon = change.icon || Code
                          
                          return (
                            <div key={changeIndex}>
                              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                  <CategoryIcon className="w-4 h-4 text-purple-600" />
                                </div>
                                {change.category}
                              </h3>
                              <ul className="space-y-2">
                                {change.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
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
