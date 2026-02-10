'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

interface TagFormData {
  name: string
  slug: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    slug: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [deleteWarning, setDeleteWarning] = useState('')

  const { success, error: showError } = useToast()

  // 加载标签列表
  const loadTags = async () => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      showError('加载标签失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTags()
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
    if (!supabase) return true
    
    try {
      let query = supabase
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
    setFormData({ name: '', slug: '' })
    setSlugError('')
    setIsCreateModalOpen(true)
  }

  // 打开编辑模态框
  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
    setSlugError('')
    setIsEditModalOpen(true)
  }

  // 打开删除对话框
  const openDeleteDialog = async (tag: Tag) => {
    if (!supabase) return
    
    setSelectedTag(tag)
    
    // 检查是否有关联的文章
    const { count } = await supabase
      .from('post_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tag.id)

    if (count && count > 0) {
      setDeleteWarning(`此标签下有 ${count} 篇文章，删除后这些文章将失去该标签。`)
    } else {
      setDeleteWarning('')
    }

    setIsDeleteDialogOpen(true)
  }

  // 创建标签
  const handleCreate = async () => {
    if (!supabase) return
    
    if (!formData.name.trim()) {
      showError('请输入标签名称')
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

      const { error } = await supabase.from('tags').insert({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
      })

      if (error) throw error

      success('标签创建成功')
      setIsCreateModalOpen(false)
      loadTags()
    } catch (err) {
      showError('创建标签失败')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新标签
  const handleUpdate = async () => {
    if (!supabase) return
    
    if (!selectedTag || !formData.name.trim() || !formData.slug.trim()) {
      showError('请填写必填字段')
      return
    }

    setIsSubmitting(true)

    try {
      // 检查 slug 唯一性
      const isUnique = await checkSlugUnique(formData.slug, selectedTag.id)
      if (!isUnique) {
        setSlugError('此 Slug 已存在')
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('tags')
        .update({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
        })
        .eq('id', selectedTag.id)

      if (error) throw error

      success('标签更新成功')
      setIsEditModalOpen(false)
      loadTags()
    } catch (err) {
      showError('更新标签失败')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除标签
  const handleDelete = async () => {
    if (!supabase) return
    
    if (!selectedTag) return

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', selectedTag.id)

      if (error) throw error

      success('标签删除成功')
      setIsDeleteDialogOpen(false)
      loadTags()
    } catch (err) {
      showError('删除标签失败')
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
          标签管理
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
          新建标签
        </button>
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="暂无标签"
          description="创建第一个标签来标记您的文章"
          action={{
            label: '新建标签',
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{tag.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tag.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(tag.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(tag)}
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

      {/* 创建标签模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新建标签"
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
                placeholder="输入标签名称"
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

      {/* 编辑标签模态框 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑标签"
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
                placeholder="输入标签名称"
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
        title="删除标签"
        message={
          deleteWarning
            ? deleteWarning + ' 确定要删除吗？'
            : `确定要删除标签"${selectedTag?.name}"吗？此操作无法撤销。`
        }
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
