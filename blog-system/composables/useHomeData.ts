export const useHomeData = async () => {
  const client = useSupabaseClient()

  // 1. 获取基础统计
  const [
    { count: totalPosts },
    { count: totalUsers },
    { count: totalComments }
  ] = await Promise.all([
    client.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    client.from('profiles').select('*', { count: 'exact', head: true }),
    client.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved')
  ])

  // 2. 获取分类
  const { data: categories } = await client
    .from('categories')
    .select('id, name, slug, description')
    .order('name')

  // 3. 获取分类统计
  const categoriesWithStats = []
  if (categories) {
    for (const category of categories) {
      const { data: postCategories } = await client
        .from('post_categories')
        .select('post_id')
        .eq('category_id', category.id)
      
      const postIds = postCategories?.map(pc => pc.post_id) || []
      
      let postCount = 0
      if (postIds.length > 0) {
        const { count } = await client
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .in('id', postIds)
          .eq('status', 'published')
        postCount = count || 0
      }
      
      let latestPost = null
      if (postIds.length > 0) {
        const { data: latestPosts } = await client
          .from('posts')
          .select('id, title, slug, published_at, view_count, profiles!posts_author_id_fkey(name, avatar_url)')
          .in('id', postIds)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (latestPosts) {
          const { count: commentCount } = await client
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', latestPosts.id)
            .eq('status', 'approved')
          
          latestPost = {
            ...latestPosts,
            commentCount: commentCount || 0,
            author_name: latestPosts.profiles?.name || '匿名'
          }
        }
      }
      
      categoriesWithStats.push({
        ...category,
        postCount,
        latestPost
      })
    }
  }

  // 4. 获取精选文章
  const { data: featuredPostsRaw } = await client
    .from('posts')
    .select('id, title, slug, excerpt, published_at, view_count, profiles!posts_author_id_fkey(name, avatar_url)')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(3)

  const featuredPosts = featuredPostsRaw ? await Promise.all(
    featuredPostsRaw.map(async (post: any) => {
      const { count } = await client
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
        .eq('status', 'approved')
      return { ...post, commentCount: count || 0 }
    })
  ) : []

  // 5. 获取侧边栏数据
  const [
    { data: hotPosts },
    { data: recentPosts },
    { data: recentComments },
    { data: tags }
  ] = await Promise.all([
    client.from('posts').select('id, title, slug, view_count').eq('status', 'published').order('view_count', { ascending: false }).limit(5),
    client.from('posts').select('id, title, slug, published_at').eq('status', 'published').order('published_at', { ascending: false }).limit(5),
    client.from('comments').select('id, content, created_at, author_name, posts!comments_post_id_fkey(title, slug)').eq('status', 'approved').order('created_at', { ascending: false }).limit(5),
    client.from('tags').select('id, name, slug').limit(12)
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
    hotPosts: hotPosts || [],
    recentPosts: recentPosts || [],
    recentComments: recentComments || [],
    tags: tags || []
  }
}
