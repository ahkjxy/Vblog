'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/components/ui'
import { cn } from '@/lib/utils'

type SettingsTab = 'general' | 'seo' | 'comments'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [isSaving, setIsSaving] = useState(false)
  const { success, error: showError } = useToast()

  // General Settings
  const [siteTitle, setSiteTitle] = useState('元气银行博客')
  const [siteDescription, setSiteDescription] = useState('分享技术与生活')
  const [siteUrl, setSiteUrl] = useState('https://example.com')

  // SEO Settings
  const [metaTitle, setMetaTitle] = useState('元气银行博客')
  const [metaDescription, setMetaDescription] = useState('分享技术与生活的博客平台')
  const [metaKeywords, setMetaKeywords] = useState('博客,技术,生活')

  // Comment Settings
  const [commentModeration, setCommentModeration] = useState(true)
  const [anonymousComments, setAnonymousComments] = useState(false)
  const [commentApproval, setCommentApproval] = useState(true)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 这里应该保存到数据库
      // const { error } = await supabase.from('settings').upsert(...)
      
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      success('设置已保存')
    } catch (err) {
      showError('保存设置失败')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general' as const, label: '常规设置' },
    { id: 'seo' as const, label: 'SEO 设置' },
    { id: 'comments' as const, label: '评论设置' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          系统设置
        </h1>
        <p className="text-gray-600">配置网站的各项参数</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-4 text-sm font-medium transition-colors relative',
                  activeTab === tab.id
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-7xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站标题
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入网站标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站描述
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入网站描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  网站 URL
                </label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-7xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认 Meta 标题
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入默认 Meta 标题"
                />
                <p className="mt-1 text-sm text-gray-500">
                  用于搜索引擎结果页面显示
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认 Meta 描述
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="输入默认 Meta 描述"
                />
                <p className="mt-1 text-sm text-gray-500">
                  建议长度 150-160 字符
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认关键词
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="关键词1, 关键词2, 关键词3"
                />
                <p className="mt-1 text-sm text-gray-500">
                  用逗号分隔多个关键词
                </p>
              </div>
            </div>
          )}

          {/* Comment Settings */}
          {activeTab === 'comments' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">评论审核</div>
                  <div className="text-sm text-gray-500">
                    新评论需要管理员审核后才能显示
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commentModeration}
                    onChange={(e) => setCommentModeration(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">匿名评论</div>
                  <div className="text-sm text-gray-500">
                    允许未登录用户发表评论
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymousComments}
                    onChange={(e) => setAnonymousComments(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">自动批准</div>
                  <div className="text-sm text-gray-500">
                    自动批准来自已批准用户的评论
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commentApproval}
                    onChange={(e) => setCommentApproval(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
                'hover:from-purple-700 hover:to-pink-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Save className="w-5 h-5" />
              {isSaving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
