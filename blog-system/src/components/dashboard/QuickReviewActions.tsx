'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface QuickReviewActionsProps {
  type: 'post' | 'comment'
  id: string
  onSuccess?: () => void
}

export function QuickReviewActions({ type, id, onSuccess }: QuickReviewActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const showToast = (message: string, isSuccess: boolean) => {
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5 ${
      isSuccess 
        ? 'bg-green-50 text-green-800 border border-green-200' 
        : 'bg-red-50 text-red-800 border border-red-200'
    }`
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        ${isSuccess 
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'
        }
      </svg>
      <span class="font-medium">${message}</span>
    `
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.classList.add('animate-out', 'slide-out-to-top-5')
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const handleApprove = async () => {
    if (!supabase) return
    
    setLoading(true)
    try {
      if (type === 'post') {
        const { error } = await supabase
          .from('posts')
          .update({ review_status: 'approved' })
          .eq('id', id)
        
        if (error) throw error
        showToast('文章已通过审核', true)
      } else {
        const { error } = await supabase
          .from('comments')
          .update({ status: 'approved' })
          .eq('id', id)
        
        if (error) throw error
        showToast('评论已通过审核', true)
      }
      
      setTimeout(() => {
        router.refresh()
        if (onSuccess) onSuccess()
      }, 500)
    } catch (error) {
      console.error('审核失败:', error)
      showToast('审核失败，请重试', false)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!supabase) return
    
    setLoading(true)
    try {
      if (type === 'post') {
        const { error } = await supabase
          .from('posts')
          .update({ review_status: 'rejected' })
          .eq('id', id)
        
        if (error) throw error
        showToast('文章已拒绝', true)
      } else {
        const { error } = await supabase
          .from('comments')
          .update({ status: 'rejected' })
          .eq('id', id)
        
        if (error) throw error
        showToast('评论已拒绝', true)
      }
      
      setTimeout(() => {
        router.refresh()
        if (onSuccess) onSuccess()
      }, 500)
    } catch (error) {
      console.error('拒绝失败:', error)
      showToast('操作失败，请重试', false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
      <button
        onClick={handleApprove}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 border border-green-200"
        title="通过"
      >
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">通过</span>
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
        title="拒绝"
      >
        <X className="w-4 h-4" />
        <span className="text-sm font-medium">拒绝</span>
      </button>
    </div>
  )
}
