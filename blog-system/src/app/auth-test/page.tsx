'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cookies, setCookies] = useState<string>('')
  const [authToken, setAuthToken] = useState<string>('')

  useEffect(() => {
    checkAuth()
    checkCookies()
  }, [])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  function checkCookies() {
    if (typeof document !== 'undefined') {
      setCookies(document.cookie)
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-auth-token='))
        ?.split('=')[1]
      setAuthToken(token || '未找到')
    }
  }

  async function handleRefresh() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.refreshSession()
    await checkAuth()
    checkCookies()
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    await checkAuth()
    checkCookies()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查登录状态...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">🔐 登录状态测试</h1>
            
            {/* 登录状态 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">当前登录状态</h2>
              <div className={`p-4 rounded-lg ${user ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {user ? (
                  <div>
                    <p className="text-green-800 font-semibold mb-2">✅ 已登录</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>用户 ID:</strong> {user.id}</p>
                      <p><strong>邮箱:</strong> {user.email}</p>
                      <p><strong>创建时间:</strong> {new Date(user.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-800 font-semibold">❌ 未登录</p>
                )}
              </div>
            </div>

            {/* Cookie 信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cookie 信息</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-2"><strong>认证 Token:</strong></p>
                <p className="text-xs text-gray-600 break-all font-mono bg-white p-2 rounded border">
                  {authToken}
                </p>
                <p className="text-sm text-gray-700 mt-4 mb-2"><strong>所有 Cookies:</strong></p>
                <p className="text-xs text-gray-600 break-all font-mono bg-white p-2 rounded border">
                  {cookies || '无 Cookie'}
                </p>
              </div>
            </div>

            {/* 环境信息 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">环境信息</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>当前域名:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
                  <p><strong>是否生产环境:</strong> {typeof window !== 'undefined' && window.location.hostname.includes('familybank.chat') ? '是' : '否'}</p>
                  <p><strong>Cookie Domain:</strong> {typeof window !== 'undefined' && window.location.hostname.includes('familybank.chat') ? '.familybank.chat' : 'localhost'}</p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 刷新状态
              </button>
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  🚪 登出
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-block"
                >
                  🔑 去登录
                </Link>
              )}
              
              <a
                href="https://www.familybank.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🏠 打开家庭积分系统
              </a>
              
              <Link
                href="/"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                ← 返回首页
              </Link>
            </div>

            {/* 测试说明 */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">📝 测试步骤：</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>在 Blog 系统（blog.familybank.chat）登录</li>
                <li>点击"打开家庭积分系统"按钮</li>
                <li>检查家庭积分系统是否自动登录</li>
                <li>在家庭积分系统登出</li>
                <li>返回 Blog 系统，点击"刷新状态"</li>
                <li>验证 Blog 系统是否也已登出</li>
              </ol>
              <p className="text-xs text-gray-600 mt-4">
                <strong>注意：</strong>本地开发环境（localhost）无法测试跨域 Cookie，请在生产环境测试。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
