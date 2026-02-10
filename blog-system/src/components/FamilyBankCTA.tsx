'use client'

import { ExternalLink, Sparkles, Gift, Heart, MessageCircle, Smartphone } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'

interface FamilyBankCTAProps {
  variant?: 'default' | 'compact' | 'banner'
}

export function FamilyBankCTA({ variant = 'default' }: FamilyBankCTAProps) {
  const { user } = useUser()
  const isLoggedIn = !!user

  // 根据登录状态决定跳转链接
  const familyBankUrl = 'https://www.familybank.chat/'

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-3 text-sm md:text-base">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-medium">体验元气银行家庭积分管理系统</span>
          <a
            href={familyBankUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-1.5 bg-white text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-all hover:scale-105"
          >
            {isLoggedIn ? '进入后台' : '立即体验'}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side - Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 text-white">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>元气银行</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white leading-tight">
                体验家庭积分管理系统
              </h3>
              <p className="text-white/90 mb-6 text-sm md:text-base leading-relaxed">
                让家庭激励变得简单高效，支持积分转让、许愿和赠送功能
              </p>
              
              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                  <Gift className="w-3.5 h-3.5" />
                  <span>积分转让</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                  <Heart className="w-3.5 h-3.5" />
                  <span>许愿功能</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>家庭聊天</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>安卓应用</span>
                </div>
              </div>
            </div>
            
            {/* Right side - CTA Button */}
            <div className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={familyBankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-purple-50 transition-all hover:scale-110 hover:shadow-2xl group"
                >
                  <span>{isLoggedIn ? '进入后台' : '立即体验'}</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://blog.familybank.chat/download/family-bank.apk"
                  download
                  className="inline-flex items-center gap-2 px-6 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-full font-bold hover:bg-white/30 transition-all hover:scale-110 group"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>安卓版</span>
                </a>
              </div>
              <div className="text-center mt-3 text-xs text-white/80">
                ✨ 无需注册 · 即刻体验 · 支持安卓
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>元气银行 - 家庭积分管理系统</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          让家庭激励变得简单高效
        </h2>
        
        <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
          通过游戏化的方式激励家庭成员养成良好习惯，支持积分转让、许愿和赠送功能，让孩子在快乐中成长，让家庭关系更加和谐
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <a
            href={familyBankUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-purple-50 transition-all hover:scale-110 hover:shadow-2xl group"
          >
            <span>{isLoggedIn ? '进入元气银行后台' : '立即免费体验'}</span>
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
          
          <a
            href="https://blog.familybank.chat/download/family-bank.apk"
            download
            className="inline-flex items-center gap-3 px-10 py-5 bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-full font-bold text-lg hover:bg-white/30 transition-all hover:scale-110 hover:shadow-2xl group"
          >
            <Smartphone className="w-6 h-6" />
            <span>下载安卓版</span>
          </a>
        </div>
        
        <div className="text-sm text-white/80 mb-8">
          ✨ 无需注册 · 即刻体验 · 支持安卓手机
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Gift className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">积分转让</div>
            <div className="text-xs text-white/70 mt-1">成员间互相赠送</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Heart className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">许愿功能</div>
            <div className="text-xs text-white/70 mt-1">设定目标奖励</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">家庭聊天</div>
            <div className="text-xs text-white/70 mt-1">实时沟通交流</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Smartphone className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">移动应用</div>
            <div className="text-xs text-white/70 mt-1">支持安卓手机</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-8 text-sm text-white/70 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>任务管理</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>积分兑换</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>成长记录</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>数据统计</span>
          </div>
        </div>
      </div>
    </div>
  )
}
