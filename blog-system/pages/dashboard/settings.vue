<script setup lang="ts">
import { Save } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

type SettingsTab = 'general' | 'seo' | 'comments'

const activeTab = ref<SettingsTab>('general')
const isSaving = ref(false)

// General Settings
const siteTitle = ref('元气银行')
const siteDescription = ref('分享技术与生活')
const siteUrl = ref('https://example.com')

// SEO Settings
const metaTitle = ref('元气银行')
const metaDescription = ref('分享技术与生活的博客平台')
const metaKeywords = ref('博客,技术,生活')

// Comment Settings
const commentModeration = ref(true)
const anonymousComments = ref(false)
const commentApproval = ref(true)

const handleSave = async () => {
  isSaving.value = true
  try {
    // 这里应该保存到数据库
    // const { error } = await supabase.from('settings').upsert(...)
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('设置已保存')
  } catch (err) {
    console.error('保存设置失败:', err)
  } finally {
    isSaving.value = false
  }
}

const tabs = [
  { id: 'general' as const, label: '常规设置' },
  { id: 'seo' as const, label: 'SEO 设置' },
  { id: 'comments' as const, label: '评论设置' },
]
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        系统设置
      </h1>
      <p class="text-gray-600">配置网站的各项参数</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <!-- Tabs -->
      <div class="border-b">
        <div class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-4 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="space-y-6 max-w-7xl">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              网站标题
            </label>
            <input
              v-model="siteTitle"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="输入网站标题"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              网站描述
            </label>
            <textarea
              v-model="siteDescription"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="输入网站描述"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              网站 URL
            </label>
            <input
              v-model="siteUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <!-- SEO Settings -->
        <div v-if="activeTab === 'seo'" class="space-y-6 max-w-7xl">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              默认 Meta 标题
            </label>
            <input
              v-model="metaTitle"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="输入默认 Meta 标题"
            />
            <p class="mt-1 text-sm text-gray-500">
              用于搜索引擎结果页面显示
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              默认 Meta 描述
            </label>
            <textarea
              v-model="metaDescription"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="输入默认 Meta 描述"
            />
            <p class="mt-1 text-sm text-gray-500">
              建议长度 150-160 字符
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              默认关键词
            </label>
            <input
              v-model="metaKeywords"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="关键词1, 关键词2, 关键词3"
            />
            <p class="mt-1 text-sm text-gray-500">
              用逗号分隔多个关键词
            </p>
          </div>
        </div>

        <!-- Comment Settings -->
        <div v-if="activeTab === 'comments'" class="space-y-6 max-w-7xl">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">评论审核</div>
              <div class="text-sm text-gray-500">
                新评论需要管理员审核后才能显示
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="commentModeration"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">匿名评论</div>
              <div class="text-sm text-gray-500">
                允许未登录用户发表评论
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="anonymousComments"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">自动批准</div>
              <div class="text-sm text-gray-500">
                自动批准来自已批准用户的评论
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="commentApproval"
                type="checkbox"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-8 pt-6 border-t">
          <button
            @click="handleSave"
            :disabled="isSaving"
            :class="[
              'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
              'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
              'hover:from-purple-700 hover:to-pink-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            ]"
          >
            <Save class="w-5 h-5" />
            {{ isSaving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
