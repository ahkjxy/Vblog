/**
 * 公共数据 Composable
 * 用于管理全局共享的数据，避免重复请求
 */

export const useCommonData = () => {
  const client = useSupabaseClient()
  
  // 使用 Nuxt 的全局状态，避免重复请求
  const categories = useState<any[]>('common-categories', () => [])
  const tags = useState<any[]>('common-tags', () => [])
  const hotPosts = useState<any[]>('common-hot-posts', () => [])
  const recentPosts = useState<any[]>('common-recent-posts', () => [])
  
  // 加载状态
  const categoriesLoading = useState('categories-loading', () => false)
  const tagsLoading = useState('tags-loading', () => false)
  const hotPostsLoading = useState('hot-posts-loading', () => false)
  const recentPostsLoading = useState('recent-posts-loading', () => false)
  
  /**
   * 获取所有分类（带文章数）
   */
  const fetchCategories = async (force = false) => {
    if (categories.value.length > 0 && !force) {
      return categories.value
    }
    
    if (categoriesLoading.value) return categories.value
    
    categoriesLoading.value = true
    
    try {
      // 获取所有分类
      const { data: categoriesData } = await client
        .from('categories')
        .select('id, name, slug, description')
        .order('name')
      
      if (!categoriesData) {
        categories.value = []
        return []
      }
      
      // 获取所有文章-分类关联
      const { data: postCategories } = await client
        .from('post_categories')
        .select('category_id, post_id')
      
      // 获取已发布的文章ID
      const { data: publishedPosts } = await client
        .from('posts')
        .select('id')
        .eq('status', 'published')
      
      const publishedPostIds = new Set(publishedPosts?.map(p => p.id) || [])
      
      // 统计每个分类的文章数
      const categoryPostCounts: Record<string, number> = {}
      postCategories?.forEach(pc => {
        if (publishedPostIds.has(pc.post_id)) {
          categoryPostCounts[pc.category_id] = (categoryPostCounts[pc.category_id] || 0) + 1
        }
      })
      
      // 组合数据
      const categoriesWithCount = categoriesData.map(cat => ({
        ...cat,
        postCount: categoryPostCounts[cat.id] || 0
      }))
      
      categories.value = categoriesWithCount
      return categoriesWithCount
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    } finally {
      categoriesLoading.value = false
    }
  }
  
  /**
   * 获取热门标签
   */
  const fetchTags = async (force = false, limit = 20) => {
    if (tags.value.length > 0 && !force) {
      return tags.value
    }
    
    if (tagsLoading.value) return tags.value
    
    tagsLoading.value = true
    
    try {
      const { data } = await client
        .from('tags')
        .select('id, name, slug')
        .order('name')
        .limit(limit)
      
      tags.value = data || []
      return tags.value
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    } finally {
      tagsLoading.value = false
    }
  }
  
  /**
   * 获取热门文章
   */
  const fetchHotPosts = async (force = false, limit = 8) => {
    if (hotPosts.value.length > 0 && !force) {
      return hotPosts.value
    }
    
    if (hotPostsLoading.value) return hotPosts.value
    
    hotPostsLoading.value = true
    
    try {
      const { data } = await client
        .from('posts')
        .select('id, title, slug, view_count')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit)
      
      hotPosts.value = data || []
      return hotPosts.value
    } catch (error) {
      console.error('Error fetching hot posts:', error)
      return []
    } finally {
      hotPostsLoading.value = false
    }
  }
  
  /**
   * 获取最新文章
   */
  const fetchRecentPosts = async (force = false, limit = 8) => {
    if (recentPosts.value.length > 0 && !force) {
      return recentPosts.value
    }
    
    if (recentPostsLoading.value) return recentPosts.value
    
    recentPostsLoading.value = true
    
    try {
      const { data } = await client
        .from('posts')
        .select('id, title, slug, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)
      
      recentPosts.value = data || []
      return recentPosts.value
    } catch (error) {
      console.error('Error fetching recent posts:', error)
      return []
    } finally {
      recentPostsLoading.value = false
    }
  }
  
  /**
   * 清除缓存
   */
  const clearCache = () => {
    categories.value = []
    tags.value = []
    hotPosts.value = []
    recentPosts.value = []
  }
  
  /**
   * 预加载所有公共数据
   */
  const preloadAll = async () => {
    await Promise.all([
      fetchCategories(),
      fetchTags(),
      fetchHotPosts(),
      fetchRecentPosts()
    ])
  }
  
  return {
    // 数据
    categories,
    tags,
    hotPosts,
    recentPosts,
    
    // 加载状态
    categoriesLoading,
    tagsLoading,
    hotPostsLoading,
    recentPostsLoading,
    
    // 方法
    fetchCategories,
    fetchTags,
    fetchHotPosts,
    fetchRecentPosts,
    clearCache,
    preloadAll
  }
}
