import { createClient } from '@/lib/supabase/server'
import { EditPostForm } from '@/components/dashboard/EditPostForm'
import { redirect, notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. 验证登录
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/unified')
  }

  // 2. 获取文章
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // 3. 获取分类和标签（表单选项）
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const { data: tags } = await supabase.from('tags').select('*').order('name')

  // 4. 获取文章已选的分类和标签
  const { data: postCategories } = await supabase
    .from('post_categories')
    .select('category_id')
    .eq('post_id', id)

  const { data: postTags } = await supabase
    .from('post_tags')
    .select('tag_id')
    .eq('post_id', id)

  const selectedCategories = postCategories?.map((pc: { category_id: string }) => pc.category_id) || []
  const selectedTags = postTags?.map((pt: { tag_id: string }) => pt.tag_id) || []

  return (
    <EditPostForm
      post={post}
      categories={categories || []}
      tags={tags || []}
      initialSelectedCategories={selectedCategories}
      initialSelectedTags={selectedTags}
    />
  )
}
