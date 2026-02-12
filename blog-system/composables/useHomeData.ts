/**
 * 首页数据获取 - 优化版
 * 使用公共数据 Composable 避免重复请求
 * 优化数据库查询，消除 N+1 问题
 */
export const useHomeData = async () => {
  const client = useSupabaseClient()
  const commonData = useCommonData()

  // 1. 获取基础统计（并行请求）
  const [
    { count: totalPosts },
    { count: totalUsers },
    { count: totalComments }
  ] = await Promise.all([
    client.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    client.from('profiles').select('*', { count: 'exact', head: true }),
    client.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved')
  ])

  // 2. 获取分类（使用公共数据）
  const categories = await commonData.fetchCategories()

  // 3. 优化：一次性获取所有分类的最新文章和评论数
  const categoryIds = categories.map((cat: any) => cat.id)
  
  // 获取所有分类的文章ID映射
  const { data: allPostCategories } = await client
    .from('post_categories')
    .select('category_id, post_id')
    .in('category_id', categoryIds)
  
  // 构建分类到文章ID的映射
  const categoryPostMap: Record<string, string[]> = {}
  allPostCategories?.forEach((pc: any) => {
    if (!categoryPostMap[pc.category_id]) {
      categoryPostMap[pc.category_id] = []
    }
    categoryPostMap[pc.category_id].push(pc.post_id)
  })
  
  // 获取所有相关文章的最新文章
  const allPostIds = [...new Set(allPostCategories?.map((pc: any) => pc.post_id) || [])]
  const { data: allPosts } = await client
    .from('posts')
    .select('id, title, slug, published_at, view_count, author_id, profiles!posts_author_id_fkey(name, avatar_url)')
    .in('id', allPostIds)
    .eq('status', 'published')
  
  // 获取所有文章的评论数（一次性查询）
  const { data: allCommentCounts } = await client
    .from('comments')
    .select('post_id')
    .in('post_id', allPostIds)
    .eq('status', 'approved')
  
  // 构建文章评论数映射
  const postCommentMap: Record<string, number> = {}
  allCommentCounts?.forEach((comment: any) => {
    postCommentMap[comment.post_id] = (postCommentMap[comment.post_id] || 0) + 1
  })
  
  // 组装分类数据
  const categoriesWithStats = categories.map((category: any) => {
    const postIds = categoryPostMap[category.id] || []
    const categoryPosts = allPosts?.filter((post: any) => postIds.includes(post.id)) || []
    
    // 找到最新文章
    const latestPost = categoryPosts.length > 0
      ? categoryPosts.sort((a: any, b: any) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        )[0]
      : null
    
    return {
      ...category,
      latestPost: latestPost ? {
        ...latestPost,
        commentCount: postCommentMap[latestPost.id] || 0,
        author_name: latestPost.profiles?.name || '匿名'
      } : null
    }
  })

  // 4. 获取精选文章（优化：一次性获取评论数）
  const { data: featuredPostsRaw } = await client
    .from('posts')
    .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name, avatar_url)')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(3)

  const featuredPostIds = featuredPostsRaw?.map((post: any) => post.id) || []
  const { data: featuredComments } = await client
    .from('comments')
    .select('post_id')
    .in('post_id', featuredPostIds)
    .eq('status', 'approved')
  
  const featuredCommentMap: Record<string, number> = {}
  featuredComments?.forEach((comment: any) => {
    featuredCommentMap[comment.post_id] = (featuredCommentMap[comment.post_id] || 0) + 1
  })
  
  const featuredPosts = featuredPostsRaw?.map((post: any) => ({
    ...post,
    commentCount: featuredCommentMap[post.id] || 0
  })) || []

  // 5. 获取侧边栏数据（使用公共数据和并行请求）
  const [
    hotPosts,
    recentPosts,
    tags,
    { data: recentComments }
  ] = await Promise.all([
    commonData.fetchHotPosts(false, 5),
    commonData.fetchRecentPosts(false, 5),
    commonData.fetchTags(false, 12),
    client.from('comments')
      .select('id, content, created_at, author_name, posts!comments_post_id_fkey(title, slug)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return {
    stats: {
      totalPosts: totalPosts || 0,
      totalUsers: totalUsers || 0,
      totalComments: totalComments || 0,
      totalCategories: categories?.length || 0
    },
    categories: categoriesWithStats,
    featuredPosts,
    hotPosts,
    recentPosts,
    recentComments: recentComments || [],
    tags
  }
}
