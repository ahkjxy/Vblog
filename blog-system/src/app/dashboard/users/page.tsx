'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users as UsersIcon, Search, Shield, Edit2, Trash2 } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'author'
  avatar_url: string | null
  bio: string | null
  created_at: string
}

type RoleFilter = 'all' | 'admin' | 'editor' | 'author'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'author'>('author')
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  const supabase = createClient()
  const { success, error: showError } = useToast()

  // 加载用户列表
  const loadUsers = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // 获取当前用户角色
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (currentProfile) {
        setCurrentUserRole(currentProfile.role)
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      showError('加载用户列表失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 搜索和过滤
  useEffect(() => {
    let result = users

    // 搜索
    if (searchQuery) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 角色过滤
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(result)
  }, [users, searchQuery, roleFilter])

  // 打开角色更改对话框
  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsRoleDialogOpen(true)
  }

  // 更新用户角色
  const handleRoleUpdate = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id)

      if (error) throw error

      success('用户角色已更新')
      setIsRoleDialogOpen(false)
      loadUsers()
    } catch (err) {
      showError('更新角色失败')
      console.error(err)
    }
  }

  // 删除用户
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      // 注意：实际删除用户需要使用 Supabase Admin API
      // 这里只删除 profile，auth.users 需要在服务端处理
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id)

      if (error) throw error

      success('用户已删除')
      setIsDeleteDialogOpen(false)
      loadUsers()
    } catch (err) {
      showError('删除用户失败')
      console.error(err)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // 获取角色徽章样式
  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      author: 'bg-green-100 text-green-800',
    }
    const labels = {
      admin: '管理员',
      editor: '编辑',
      author: '作者',
    }
    return { style: styles[role as keyof typeof styles], label: labels[role as keyof typeof labels] }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 只有管理员可以访问
  if (currentUserRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <EmptyState
          icon={Shield}
          title="权限不足"
          description="只有管理员可以访问用户管理页面"
        />
      </div>
    )
  }

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    editor: users.filter(u => u.role === 'editor').length,
    author: users.filter(u => u.role === 'author').length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          用户管理
        </h1>
        <p className="text-gray-600">管理系统用户和权限</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">总用户数</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.admin}</div>
              <div className="text-sm text-gray-600">管理员</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Edit2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.editor}</div>
              <div className="text-sm text-gray-600">编辑</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.author}</div>
              <div className="text-sm text-gray-600">作者</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">全部角色</option>
          <option value="admin">管理员</option>
          <option value="editor">编辑</option>
          <option value="author">作者</option>
        </select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="未找到用户"
          description={searchQuery || roleFilter !== 'all' ? '尝试调整搜索条件' : '系统中还没有用户'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">邮箱</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">注册时间</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => {
                const badge = getRoleBadge(user.role)
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.bio && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {user.bio}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', badge.style)}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openRoleDialog(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="更改角色"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除用户"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <Modal
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          title="更改用户角色"
          size="sm"
        >
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                为用户 <strong>{selectedUser.name}</strong> 选择新角色：
              </p>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor' | 'author')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="author">作者</option>
                <option value="editor">编辑</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setIsRoleDialogOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleRoleUpdate}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              确认更改
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="删除用户"
        message={`确定要删除用户"${selectedUser?.name}"吗？此操作将删除该用户的所有数据，且无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
