<script setup lang="ts">
import { Copy, Check, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  post: {
    title: string
    content: string
    excerpt: string
    slug: string
  }
}>()

const emit = defineEmits<{
  close: []
}>()

const copied = ref<string | null>(null)

// 不同平台的内容格式
const platforms = [
  {
    name: '小红书',
    icon: '📕',
    format: () => {
      return `${props.post.title}

${props.post.excerpt}

${convertMarkdownToPlainText(props.post.content).substring(0, 800)}...

💡 完整内容查看：
🔗 https://blog.familybank.chat/blog/${props.post.slug}

#家庭教育 #积分管理 #习惯养成 #元气银行`
    }
  },
  {
    name: '知乎',
    icon: '🔵',
    format: () => {
      return `# ${props.post.title}

${props.post.content}

---

本文首发于元气银行社区：https://blog.familybank.chat/blog/${props.post.slug}`
    }
  },
  {
    name: '微信公众号',
    icon: '💚',
    format: () => {
      // 保留 Markdown 格式，公众号编辑器支持
      return `${props.post.title}

${props.post.content}

---
原文链接：https://blog.familybank.chat/blog/${props.post.slug}`
    }
  },
  {
    name: '今日头条',
    icon: '📰',
    format: () => {
      return `${props.post.title}

${convertMarkdownToPlainText(props.post.content)}

原文链接：https://blog.familybank.chat/blog/${props.post.slug}`
    }
  },
  {
    name: '简书',
    icon: '📝',
    format: () => {
      return `# ${props.post.title}

${props.post.content}

---
原文发布于元气银行社区`
    }
  }
]

// 转换 Markdown 为纯文本（简化版）
const convertMarkdownToPlainText = (markdown: string) => {
  return markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n{3,}/g, '\n\n')
}

// 复制到剪贴板
const copyToClipboard = async (platformName: string, content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    copied.value = platformName
    setTimeout(() => {
      copied.value = null
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 打开平台
const openPlatform = (platformName: string) => {
  const urls: Record<string, string> = {
    '小红书': 'https://creator.xiaohongshu.com/publish/publish',
    '知乎': 'https://zhuanlan.zhihu.com/write',
    '微信公众号': 'https://mp.weixin.qq.com',
    '今日头条': 'https://mp.toutiao.com/profile_v4/graphic/publish',
    '简书': 'https://www.jianshu.com/writer'
  }
  
  if (urls[platformName]) {
    window.open(urls[platformName], '_blank')
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="emit('close')">
      <div class="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 dark:border-white/10">
          <h2 class="text-2xl font-black text-gray-900 dark:text-white">一键分发到社交平台</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">复制内容后，点击平台图标打开发布页面</p>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div class="space-y-4">
            <div
              v-for="platform in platforms"
              :key="platform.name"
              class="border border-gray-200 dark:border-white/10 rounded-2xl p-4 hover:border-[#FF4D94]/30 transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{{ platform.icon }}</span>
                  <h3 class="text-lg font-black text-gray-900 dark:text-white">{{ platform.name }}</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="copyToClipboard(platform.name, platform.format())"
                    class="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Check v-if="copied === platform.name" class="w-4 h-4" />
                    <Copy v-else class="w-4 h-4" />
                    {{ copied === platform.name ? '已复制' : '复制内容' }}
                  </button>
                  <button
                    @click="openPlatform(platform.name)"
                    class="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <ExternalLink class="w-4 h-4" />
                    打开平台
                  </button>
                </div>
              </div>
              
              <!-- 预览 -->
              <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400 font-mono max-h-40 overflow-y-auto">
                <pre class="whitespace-pre-wrap">{{ platform.format().substring(0, 300) }}...</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
          <button
            @click="emit('close')"
            class="px-6 py-3 border border-gray-300 dark:border-white/20 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
