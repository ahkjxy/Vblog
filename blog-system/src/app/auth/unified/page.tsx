'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { BookOpen, Home, Sparkles, ArrowRight } from 'lucide-react'

export default function UnifiedAuthPage() {
  const router = useRouter()
  const [selectedSystem, setSelectedSystem] = useState<'blog' | 'family' | null>(null)

  const handleSelectSystem = (system: 'blog' | 'family') => {
    setSelectedSystem(system)
    // 跳转到登录页面，带上 redirect 参数
    router.push(`/auth?redirect=${system}`)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#FDFCFD] via-[#FFF5F9] to-[#EAF6FF] sm:px-6 py-12 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF4D94]/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C4DFF]/10 blur-[100px] rounded-full animate-pulse duration-[4000ms]"></div>
      
      <div className="w-full sm:max-w-[520px] bg-white sm:bg-white/80 backdrop-blur-3xl sm:rounded-[48px] sm:shadow-[0_32px_100px_-24px_rgba(0,0,0,0.12)] sm:border border-white/50 p-8 sm:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="space-y-4 text-center">
          <Link href="/" className="inline-block">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] opacity-30 blur-2xl rounded-full animate-pulse" />
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] rounded-[24px] flex items-center justify-center relative shadow-2xl shadow-[#FF4D94]/30 rotate-3 hover:rotate-0 transition-all duration-500 group overflow-hidden">
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Logo className="w-8 h-8 text-white group-hover:scale-110 transition-transform drop-shadow-md" />
              </div>
            </div>
          </Link>
          
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF4D94]">元 气 银 行</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mt-2">选择进入系统</h2>
            <p className="text-sm font-bold text-gray-500 leading-snug mt-3">
              请选择您要进入的系统
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Blog System */}
          <button
            onClick={() => handleSelectSystem('blog')}
            className="w-full group relative overflow-hidden bg-white rounded-3xl border-2 border-gray-100 hover:border-[#FF4D94]/30 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF4D94]/5 to-[#7C4DFF]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#7C4DFF] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-gray-900 mb-1 group-hover:text-[#FF4D94] transition-colors">
                  博客系统
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  分享家庭管理智慧，记录成长点滴
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF4D94] group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Family System */}
          <button
            onClick={() => handleSelectSystem('family')}
            className="w-full group relative overflow-hidden bg-white rounded-3xl border-2 border-gray-100 hover:border-[#7C4DFF]/30 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C4DFF]/5 to-[#FF4D94]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#9E7AFF] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-gray-900 mb-1 group-hover:text-[#7C4DFF] transition-colors">
                  家庭系统
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                  管理家庭积分，记录成长点滴
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#7C4DFF] group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center justify-center gap-3 opacity-60">
            <span className="w-10 h-px bg-gray-100"></span>
            <Sparkles className="w-3 h-3" />
            统一登录系统
            <Sparkles className="w-3 h-3" />
            <span className="w-10 h-px bg-gray-100"></span>
          </p>
          <p className="text-xs text-gray-500 mt-3 font-medium">
            一次登录，两个系统通用
          </p>
        </div>
      </div>
    </div>
  )
}

