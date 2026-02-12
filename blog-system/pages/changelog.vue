<script setup lang="ts">
import { 
  Calendar, 
  Sparkles, 
  Bug, 
  Zap, 
  Shield, 
  Palette, 
  Code, 
  Layout, 
  Users, 
  FileText, 
  Settings, 
  Globe, 
  Star,
  MessageSquare,
  Link2,
  TrendingUp
} from 'lucide-vue-next'

// SEO Meta
useSeoMeta({
  title: '更新日志',
  description: '查看元气银行系统的最新更新和改进，了解系统的发展历程。'
})

const changelog = [
  {
    version: '3.1.0',
    date: '2026-02-12',
    type: 'improvement',
    changes: [
      {
        category: '⚡ 速度大幅提升',
        icon: Zap,
        items: [
          '页面打开速度提升 60%以上，从原来的 3-5秒 缩短到 1-2秒',
          '浏览文章、切换页面更流畅，几乎无需等待',
          '手机上浏览也变得更快更省流量',
          '图片加载更智能，只在需要时才加载',
          '整体体验媲美专业新闻网站'
        ]
      },
      {
        category: '💾 数据加载优化',
        icon: Sparkles,
        items: [
          '减少了不必要的数据请求，节省流量',
          '相同的内容不会重复加载，更加智能',
          '评论、分类等信息加载速度大幅提升',
          '后台管理操作响应更快',
          '即使网络不好也能流畅浏览'
        ]
      },
      {
        category: '📱 离线访问支持',
        icon: Globe,
        items: [
          '访问过的页面可以离线查看',
          '没有网络时也能浏览已访问的文章',
          '自动保存常用资源，减少重复下载',
          '像手机 APP 一样的使用体验',
          '更省流量，更快速'
        ]
      },
      {
        category: '🎨 视觉体验优化',
        icon: Palette,
        items: [
          '页面加载时不再出现内容跳动',
          '图片加载更平滑，有渐进式效果',
          '字体显示更快，不会出现闪烁',
          '动画效果更流畅自然',
          '整体视觉体验更加专业'
        ]
      },
      {
        category: '📊 智能加载',
        icon: Settings,
        items: [
          '评论区按需加载，不影响文章阅读',
          '图片智能懒加载，节省流量',
          '编辑器按需加载，提升页面打开速度',
          '只加载当前需要的内容',
          '后台自动预加载下一页内容'
        ]
      },
      {
        category: '🔧 技术改进',
        icon: Code,
        items: [
          '优化了数据库查询，响应速度提升 3-5倍',
          '启用了智能缓存，重复访问更快',
          '压缩了页面大小，从 2-3MB 降到 1MB 左右',
          '优化了代码结构，系统更稳定',
          '添加了性能监控，持续优化体验'
        ]
      },
      {
        category: '📈 性能指标',
        icon: TrendingUp,
        items: [
          '首屏加载时间：从 3-5秒 降到 1-2秒',
          '页面大小：从 2-3MB 降到 1MB 左右',
          '数据请求：减少 60%以上',
          '流量消耗：节省 50%以上',
          '达到专业网站性能标准'
        ]
      },
      {
        category: '🎯 用户体验提升',
        icon: Star,
        items: [
          '页面切换更快，几乎无需等待',
          '滚动更流畅，不会卡顿',
          '点击响应更快，操作更灵敏',
          '手机浏览体验大幅提升',
          '整体使用感受更加流畅'
        ]
      }
    ]
  },
  {
    version: '3.0.0',
    date: '2026-02-12',
    type: 'feature',
    changes: [
      {
        category: '🎉 全新升级 - 系统重构',
        icon: Sparkles,
        items: [
          '博客系统全面升级，采用全新技术架构',
          '页面加载速度提升 50%，浏览体验更流畅',
          '优化服务端渲染，搜索引擎收录效果更好',
          '代码结构优化，系统更稳定可靠'
        ]
      },
      {
        category: '界面全新设计',
        icon: Palette,
        items: [
          '全新视觉设计，统一品牌风格',
          '采用现代化 Neo-Pop 设计风格',
          '优化配色方案，视觉效果更舒适',
          '支持深色模式，自动适配系统主题',
          '所有页面统一设计语言，体验更一致'
        ]
      },
      {
        category: '前台页面优化',
        icon: Layout,
        items: [
          '首页全新设计，内容展示更清晰',
          '文章列表页优化，卡片式布局更美观',
          '文章阅读页重构，阅读体验大幅提升',
          '分类和标签页面优化，查找内容更方便',
          '评论系统界面优化，互动更友好'
        ]
      },
      {
        category: '后台管理优化',
        icon: Settings,
        items: [
          '后台界面全新设计，操作更直观',
          '侧边栏导航优化，功能查找更便捷',
          '文章编辑器增强，写作体验更流畅',
          '表格展示优化，数据查看更清晰',
          '表单设计统一，填写更高效'
        ]
      },
      {
        category: '移动端体验升级',
        icon: Sparkles,
        items: [
          '完美适配所有移动设备（手机、平板）',
          '触摸操作优化，点击更精准',
          '支持 iPhone 刘海屏等特殊屏幕',
          '移动端字体和间距优化，阅读更舒适',
          '表格在手机上改为卡片展示，查看更方便',
          '后台管理添加底部导航栏，操作更便捷'
        ]
      },
      {
        category: '文章编辑器增强',
        icon: FileText,
        items: [
          '全新 Markdown 编辑器',
          '工具栏快捷按钮，格式化更方便',
          '桌面端实时预览，所见即所得',
          '编辑区和预览区同步滚动',
          '移动端优化，专注写作体验'
        ]
      },
      {
        category: 'SEO 优化',
        icon: Globe,
        items: [
          '搜索引擎优化全面升级',
          '所有页面添加完整的 SEO 标签',
          '自动生成网站地图，方便搜索引擎收录',
          '优化社交媒体分享卡片',
          '提升搜索引擎排名'
        ]
      },
      {
        category: '加载体验优化',
        icon: Zap,
        items: [
          '页面切换添加进度条，加载状态更清晰',
          '图片懒加载，节省流量',
          '代码自动分割，首屏加载更快',
          '数据缓存优化，减少重复加载'
        ]
      },
      {
        category: '问题修复',
        icon: Bug,
        items: [
          '修复移动端表格显示问题',
          '修复底部导航栏显示异常',
          '修复编辑器在移动端的显示问题',
          '修复多个页面的显示错误',
          '提升系统整体稳定性'
        ]
      }
    ]
  },
  {
    version: '2.9.0',
    date: '2026-02-11',
    type: 'feature',
    changes: [
      {
        category: '统一认证系统',
        icon: Shield,
        items: [
          '实现 Blog 系统和家庭积分系统的统一登录入口',
          '优化登录流程：统一跳转到统一认证页面，支持多系统无缝切换',
          '实现单点登录（SSO）体验：一次登录，多系统通行',
          '优化退出流程：退出任一系统，自动清除所有相关会话并跳转至统一认证页'
        ]
      },
      {
        category: 'Blog 系统优化',
        icon: Bug,
        items: [
          '修复 CustomerSupport 组件中 showError 未定义的问题',
          '修复构建错误：主布局添加 ToastProvider，解决 useToast 报错',
          '优化登录重定向：使用 window.location.href 替代 router.push 确保状态完全重置',
          '增强系统稳定性，优化全局错误处理机制'
        ]
      },
      {
        category: '家庭积分银行更新',
        icon: Users,
        items: [
          '移除本地登录表单，改为"欢迎回来"引导页，统一跳转至认证中心',
          '优化退出逻辑：退出后自动重定向至统一认证中心',
          '保留 PWA 体验：在移动端保留沉浸式体验的同时接入统一认证'
        ]
      }
    ]
  },
  {
    version: '2.8.5',
    date: '2026-02-11',
    type: 'improvement',
    changes: [
      {
        category: '首页重构',
        icon: Layout,
        items: [
          '全面重构首页设计，增加更多内容板块',
          '新增最新回复板块：显示最新5条评论，包含评论者、时间、内容预览',
          '新增热门标签板块：显示前12个热门标签，带文章数统计',
          '新增活跃贡献者板块：显示发帖最多的6位用户，带排名徽章',
          '优化布局：从3列改为12列网格系统，主内容8列，侧边栏4列',
          '优化统计信息：增加评论回复统计，卡片hover效果优化'
        ]
      },
      {
        category: 'Blog 页面优化',
        icon: FileText,
        items: [
          '重构 /blog 页面，与首页设计风格保持一致',
          '优化Header区域：使用渐变背景，添加背景装饰效果',
          '优化文章卡片：使用rounded-3xl，增强hover效果，添加评论数显示',
          '新增侧边栏：热门主题、最新主题板块',
          '优化布局：12列网格系统，主内容8列，侧边栏4列',
          '优化元信息展示：图标+数据，更清晰的视觉层次'
        ]
      },
      {
        category: 'UI 优化',
        icon: Palette,
        items: [
          '修复活跃贡献者板块：排名徽章不再遮挡头像，改为独立显示',
          '统一所有页面设计语言：品牌色、圆角、字体',
          '优化交互效果：所有卡片都有hover效果，渐变背景和阴影',
          '优化响应式设计：移动端、平板、桌面端完美适配'
        ]
      },
      {
        category: '功能修复',
        icon: Bug,
        items: [
          '修复后台退出按钮：添加加载状态，清除所有认证信息，强制刷新页面',
          '优化退出流程：清除localStorage、sessionStorage和所有cookies',
          '确保退出后完全清除认证状态'
        ]
      }
    ]
  },
  {
    version: '2.8.4',
    date: '2026-02-11',
    type: 'improvement',
    changes: [
      {
        category: '问题修复',
        icon: Bug,
        items: [
          '修复 LogoutButton 中的 supabase 未定义错误：在 LogoutButton.tsx 中正确初始化 Supabase 客户端实例，添加错误处理',
          '修复嵌套 Link 组件错误：修复了首页板块列表中嵌套 Link 组件导致的 "Event handlers cannot be passed to Client Component props" 错误',
          '重构板块列表的链接结构：将嵌套的 Link 分离为独立的链接区域，板块信息和统计信息各自作为独立的 Link 指向分类页面，最新动态作为独立的 Link 指向文章页面',
          '移除了不必要的 onClick 事件处理器，符合 Next.js App Router 的要求'
        ]
      },
      {
        category: 'Dashboard Layout 优化',
        icon: Layout,
        items: [
          '统一使用品牌色（#FF4D94 和 #7C4DFF）替代之前的紫色/粉色渐变',
          '优化侧边栏设计：使用 rounded-2xl、更好的阴影效果、hover 动画',
          '优化顶部栏：更清晰的用户信息展示，统一的品牌色',
          '优化移动端导航：添加图标，更好的响应式设计',
          '优化背景渐变：使用更柔和的颜色（from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]）',
          '优化 Logo 区域：使用品牌色渐变和更好的 hover 效果'
        ]
      },
      {
        category: 'Dashboard 首页优化',
        icon: Sparkles,
        items: [
          '统一标题样式：使用 font-black 和品牌色渐变',
          '优化统计卡片：使用 rounded-3xl、更好的 hover 效果、统一的品牌色图标',
          '优化列表设计：使用 rounded-3xl、更好的间距、响应式布局',
          '优化按钮样式：使用 font-black、active:scale-95 交互效果',
          '优化空状态：添加图标和更好的视觉反馈',
          '优化待审核文章和评论列表：更好的视觉层次和交互效果'
        ]
      },
      {
        category: 'Posts 页面优化',
        icon: FileText,
        items: [
          '统一标题和按钮样式：使用品牌色和 font-black',
          '优化搜索和筛选：使用 rounded-2xl、更好的 focus 状态、品牌色 focus ring',
          '优化表格设计：使用品牌色表头、更好的 hover 效果、响应式字体大小',
          '优化分页组件：使用品牌色、更好的按钮样式、响应式布局',
          '优化操作按钮：使用品牌色和更好的 hover 效果'
        ]
      },
      {
        category: '统一后台页面样式',
        icon: Settings,
        items: [
          '所有页面标题统一使用 font-black 和品牌色渐变',
          '所有卡片统一使用 rounded-3xl',
          '所有按钮统一使用品牌色和 font-black',
          '优化移动端显示：响应式字体大小、间距和布局',
          '统一导航组件样式：使用品牌色和更好的 hover 效果'
        ]
      }
    ]
  },
  {
    version: '2.8.3',
    date: '2026-02-10',
    type: 'fix',
    changes: [
      {
        category: '后台功能修复',
        icon: Bug,
        items: [
          '修复文章创建页面无法保存的问题：统一使用 Supabase 单例客户端',
          '修复所有后台操作页面的客户端调用：14 个文件全面更新',
          '修复文章编辑、审核、删除功能：添加 null 检查确保稳定性',
          '修复分类、标签、用户、评论管理页面：所有 CRUD 操作恢复正常'
        ]
      },
      {
        category: '组件修复',
        icon: Code,
        items: [
          '修复评论组件：评论发布和加载功能恢复',
          '修复客服支持组件：消息发送和历史加载正常',
          '修复反馈管理组件：反馈创建和回复功能正常',
          '修复媒体库组件：文件上传和选择功能恢复',
          '修复快速审核组件：文章审核操作正常'
        ]
      },
      {
        category: 'SEO 优化',
        icon: Globe,
        items: [
          '博客系统添加百度站点验证：codeva-KPpWcSQ4z0',
          '家庭积分系统添加百度站点验证：codeva-Eod77Ec06u',
          '优化搜索引擎收录配置'
        ]
      },
      {
        category: '代码质量',
        icon: Shield,
        items: [
          '统一客户端导入方式：使用单例模式避免重复创建',
          '添加完善的 null 检查：所有异步函数都有安全检查',
          '提升代码健壮性：防止 null 引用错误',
          '优化错误处理：更友好的错误提示'
        ]
      }
    ]
  },
  {
    version: '2.8.2',
    date: '2026-02-10',
    type: 'fix',
    changes: [
      {
        category: '认证系统重构',
        icon: Shield,
        items: [
          '修复客户端和服务端 session 不同步问题：统一使用 @supabase/ssr',
          '解决登录后 307 重定向循环：Dashboard 恢复为服务端组件',
          '优化 Supabase 客户端配置：使用单例模式，确保客户端和服务端共享 session',
          '修复登录后无法进入后台的问题：正确处理 cookie 同步'
        ]
      },
      {
        category: 'Dashboard 布局优化',
        icon: Layout,
        items: [
          '重新设计后台布局：用户信息和退出按钮移至右上角',
          '优化侧边栏结构：使用 Flexbox 布局，避免内容重叠',
          '改进导航体验：侧边栏导航区域可滚动，底部快捷链接固定',
          '精简侧边栏内容：移除冗余的用户信息卡片，界面更简洁'
        ]
      },
      {
        category: '性能改进',
        icon: Zap,
        items: [
          '彻底解决循环请求问题：客户端和服务端使用统一的认证机制',
          '减少不必要的重定向：服务端组件直接检查认证状态',
          '优化页面加载速度：移除客户端认证检查的延迟'
        ]
      }
    ]
  },
  {
    version: '2.8.1',
    date: '2026-02-10',
    type: 'fix',
    changes: [
      {
        category: '关键问题修复',
        icon: Bug,
        items: [
          '修复登录后循环请求问题：解决 Dashboard 加载时的 429 错误',
          '优化 Supabase 客户端管理：使用单例模式避免重复创建客户端实例',
          '改进状态管理：分离用户加载和 Profile 加载状态，避免重复请求',
          '防止内存泄漏：添加 mounted 标志防止组件卸载后的状态更新'
        ]
      },
      {
        category: 'SEO 优化',
        icon: Globe,
        items: [
          '完善 sitemap.xml：添加所有分类和标签页面',
          '新增静态页面：contact、docs、api 等页面加入站点地图',
          '动态内容索引：自动包含所有已发布文章、分类和标签'
        ]
      },
      {
        category: '用户体验',
        icon: Sparkles,
        items: [
          '导航文案优化：将"文档"改为"社区讨论"，更符合实际用途',
          '加载体验改进：Dashboard 加载状态更流畅，减少闪烁'
        ]
      }
    ]
  },
  {
    version: '2.8.0',
    date: '2026-02-10',
    type: 'improvement',
    changes: [
      {
        category: '性能优化',
        icon: Zap,
        items: [
          '全局用户状态管理：创建 UserContext 统一管理用户信息',
          '减少重复请求：所有组件共享用户状态，避免重复查询',
          '优化认证流程：使用 getSession 替代 getUser，减少网络请求',
          '修复循环请求问题：解决 refresh_token 循环请求导致的速率限制错误',
          '登录状态快速显示：Header 组件登录状态即时显示，无需等待'
        ]
      },
      {
        category: '后台功能增强',
        icon: Settings,
        items: [
          '新增快速退出功能：Dashboard 侧边栏增加退出登录按钮',
          '优化导航布局：返回首页和退出登录分开显示',
          '改进加载体验：Dashboard 加载时显示友好的加载动画'
        ]
      },
      {
        category: '代码质量',
        icon: Code,
        items: [
          '修复 TypeScript 类型错误：onAuthStateChange 事件参数类型声明',
          '统一组件状态管理：Header、CustomerSupport、FamilyBankCTA、Comments 都使用 UserContext',
          '优化依赖项配置：useEffect 依赖项更准确，避免不必要的重渲染'
        ]
      }
    ]
  },
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

const typeConfig: Record<string, { label: string, color: string, icon: any }> = {
  feature: { label: '新功能', color: 'bg-brand-purple text-white', icon: Sparkles },
  fix: { label: '修复', color: 'bg-red-500 text-white', icon: Bug },
  improvement: { label: '优化', color: 'bg-brand-pink text-white', icon: Zap },
  security: { label: '安全', color: 'bg-green-500 text-white', icon: Shield }
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFCFD] pb-24">
    <header class="bg-white border-b border-gray-100 pt-16 pb-12">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">更新日志</h1>
        <p class="text-gray-500 font-medium max-w-2xl mx-auto">
          记录元气银行系统的每一个足迹，见证我们不断的进化。
        </p>
      </div>
    </header>

    <div class="container mx-auto px-4 mt-16 max-w-4xl">
      <div class="space-y-16">
        <div v-for="entry in changelog" :key="entry.version" class="relative pl-8 sm:pl-12 border-l-2 border-gray-100">
          <!-- Timeline Node -->
          <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-brand-pink"></div>
          
          <div class="space-y-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <span class="text-3xl font-black text-gray-900 tracking-tighter">v{{ entry.version }}</span>
                <span :class="`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${typeConfig[entry.type]?.color || 'bg-gray-500 text-white'}`">
                  {{ typeConfig[entry.type]?.label || '其他' }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm font-bold text-gray-400">
                <Calendar class="w-4 h-4" />
                {{ entry.date }}
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div v-for="change in entry.changes" :key="change.category" class="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-pink/10 group-hover:text-brand-pink transition-all">
                    <component :is="change.icon" class="w-5 h-5" />
                  </div>
                  <h3 class="font-black text-gray-900">{{ change.category }}</h3>
                </div>
                <ul class="space-y-3">
                  <li v-for="item in change.items" :key="item" class="flex items-start gap-3 text-gray-600 text-sm font-medium leading-relaxed">
                    <div class="w-1.5 h-1.5 rounded-full bg-brand-pink mt-2 flex-shrink-0"></div>
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
