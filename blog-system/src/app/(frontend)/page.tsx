import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { MessageCircle, Clock, ArrowRight, BookOpen, TrendingUp, Eye, Download, Smartphone, Star, User, Sparkles, FileText, Users as UsersIcon, Layers, Heart } from 'lucide-react'
import { BannerAd } from '@/components/ads'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '元气银行社区',
  description: '家长们分享家庭教育经验、讨论积分管理技巧、交流习惯养成心得的互动社区平台。',
  openGraph: {
    title: '元气银行社区 - 家庭教育交流平台',
    description: '家长们分享经验、交流心得的互动社区',
    type: 'website',
  },
}

type CategoryWithStats = {
  id: string
  name: string
  slug: string
  description: string | null
  post_count: number
  latest_post: {
    title: string
    slug: string
    published_at: string
    author_name: string
  } | null
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name')
  
  // 为每个分类获取统计信息和最新帖子
  const categoriesWithStats: CategoryWithStats[] = []
  
  if (categories) {
    for (const category of categories) {
      const { count } = await supabase
        .from('post_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
      
      const { data: latestPosts } = await supabase
        .from('post_categories')
        .select(`
          posts!inner(
            title,
            slug,
            published_at,
            status,
            profiles!posts_author_id_fkey(name)
          )
        `)
        .eq('category_id', category.id)
        .eq('posts.status', 'published')
        .order('posts(published_at)', { ascending: false })
        .limit(1)
      
      const latestPostData = latestPosts?.[0]?.posts as any
      const latestPost = Array.isArray(latestPostData) ? latestPostData[0] : latestPostData
      
      categoriesWithStats.push({
        ...category,
        post_count: count || 0,
        latest_post: latestPost ? {
          title: latestPost.title,
          slug: latestPost.slug,
          published_at: latestPost.published_at,
          author_name: Array.isArray(latestPost.profiles) 
            ? latestPost.profiles[0]?.name 
            : latestPost.profiles?.name || '匿名'
        } : null
      })
    }
  }
  
  // 获取总统计
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
  
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  // 获取热门文章
  const { data: hotPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      view_count
    `)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(5)
  
  // 获取最新文章
  const { data: recentPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      published_at
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)
  
  // 获取精选文章（浏览最多的文章）
  const { data: featuredPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      view_count,
      profiles!posts_author_id_fkey(name, avatar_url)
    `)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(3)
  
  // 为每篇精选文章获取评论数
  let featuredPostsWithComments = []
  if (featuredPosts) {
    featuredPostsWithComments = await Promise.all(
      featuredPosts.map(async (post: any) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .eq('status', 'approved')
        
        return {
          ...post,
          comment_count: count || 0
        }
      })
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean & Professional */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              元气银行社区
            </h1>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              家长们分享家庭教育经验、交流习惯养成心得的互动平台
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link 
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:shadow-2xl transition-all font-semibold text-lg"
              >
                <BookOpen className="w-5 h-5" />
                浏览主题
              </Link>
              <Link 
                href="https://www.familybank.chat"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-all font-semibold text-lg border-2 border-purple-500"
              >
                立即体验
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{totalPosts || 0}</div>
                <div className="text-sm text-purple-100">讨论主题</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{totalUsers || 0}</div>
                <div className="text-sm text-purple-100">社区成员</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{categoriesWithStats.length}</div>
                <div className="text-sm text-purple-100">讨论板块</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-sm text-purple-100">完全免费</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Posts Section */}
              {featuredPostsWithComments && featuredPostsWithComments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">精选文章</h2>
                        <p className="text-xs text-gray-500">最受欢迎的优质内容</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {featuredPostsWithComments.map((post: any, index: number) => {
                      const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
                      return (
                        <article key={post.id} className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                          {/* Featured Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
                              <Star className="w-3 h-3 text-white fill-white" />
                              <span className="text-xs font-bold text-white">精选</span>
                            </div>
                          </div>
                          
                          {/* Rank Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              'bg-gradient-to-br from-orange-400 to-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          
                          <Link href={`/blog/${post.slug}`} className="block">
                            {/* Gradient Header - Removed, content moved down */}
                            
                            {/* Content */}
                            <div className="p-5">
                              {/* Author Info */}
                              <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-lg border-2 border-gray-100 overflow-hidden">
                                  {author?.avatar_url ? (
                                    <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                      <User className="w-6 h-6 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">
                                    {author?.name ? `${author.name}的家庭` : '匿名家庭'}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(post.published_at)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors mb-3 line-clamp-2 leading-snug">
                                {post.title}
                              </h3>
                              
                              {/* Excerpt */}
                              {post.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                              
                              {/* Stats */}
                              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-medium">{post.view_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                    <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                                  </div>
                                  <span className="text-sm font-medium">{post.comment_count || 0}</span>
                                </div>
                                <div className="ml-auto">
                                  <div className="w-8 h-8 rounded-lg bg-purple-50 group-hover:bg-purple-600 flex items-center justify-center transition-colors">
                                    <ArrowRight className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Categories Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">讨论板块</h2>
                      <p className="text-xs text-gray-500">探索不同主题的讨论</p>
                    </div>
                  </div>
                  <Link 
                    href="/categories"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    查看全部
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                {categoriesWithStats && categoriesWithStats.length > 0 ? (
                  <div className="space-y-3">
                    {categoriesWithStats.map((category) => (
                      <article key={category.id} className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
                        <Link href={`/categories/${category.slug}`} className="block p-4">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                {category.name.charAt(0)}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-900 hover:text-purple-600 transition-colors mb-1">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{category.description}</p>
                              )}
                              {category.latest_post && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span className="truncate">最新：<span className="text-purple-600 font-medium">{category.latest_post.title}</span></span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 text-center hidden sm:block">
                              <div className="w-16 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center border border-purple-100">
                                <div className="text-2xl font-bold text-purple-600">{category.post_count}</div>
                                <div className="text-xs text-gray-500">主题</div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">还没有板块</p>
                    <p className="text-sm text-gray-500 mt-1">敬请期待更多精彩内容</p>
                  </div>
                )}
              </div>
              
              {/* Banner Ad */}
              <BannerAd />
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Hot Posts */}
              {hotPosts && hotPosts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">热门主题</h3>
                  </div>
                  <div className="space-y-4">
                    {hotPosts.map((post: any, index: number) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 line-clamp-2 transition-colors mb-1.5 leading-snug">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                                  <Eye className="w-3 h-3 text-blue-600" />
                                </div>
                                <span className="font-medium">{post.view_count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recent Posts */}
              {recentPosts && recentPosts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">最新主题</h3>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post: any) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-purple-600 line-clamp-2 mb-2 transition-colors leading-snug">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href="/blog"
                    className="flex items-center justify-center gap-1 mt-5 pt-5 border-t text-sm text-purple-600 hover:text-purple-700 font-medium group"
                  >
                    查看更多
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
              
              {/* Download Card */}
              <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">下载应用</h3>
                  <p className="text-sm text-purple-100 mb-5 leading-relaxed">
                    元气银行家庭积分管理系统，培养孩子好习惯
                  </p>
                  <div className="space-y-2.5">
                    <a 
                      href="https://blog.familybank.chat/download/family-bank.apk"
                      download
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-medium text-sm w-full shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <Smartphone className="w-4 h-4" />
                      安卓应用
                    </a>
                    <Link 
                      href="https://www.familybank.chat"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-medium text-sm w-full border border-white/30"
                    >
                      在线体验
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">快速链接</h3>
                </div>
                <div className="space-y-2">
                  <Link href="/about" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">关于我们</span>
                  </Link>
                  <Link href="/docs" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">使用文档</span>
                  </Link>
                  <Link href="/changelog" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">更新日志</span>
                  </Link>
                  <Link href="/contact" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">联系我们</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
