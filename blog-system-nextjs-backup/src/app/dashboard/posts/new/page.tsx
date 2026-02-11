import { createClient } from '@/lib/supabase/server'
import { NewPostForm } from '@/components/dashboard/NewPostForm'
import { redirect } from 'next/navigation'

export default async function NewPostPage() {
  const supabase = await createClient()

  // 1. Check Auth (Redirect if not logged in)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/unified')
  }

  // 2. Fetch Categories & Tags (Initial data for the form)
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const { data: tags } = await supabase.from('tags').select('*').order('name')

  return (
    <NewPostForm 
      categories={categories || []}
      tags={tags || []}
    />
  )
}
