'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle } from 'lucide-react'

interface ReviewActionsProps {
  postId: string
  reviewStatus: string
}

export function ReviewActions({ postId, reviewStatus }: ReviewActionsProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleReview = async (approve: boolean) => {
    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: reviewError } = await supabase.rpc('approve_post', {
        post_id: postId,
        approve: approve
      })

      if (reviewError) throw reviewError

      alert(approve ? '文章已通过审核' : '文章已被拒绝')
      router.push('/dashboard/posts')
      router.refresh()
    } catch (err: any) {
      console.error('审核失败:', err)
      setError(err.message || '审核失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (reviewStatus !== 'pending') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800">
          此文章已经{reviewStatus === 'approved' ? '通过审核' : '被拒绝'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">审核操作</h3>
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleReview(true)}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          通过审核
        </button>
        <button
          onClick={() => handleReview(false)}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle className="w-5 h-5" />
          拒绝文章
        </button>
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
