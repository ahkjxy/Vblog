import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { MessageCircle, Clock, ArrowRight, BookOpen, TrendingUp, Eye, Download, Smartphone, Star, User, Sparkles, FileText, Users as UsersIcon, Layers, Heart, Zap, Award, Target } from 'lucide-react'
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
    view_count: number
    comment_count: number
    author_name: string
    latest_comment_at: string | null
    latest_comment_author: string | null
  } | null
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name')
  
  // 为每个分类获取统计信息和最新帖子（论坛形式）
  const categoriesWithStats: CategoryWithStats[] = []
  
  if (categories) {
    for (const category of categories) {
      // 获取该分类下的所有文章ID
      const { data: postCategories } = await supabase
        .from('post_categories')
        .select('post_id')
        .eq('category_id', category.id)
      
      const postIds = postCategories?.map(pc => pc.post_id) || []
      
      // 统计已发布且审核通过的文章数量
      let postCount = 0
      if (postIds.length > 0) {
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .in('id', postIds)
          .eq('status', 'published')
        postCount = count || 0
      }
      
      // 获取最新帖子（已发布且审核通过）
      let latestPost = null
      if (postIds.length > 0) {
      const { data: latestPosts } = await supabase
          .from('posts')
        .select(`
            id,
            title,
            slug,
            published_at,
            view_count,
            profiles!posts_author_id_fkey(name, avatar_url)
          `)
          .in('id', postIds)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (latestPosts) {
          // 获取该帖子的评论数
          const { count: commentCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', latestPosts.id)
            .eq('status', 'approved')
          
          // 获取最新评论
          const { data: latestComment } = await supabase
            .from('comments')
            .select('created_at, author_name')
            .eq('post_id', latestPosts.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
        .limit(1)
            .maybeSingle()
          
          latestPost = {
            title: latestPosts.title,
            slug: latestPosts.slug,
            published_at: latestPosts.published_at,
            view_count: latestPosts.view_count || 0,
            comment_count: commentCount || 0,
            author_name: Array.isArray(latestPosts.profiles) 
              ? latestPosts.profiles[0]?.name 
              : latestPosts.profiles?.name || '匿名',
            latest_comment_at: latestComment?.created_at || null,
            latest_comment_author: latestComment?.author_name || null
          }
        }
      }
      
      categoriesWithStats.push({
        ...category,
        post_count: postCount,
        latest_post: latestPost
      })
    }
    
    // 按帖子数量排序，活跃的板块在前
    categoriesWithStats.sort((a, b) => {
      // 先按帖子数排序
      if (b.post_count !== a.post_count) {
        return b.post_count - a.post_count
      }
      // 如果帖子数相同，按最新帖子时间排序
      if (b.latest_post?.published_at && a.latest_post?.published_at) {
        return new Date(b.latest_post.published_at).getTime() - new Date(a.latest_post.published_at).getTime()
      }
      return 0
    })
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

  // 获取最新评论
  const { data: recentComments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      author_name,
      created_at,
      post_id,
      posts!inner(title, slug)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)

  // 获取热门标签
  const { data: popularTags } = await supabase
    .from('tags')
    .select('id, name, slug')
    .order('name')
    .limit(30)

  // 计算每个标签的文章数
  let tagsWithCount = []
  if (popularTags) {
    tagsWithCount = await Promise.all(
      popularTags.map(async (tag: any) => {
        // 获取该标签关联的所有文章ID
        const { data: postTags } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', tag.id)
        
        const postIds = postTags?.map(pt => pt.post_id) || []
        
        // 统计已发布且审核通过的文章数量
        let postCount = 0
        if (postIds.length > 0) {
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .in('id', postIds)
            .eq('status', 'published')
          postCount = count || 0
        }
        
        return {
          ...tag,
          post_count: postCount
        }
      })
    )
    // 按文章数排序，只保留有文章数的标签
    tagsWithCount = tagsWithCount.filter(tag => tag.post_count > 0)
    tagsWithCount.sort((a, b) => b.post_count - a.post_count)
    tagsWithCount = tagsWithCount.slice(0, 12) // 只取前12个
  }

  // 获取活跃用户（发帖最多的用户）
  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .order('name')
    .limit(20)

  // 计算每个用户的发帖数
  let usersWithPostCount = []
  if (activeUsers) {
    usersWithPostCount = await Promise.all(
      activeUsers.map(async (user: any) => {
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id)
          .eq('status', 'published')
        
        return {
          ...user,
          post_count: count || 0
        }
      })
    )
    // 按发帖数排序，只保留有发帖的用户
    usersWithPostCount = usersWithPostCount.filter(u => u.post_count > 0)
    usersWithPostCount.sort((a, b) => b.post_count - a.post_count)
    usersWithPostCount = usersWithPostCount.slice(0, 6)
  }

  // 获取总评论数
  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF]">
      {/* Hero Section - 更专业的设计 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94]">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* 品牌标识 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold text-white mb-8 border border-white/30">
              <Sparkles className="w-4 h-4" />
              <span>元气银行社区</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white tracking-tight">
              家庭教育经验
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                交流分享平台
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
              家长们分享家庭教育经验、交流习惯养成心得的互动平台
            </p>
            
            {/* CTA 按钮 */}
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link 
                href="/blog"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#FF4D94] rounded-2xl hover:shadow-2xl transition-all font-black text-lg hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-5 h-5" />
                <span>浏览主题</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="https://www.familybank.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all font-black text-lg border-2 border-white/30 hover:border-white/50"
              >
                <Zap className="w-5 h-5" />
                <span>立即体验</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Stats - 更专业的设计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div className="text-4xl md:text-5xl font-black mb-2 text-white">{totalPosts || 0}</div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">讨论主题</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div className="text-4xl md:text-5xl font-black mb-2 text-white">{totalUsers || 0}</div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">社区成员</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div className="text-4xl md:text-5xl font-black mb-2 text-white">{totalComments || 0}</div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">评论回复</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:scale-105">
                <div className="text-4xl md:text-5xl font-black mb-2 text-white">{categoriesWithStats.length}</div>
                <div className="text-sm font-bold text-white/80 uppercase tracking-wider">讨论板块</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6 lg:space-y-8">
              {/* Featured Posts Section */}
              {featuredPostsWithComments && featuredPostsWithComments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white fill-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">精选文章</h2>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">最受欢迎的优质内容</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredPostsWithComments.map((post: any, index: number) => {
                      const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
                      return (
                        <article key={post.id} className="group relative bg-white rounded-3xl border border-gray-100 hover:border-[#FF4D94]/30 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                          {/* Rank Badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              'bg-gradient-to-br from-orange-400 to-orange-600'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          
                          <Link href={`/blog/${post.slug}`} className="block">
                            <div className="p-6">
                              {/* Author Info */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] overflow-hidden border-2 border-gray-100">
                                  {author?.avatar_url ? (
                                    <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-black text-gray-900 truncate">
                                    {author?.name ? `${author.name}的家庭` : '匿名家庭'}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(post.published_at)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-black text-lg text-gray-900 group-hover:text-[#FF4D94] transition-colors mb-3 line-clamp-2 leading-snug">
                                {post.title}
                              </h3>
                              
                              {/* Excerpt */}
                              {post.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                  {post.excerpt}
                                </p>
                              )}
                              
                              {/* Stats */}
                              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-bold">{post.view_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                  </div>
                                  <span className="text-sm font-bold">{post.comment_count || 0}</span>
                                </div>
                                <div className="ml-auto">
                                  <div className="w-8 h-8 rounded-lg bg-[#FF4D94]/10 group-hover:bg-[#FF4D94] flex items-center justify-center transition-colors">
                                    <ArrowRight className="w-4 h-4 text-[#FF4D94] group-hover:text-white transition-colors" />
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
              
              {/* Categories Section - 论坛形式 */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#9E7AFF] flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">讨论板块</h2>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">探索不同主题的讨论</p>
                    </div>
                  </div>
                  <Link 
                    href="/categories"
                    className="text-[#FF4D94] hover:text-[#7C4DFF] text-sm font-black flex items-center gap-2 uppercase tracking-wider group"
                  >
                    查看全部
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                {categoriesWithStats && categoriesWithStats.length > 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* 表头 */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-b border-gray-100">
                      <div className="col-span-5">
                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">板块</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">主题</span>
                      </div>
                      <div className="col-span-5">
                        <span className="text-xs font-black text-gray-600 uppercase tracking-wider">最新动态</span>
                      </div>
                    </div>
                    
                    {/* 板块列表 */}
                    <div className="divide-y divide-gray-100">
                    {categoriesWithStats.map((category) => (
                        <article key={category.id} className="hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 sm:px-6 py-4 sm:py-5">
                            {/* 板块信息 */}
                            <Link href={`/categories/${category.slug}`} className="col-span-1 md:col-span-5 flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                                {category.name.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-base sm:text-lg text-gray-900 group-hover:text-[#FF4D94] transition-colors mb-1">
                                {category.name}
                              </h3>
                              {category.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 font-medium">{category.description}</p>
                              )}
                            </div>
                            </Link>
                            
                            {/* 统计信息 */}
                            <Link href={`/categories/${category.slug}`} className="col-span-1 md:col-span-2 flex items-center justify-center md:justify-start">
                              <div className="text-center md:text-left">
                                <div className="text-2xl sm:text-3xl font-black text-[#FF4D94] mb-1">{category.post_count}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">主题</div>
                              </div>
                            </Link>
                            
                            {/* 最新动态 */}
                            <div className="col-span-1 md:col-span-5 flex items-center">
                              {category.latest_post ? (
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    href={`/blog/${category.latest_post.slug}`}
                                    className="block group/post"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 rounded-full bg-[#FF4D94] flex-shrink-0"></div>
                                      <span className="text-xs sm:text-sm font-black text-gray-900 group-hover/post:text-[#FF4D94] transition-colors line-clamp-1">
                                        {category.latest_post.title}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                      <span className="font-bold">{category.latest_post.author_name}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3" />
                                        {category.latest_post.comment_count}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {category.latest_post.view_count}
                                      </span>
                                      <span>•</span>
                                      <span className="font-medium">{formatDate(category.latest_post.published_at)}</span>
                                    </div>
                                  </Link>
                                </div>
                              ) : (
                                <div className="text-xs sm:text-sm text-gray-400 font-medium">暂无主题</div>
                              )}
                            </div>
                          </div>
                      </article>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-[#FF4D94]" />
                    </div>
                    <p className="text-gray-600 font-black text-lg">还没有板块</p>
                    <p className="text-sm text-gray-500 mt-2 font-bold">敬请期待更多精彩内容</p>
                  </div>
                )}
              </div>
              
              {/* Latest Comments Section */}
              {recentComments && recentComments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">最新回复</h2>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">社区最新动态</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {recentComments.slice(0, 5).map((comment: any) => (
                        <Link 
                          key={comment.id}
                          href={`/blog/${comment.posts?.slug}`}
                          className="block p-5 hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white text-sm font-black shadow-md">
                              {comment.author_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-black text-gray-900">{comment.author_name || '匿名'}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-bold text-gray-500">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2 leading-relaxed group-hover:text-[#FF4D94] transition-colors">
                                {comment.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs font-bold text-[#7C4DFF]">
                                <FileText className="w-3 h-3" />
                                <span className="line-clamp-1">{comment.posts?.title}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-t border-gray-100">
                      <Link 
                        href="/blog"
                        className="flex items-center justify-center gap-2 text-sm text-[#FF4D94] hover:text-[#7C4DFF] font-black uppercase tracking-wider group"
                      >
                        查看更多回复
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Tags Section */}
              {tagsWithCount && tagsWithCount.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">热门标签</h2>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">发现热门话题</p>
                      </div>
                    </div>
                    <Link 
                      href="/tags"
                      className="text-[#FF4D94] hover:text-[#7C4DFF] text-sm font-black flex items-center gap-2 uppercase tracking-wider group"
                    >
                      查看全部
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-wrap gap-3">
                      {tagsWithCount.map((tag: any) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.slug}`}
                          className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF4D94]/10 to-[#7C4DFF]/10 hover:from-[#FF4D94] hover:to-[#7C4DFF] rounded-2xl border border-[#FF4D94]/20 hover:border-[#FF4D94] transition-all"
                        >
                          <span className="text-sm font-black text-gray-700 group-hover:text-white transition-colors">
                            {tag.name}
                          </span>
                          <span className="text-xs font-bold text-gray-500 group-hover:text-white/80 transition-colors">
                            {tag.post_count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Banner Ad */}
              <BannerAd />
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Hot Posts */}
              {hotPosts && hotPosts.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">热门主题</h3>
                  </div>
                  <div className="space-y-4">
                    {hotPosts.map((post: any, index: number) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                                  <Eye className="w-3 h-3 text-blue-600" />
                                </div>
                                <span>{post.view_count}</span>
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
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">最新主题</h3>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post: any) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-[#FF4D94] line-clamp-2 mb-2 transition-colors leading-snug">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    href="/blog"
                    className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100 text-sm text-[#FF4D94] hover:text-[#7C4DFF] font-black uppercase tracking-wider group"
                  >
                    查看更多
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
              
              {/* Download Card */}
              <div className="bg-gradient-to-br from-[#FF4D94] via-[#7C4DFF] to-[#FF4D94] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Download className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-3">下载应用</h3>
                  <p className="text-sm text-white/90 mb-6 leading-relaxed font-medium">
                    元气银行家庭积分管理系统，培养孩子好习惯
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="https://blog.familybank.chat/download/family-bank.apk"
                      download
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#FF4D94] rounded-2xl hover:bg-white/90 transition-all font-black text-sm w-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      安卓应用
                    </a>
                    <Link 
                      href="https://www.familybank.chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all font-black text-sm w-full border border-white/30"
                    >
                      在线体验
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Active Users Section */}
              {usersWithPostCount && usersWithPostCount.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">活跃贡献者</h3>
                  </div>
                  <div className="space-y-3">
                    {usersWithPostCount.map((user: any, index: number) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all group">
                        {/* 排名徽章 */}
                        {index < 3 && (
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-md ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                            'bg-gradient-to-br from-orange-400 to-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        {index >= 3 && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-gray-400 bg-gray-100">
                            {index + 1}
                          </div>
                        )}
                        {/* 头像 */}
                        <div className="flex-shrink-0">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name}
                              className="w-10 h-10 rounded-xl border-2 border-gray-100 group-hover:border-[#FF4D94] transition-colors"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center text-white text-sm font-black border-2 border-gray-100 group-hover:border-[#FF4D94] transition-colors">
                              {user.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-gray-900 truncate group-hover:text-[#FF4D94] transition-colors">
                            {user.name ? `${user.name}的家庭` : '匿名家庭'}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <FileText className="w-3 h-3" />
                            <span>{user.post_count} 篇主题</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quick Links */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">快速链接</h3>
                </div>
                <div className="space-y-2">
                  <Link href="/about" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span className="text-sm">关于我们</span>
                  </Link>
                  <Link href="/docs" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span className="text-sm">使用文档</span>
                  </Link>
                  <Link href="/changelog" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span className="text-sm">更新日志</span>
                  </Link>
                  <Link href="/contact" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#FF4D94] hover:bg-[#FF4D94]/5 rounded-2xl transition-all group font-bold">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-[#FF4D94]/10 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#FF4D94]" />
                    </div>
                    <span className="text-sm">联系我们</span>
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
