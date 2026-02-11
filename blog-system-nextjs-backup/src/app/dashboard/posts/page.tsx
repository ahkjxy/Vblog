import { createClient } from '@/lib/supabase/server'
import { PostsTable } from '@/components/dashboard/PostsTable'
import { redirect } from 'next/navigation'

export default async function PostsPage() {
  const supabase = await createClient()
  
  // 1. 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/unified')
  }

  // 2. 获取用户 Profile 和 Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    // 如果没有 profile，可能需要重定向去创建 profile 或者显示错误
    // 这里简单处理为重定向
    redirect('/auth/unified')
  }

  // 3. 检查权限
  const isSuperAdmin = profile.role === 'admin' && 
    profile.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'

  // 4. 构建查询
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_author_id_fkey(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // 5. 应用权限过滤
  if (!isSuperAdmin) {
    query = query.eq('author_id', user.id)
  }

  // 6. 执行查询
  const { data: posts, count, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    // 可以渲染一个 Error Component 或者传递空数据
  }

  return (
    <PostsTable 
      initialPosts={posts || []} 
      totalCount={count || 0}
      isSuperAdmin={isSuperAdmin}
      currentUserId={user.id}
    />
  )
}
