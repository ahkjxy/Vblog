'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

type Mode = 'password' | 'magic'

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preserve all query parameters when redirecting
    const params = new URLSearchParams(searchParams.toString())
    window.location.replace(`/auth/unified?${params.toString()}`)
  }, [searchParams])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] dark:bg-[#0F172A]">
      <div className="w-16 h-16 border-4 border-[#FF4D94]/20 border-t-[#FF4D94] rounded-full animate-spin" />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFCFD] dark:bg-[#0F172A]">
        <div className="w-16 h-16 border-4 border-[#FF4D94]/20 border-t-[#FF4D94] rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
