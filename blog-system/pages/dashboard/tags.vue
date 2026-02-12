<script setup lang="ts">
import { Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const client = useSupabaseClient()

const tags = ref<any[]>([])
const loading = ref(true)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedTag = ref<any>(null)
const formData = ref({
  name: '',
  slug: ''
})
const isSubmitting = ref(false)
const slugError = ref('')
const deleteWarning = ref('')

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 加载标签列表
const loadTags = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('tags')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    tags.value = data || []
  } catch (err) {
    console.error(err)
    alert('加载标签失败')
  } finally {
    loading.value = false
  }
}

// 生成 slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 检查 slug 是否重复
const checkSlugUnique = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    let query = client
      .from('tags')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !data
  } catch (err) {
    console.error(err)
    return false
  }
}

// 处理名称变化
const handleNameChange = (name: string) => {
  formData.value.name = name
  formData.value.slug = generateSlug(name)
  slugError.value = ''
}

// 打开创建模态框
const openCreateModal = () => {
  formData.value = { name: '', slug: '' }
  slugError.value = ''
  isCreateModalOpen.value = true
}

// 打开编辑模态框
const openEditModal = (tag: any) => {
  selectedTag.value = tag
  formData.value = {
    name: tag.name,
    slug: tag.slug
  }
  slugError.value = ''
  isEditModalOpen.value = true
}

// 打开删除对话框
const openDeleteDialog = async (tag: any) => {
  selectedTag.value = tag
  
  // 检查是否有关联的文章
  const { count } = await client
    .from('post_tags')
    .select('*', { count: 'exact', head: true })
    .eq('tag_id', tag.id)

  if (count && count > 0) {
    deleteWarning.value = `此标签下有 ${count} 篇文章，删除后这些文章将失去该标签。`
  } else {
    deleteWarning.value = ''
  }

  isDeleteDialogOpen.value = true
}

// 创建标签
const handleCreate = async () => {
  if (!formData.value.name.trim()) {
    alert('请输入标签名称')
    return
  }

  if (!formData.value.slug.trim()) {
    alert('请输入 Slug')
    return
  }

  isSubmitting.value = true

  try {
    // 检查 slug 唯一性
    const isUnique = await checkSlugUnique(formData.value.slug)
    if (!isUnique) {
      slugError.value = '此 Slug 已存在'
      isSubmitting.value = false
      return
    }

    const { error } = await client.from('tags').insert({
      name: formData.value.name.trim(),
      slug: formData.value.slug.trim()
    })

    if (error) throw error

    alert('标签创建成功')
    isCreateModalOpen.value = false
    loadTags()
  } catch (err) {
    console.error(err)
    alert('创建标签失败')
  } finally {
    isSubmitting.value = false
  }
}

// 更新标签
const handleUpdate = async () => {
  if (!selectedTag.value || !formData.value.name.trim() || !formData.value.slug.trim()) {
    alert('请填写必填字段')
    return
  }

  isSubmitting.value = true

  try {
    // 检查 slug 唯一性
    const isUnique = await checkSlugUnique(formData.value.slug, selectedTag.value.id)
    if (!isUnique) {
      slugError.value = '此 Slug 已存在'
      isSubmitting.value = false
      return
    }

    const { error } = await client
      .from('tags')
      .update({
        name: formData.value.name.trim(),
        slug: formData.value.slug.trim()
      })
      .eq('id', selectedTag.value.id)

    if (error) throw error

    alert('标签更新成功')
    isEditModalOpen.value = false
    loadTags()
  } catch (err) {
    console.error(err)
    alert('更新标签失败')
  } finally {
    isSubmitting.value = false
  }
}

// 删除标签
const handleDelete = async () => {
  if (!selectedTag.value) return

  try {
    const { error } = await client
      .from('tags')
      .delete()
      .eq('id', selectedTag.value.id)

    if (error) throw error

    alert('标签删除成功')
    isDeleteDialogOpen.value = false
    loadTags()
  } catch (err) {
    console.error(err)
    alert('删除标签失败')
  }
}

onMounted(() => {
  loadTags()
})

useSeoMeta({
  title: '标签管理 - Dashboard'
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-black bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] bg-clip-text text-transparent">
        标签管理
      </h1>
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <Plus class="w-5 h-5" />
        新建标签
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="w-16 h-16 border-4 border-[#FF4D94] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="tags.length === 0" class="bg-white rounded-3xl border border-gray-100 p-12 text-center">
      <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF4D94]/10 to-[#7C4DFF]/10 flex items-center justify-center mx-auto mb-6">
        <TagIcon class="w-10 h-10 text-[#FF4D94]" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 mb-2">暂无标签</h3>
      <p class="text-sm text-gray-600 mb-6 font-medium">创建第一个标签来标记您的文章</p>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-2xl font-black hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <Plus class="w-5 h-5" />
        新建标签
      </button>
    </div>

    <!-- Table -->
    <!-- 桌面端表格 -->
    <div v-else class="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-[#FF4D94]/5 to-[#7C4DFF]/5 border-b border-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-black text-gray-600 uppercase tracking-wider">名称</th>
            <th class="px-6 py-3 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-black text-gray-600 uppercase tracking-wider">创建时间</th>
            <th class="px-6 py-3 text-right text-xs font-black text-gray-600 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="tag in tags" :key="tag.id" class="hover:bg-gradient-to-r hover:from-[#FF4D94]/5 hover:to-[#7C4DFF]/5 transition-all">
            <td class="px-6 py-4 font-black text-gray-900">{{ tag.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{ tag.slug }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 font-medium">{{ formatDate(tag.created_at) }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEditModal(tag)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  @click="openDeleteDialog(tag)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 移动端卡片列表 -->
    <div v-if="!loading && tags.length > 0" class="md:hidden space-y-3">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      >
        <div class="mb-3">
          <h3 class="font-black text-base text-gray-900 mb-1">{{ tag.name }}</h3>
          <p class="text-xs text-gray-500 font-mono">{{ tag.slug }}</p>
        </div>
        <p class="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
          创建于 {{ formatDate(tag.created_at) }}
        </p>
        <div class="flex gap-2">
          <button
            @click="openEditModal(tag)"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm transition-all hover:bg-blue-100"
          >
            <Edit2 class="w-4 h-4" />
            编辑
          </button>
          <button
            @click="openDeleteDialog(tag)"
            class="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm transition-all hover:bg-red-100"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="isCreateModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-2xl font-black text-gray-900">新建标签</h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-black text-gray-700 mb-2">
              名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              @input="handleNameChange(formData.name)"
              type="text"
              placeholder="输入标签名称"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94] transition-all font-medium"
            />
          </div>
          <div>
            <label class="block text-sm font-black text-gray-700 mb-2">
              Slug <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.slug"
              type="text"
              placeholder="url-friendly-slug"
              :class="[
                'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-mono text-sm',
                slugError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94]'
              ]"
            />
            <p v-if="slugError" class="mt-1 text-sm text-red-600 font-medium">{{ slugError }}</p>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            @click="isCreateModalOpen = false"
            :disabled="isSubmitting"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-bold"
          >
            取消
          </button>
          <button
            @click="handleCreate"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold"
          >
            {{ isSubmitting ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-2xl font-black text-gray-900">编辑标签</h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-black text-gray-700 mb-2">
              名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              @input="handleNameChange(formData.name)"
              type="text"
              placeholder="输入标签名称"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94] transition-all font-medium"
            />
          </div>
          <div>
            <label class="block text-sm font-black text-gray-700 mb-2">
              Slug <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.slug"
              type="text"
              placeholder="url-friendly-slug"
              :class="[
                'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-mono text-sm',
                slugError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-[#FF4D94]/20 focus:border-[#FF4D94]'
              ]"
            />
            <p v-if="slugError" class="mt-1 text-sm text-red-600 font-medium">{{ slugError }}</p>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            @click="isEditModalOpen = false"
            :disabled="isSubmitting"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-bold"
          >
            取消
          </button>
          <button
            @click="handleUpdate"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-gradient-to-r from-[#FF4D94] to-[#7C4DFF] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold"
          >
            {{ isSubmitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Dialog -->
    <div v-if="isDeleteDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-2xl font-black text-gray-900">删除标签</h2>
        </div>
        <div class="p-6">
          <p class="text-gray-700 font-medium">
            {{ deleteWarning || `确定要删除标签"${selectedTag?.name}"吗？此操作无法撤销。` }}
          </p>
        </div>
        <div class="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            @click="isDeleteDialogOpen = false"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold"
          >
            取消
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
