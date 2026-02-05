'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [deleteWarning, setDeleteWarning] = useState('')

  const supabase = createClient()
  const { success, error: showError } = useToast()

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      showError('加载分类失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

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
      let query = supabase
        .from('categories')
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
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
    setSlugError('')
  }

  // 处理 slug 变化
  const handleSlugChange = (slug: string) => {
    setFormData((prev) => ({ ...prev, slug }))
    setSlugError('')
  }

  // 打开创建模态框
  const openCreateModal = () => {
    setFormData({ name: '', slug: '', description: '' })
    setSlugError('')
    setIsCreateModalOpen(true)
  }

  // 打开编辑模态框
  const openEditModal = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
    setSlugError('')
    setIsEditModalOpen(true)
  }

  // 打开删除对话框
  const openDeleteDialog = async (category: Category) => {
    setSelectedCategory(category)
    
    // 检查是否有关联的文章
    const { count } = await supabase
      .from('post_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)

    if (count && count > 0) {
      setDeleteWarning(`此分类下有 ${count} 篇文章，删除后这些文章将失去该分类。`)
    } else {
      setDeleteWarning('')
    }

    setIsDeleteDialogOpen(true)
  }

  // 创建分类
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showError('请输入分类名称')
      return
    }

    if (!formData.slug.trim()) {
      showError('请输入 Slug')
      return
    }

    setIsSubmitting(true)

    try {
      // 检查 slug 唯一性
      const isUnique = await checkSlugUnique(formData.slug)
      if (!isUnique) {
        setSlugError('此 Slug 已存在')
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase.from('categories').insert({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      })

      if (error) throw error

      success('分类创建成功')
      setIsCreateModalOpen(false)
      loadCategories()
    } catch (err) {
      showError('创建分类失败')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新分类
  const handleUpdate = async () => {
    if (!selectedCategory || !formData.name.trim() || !formData.slug.trim()) {
      showError('请填写必填字段')
      return
    }

    setIsSubmitting(true)

    try {
      // 检查 slug 唯一性
      const isUnique = await checkSlugUnique(formData.slug, selectedCategory.id)
      if (!isUnique) {
        setSlugError('此 Slug 已存在')
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
        })
        .eq('id', selectedCategory.id)

      if (error) throw error

      success('分类更新成功')
      setIsEditModalOpen(false)
      loadCategories()
    } catch (err) {
      showError('更新分类失败')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除分类
  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id)

      if (error) throw error

      success('分类删除成功')
      setIsDeleteDialogOpen(false)
      loadCategories()
    } catch (err) {
      showError('删除分类失败')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          分类管理
        </h1>
        <button
          onClick={openCreateModal}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
            'hover:from-purple-700 hover:to-pink-700',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
          )}
        >
          <Plus className="w-5 h-5" />
          新建分类
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="暂无分类"
          description="创建第一个分类来组织您的文章"
          action={{
            label: '新建分类',
            onClick: openCreateModal,
          }}
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 创建分类模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新建分类"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="输入分类名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  slugError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                )}
                placeholder="url-friendly-slug"
              />
              {slugError && (
                <p className="mt-1 text-sm text-red-600">{slugError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="输入分类描述（可选）"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '创建中...' : '创建'}
          </button>
        </ModalFooter>
      </Modal>

      {/* 编辑分类模态框 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑分类"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="输入分类名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  slugError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                )}
                placeholder="url-friendly-slug"
              />
              {slugError && (
                <p className="mt-1 text-sm text-red-600">{slugError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="输入分类描述（可选）"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            onClick={() => setIsEditModalOpen(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </ModalFooter>
      </Modal>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="删除分类"
        message={
          deleteWarning
            ? deleteWarning + ' 确定要删除吗？'
            : `确定要删除分类"${selectedCategory?.name}"吗？此操作无法撤销。`
        }
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
