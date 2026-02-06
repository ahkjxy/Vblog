import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, formatAuthorName } from '@/lib/utils'
import { ArrowRight, Eye, FolderOpen, Tag, MessageCircle, BookOpen, FileText } from 'lucide-react'
import { FamilyBankCTA } from '@/components/FamilyBankCTA'

export default async function HomePage() {
  const supabase = await createClient()
  
  // 尝试查询带 review_status 的文章，如果字段不存在则回退
  let posts = null;
  let featuredPost = null;
  
  try {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        excerpt, 
        published_at, 
        view_count, 
        author_id, 
        profiles!posts_author_id_fkey(
          name, 
          avatar_url,
          family_id,
          families(name)
        )
      `)
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .order('published_at', { ascending: false })
      .limit(6)
    
    if (postsError && postsError.code === '42703') {
      const { data: fallbackData } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          slug, 
          excerpt, 
          published_at, 
          view_count, 
          author_id, 
          profiles!posts_author_id_fkey(
            name, 
            avatar_url,
            family_id,
            families(name)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6)
      posts = fallbackData
    } else {
      posts = postsData
    }
  } catch (err) {
    const { data: fallbackData } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        excerpt, 
        published_at, 
        view_count, 
        author_id, 
        profiles!posts_author_id_fkey(
          name, 
          avatar_url,
          family_id,
          families(name)
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6)
    posts = fallbackData
  }

  try {
    const { data: featuredData, error: featuredError } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        excerpt, 
        published_at, 
        view_count, 
        author_id, 
        profiles!posts_author_id_fkey(
          name, 
          avatar_url,
          family_id,
          families(name)
        )
      `)
      .eq('status', 'published')
      .eq('review_status', 'approved')
      .order('view_count', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (featuredError && featuredError.code === '42703') {
      const { data: fallbackData } = await supabase
        .from('posts')
        .select(`
          id, 
          title, 
          slug, 
          excerpt, 
          published_at, 
          view_count, 
          author_id, 
          profiles!posts_author_id_fkey(
            name, 
            avatar_url,
            family_id,
            families(name)
          )
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(1)
        .maybeSingle()
      featuredPost = fallbackData
    } else {
      featuredPost = featuredData
    }
  } catch (err) {
    const { data: fallbackData } = await supabase
      .from('posts')
      .select(`
        id, 
        title, 
        slug, 
        excerpt, 
        published_at, 
        view_count, 
        author_id, 
        profiles!posts_author_id_fkey(
          name, 
          avatar_url,
          family_id,
          families(name)
        )
      `)
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(1)
      .maybeSingle()
    featuredPost = fallbackData
  }

  // 获取分类及其文章数
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name')
    .limit(6)

  // 为每个分类获取文章数
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('post_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
      return { ...category, postCount: count || 0 }
    })
  )

  // 获取标签及其文章数
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, slug')
    .order('name')
    .limit(20)

  const tagsWithCount = await Promise.all(
    (tags || []).map(async (tag) => {
      const { count } = await supabase
        .from('post_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', tag.id)
      return { ...tag, postCount: count || 0 }
    })
  )

  // 获取统计数据
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  const { count: totalTags } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })

  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  // 获取最新评论
  const { data: recentComments } = await supabase
    .from('comments')
    .select('id, content, created_at, author_name, post_id, posts!inner(title, slug)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5)

  // 处理评论数据，确保类型正确
  const commentsWithPosts = recentComments?.map(comment => ({
    ...comment,
    posts: Array.isArray(comment.posts) ? comment.posts[0] : comment.posts
  })) || []

  return (
    <div className="min-h-screen">
      {/* Hero Section - Family Bank CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white border-b border-purple-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM3QzRERkYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <FamilyBankCTA />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-bold text-purple-900 mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
              </span>
              精选文章
            </div>
            <div className="group relative bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-purple-100 hover:shadow-2xl hover:border-purple-200 transition-all overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all leading-tight">
                    {featuredPost.title}
                  </h2>
                </Link>
                {featuredPost.excerpt && (
                  <p className="text-xl text-gray-600 mb-10 leading-relaxed">{featuredPost.excerpt}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {featuredPost.profiles?.[0]?.avatar_url ? (
                      <img 
                        src={featuredPost.profiles[0].avatar_url} 
                        alt={featuredPost.profiles[0].name}
                        className="w-14 h-14 rounded-full ring-4 ring-purple-100 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md ring-4 ring-purple-100">
                        {featuredPost.profiles?.[0]?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{formatAuthorName(featuredPost.profiles?.[0])}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{formatDate(featuredPost.published_at!)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {featuredPost.view_count} 阅读
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${featuredPost.slug}`}
                    className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    阅读全文
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="container mx-auto px-6 py-20 bg-gradient-to-b from-transparent to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">最新文章</h2>
              <p className="text-gray-600 text-lg">探索最新的家庭管理智慧</p>
            </div>
            <Link href="/blog" className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-purple-600 hover:text-pink-600 bg-white border-2 border-purple-200 hover:border-pink-300 rounded-xl hover:shadow-md transition-all group">
              查看全部
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => {
                const gradients = [
                  { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-50' },
                  { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-50' },
                  { from: 'from-purple-600', to: 'to-indigo-500', bg: 'bg-purple-50' },
                  { from: 'from-fuchsia-500', to: 'to-pink-500', bg: 'bg-fuchsia-50' },
                ]
                const gradient = gradients[index % gradients.length]
                
                return (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="bg-white rounded-2xl p-7 hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
                        {/* Color accent bar */}
                        <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${gradient.from} ${gradient.to} mb-5`}></div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-4 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">{post.excerpt}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            {post.profiles?.[0]?.avatar_url ? (
                              <img 
                                src={post.profiles[0].avatar_url} 
                                alt={post.profiles[0].name}
                                className="w-9 h-9 rounded-full ring-2 ring-gray-100"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                {post.profiles?.[0]?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-gray-900 text-sm">{formatAuthorName(post.profiles?.[0])}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{post.view_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-purple-200">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">暂无文章</h3>
                <p className="text-gray-600 mb-10 text-lg">还没有发布任何文章，开始创作第一篇吧</p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold text-lg hover:scale-105"
                >
                  登录后台创建文章
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalPosts || 0}</div>
              <div className="text-sm text-gray-600">篇文章</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-md">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalCategories || 0}</div>
              <div className="text-sm text-gray-600">个分类</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-md">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalTags || 0}</div>
              <div className="text-sm text-gray-600">个标签</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center mb-4 shadow-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalComments || 0}</div>
              <div className="text-sm text-gray-600">条评论</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Tags Section */}
      <section className="container mx-auto px-6 py-20 bg-gradient-to-b from-purple-50/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">热门分类</h2>
                  <p className="text-gray-600">按主题浏览内容</p>
                </div>
                <Link href="/categories" className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-pink-600 transition-colors group">
                  全部
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoriesWithCount.slice(0, 6).map((category, index) => {
                  const gradients = [
                    { from: 'from-purple-500', to: 'to-pink-500' },
                    { from: 'from-pink-500', to: 'to-rose-500' },
                    { from: 'from-purple-600', to: 'to-indigo-500' },
                    { from: 'from-fuchsia-500', to: 'to-pink-500' },
                  ]
                  const gradient = gradients[index % gradients.length]
                  
                  return (
                    <Link 
                      key={category.id} 
                      href={`/categories/${category.slug}`}
                      className="group bg-white rounded-xl p-5 hover:shadow-lg transition-all border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-500">{category.postCount} 篇文章</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Tags Cloud */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">热门标签</h2>
                  <p className="text-gray-600">快速找到感兴趣的话题</p>
                </div>
                <Link href="/tags" className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-pink-600 transition-colors group">
                  全部
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                <div className="flex flex-wrap gap-3">
                  {tagsWithCount.slice(0, 20).map((tag) => {
                    const size = tag.postCount > 10 ? 'text-base' : tag.postCount > 5 ? 'text-sm' : 'text-xs'
                    return (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-full ${size} font-medium text-gray-700 hover:text-purple-600 transition-all hover:scale-105 hover:shadow-md border border-purple-100`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag.name}</span>
                        <span className="text-xs text-gray-500">({tag.postCount})</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Comments Section */}
      {commentsWithPosts && commentsWithPosts.length > 0 && (
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">最新评论</h2>
              <p className="text-gray-600">看看大家都在讨论什么</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commentsWithPosts.slice(0, 3).map((comment, index) => {
                const gradients = [
                  { from: 'from-purple-500', to: 'to-pink-500' },
                  { from: 'from-pink-500', to: 'to-rose-500' },
                  { from: 'from-purple-600', to: 'to-indigo-500' },
                ]
                const gradient = gradients[index % gradients.length]
                
                return (
                  <div key={comment.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <span className="text-white font-bold text-sm">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{comment.author_name}</div>
                        <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">{comment.content}</p>
                    {comment.posts && (
                      <Link 
                        href={`/blog/${comment.posts.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-medium text-purple-600 hover:text-pink-600 transition-colors group"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="truncate">{comment.posts.title}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
