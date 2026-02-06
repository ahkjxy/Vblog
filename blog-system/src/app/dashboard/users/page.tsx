'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users as UsersIcon, Search, Shield, Trash2, Mail } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string  // 添加邮箱字段
  role: 'admin' | 'child'
  avatar_url: string | null
  avatar_color: string | null
  bio: string | null
  family_id: string | null
  created_at: string
  family?: {
    id: string
    name: string
  }
  is_super_admin?: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [newRole, setNewRole] = useState<'admin' | 'child'>('admin')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const supabase = createClient()
  const { success, error: showError } = useToast()

  // 加载用户列表
  const loadUsers = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // 获取当前用户的 profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (!currentProfile) {
        setLoading(false)
        return
      }

      setCurrentUserId(currentUser.id)
      
      // 检查是否是超级管理员
      const isAdmin = currentProfile.role === 'admin' && 
        currentProfile.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
      setIsSuperAdmin(isAdmin)
      
      // 如果不是超级管理员，拒绝访问
      if (!isAdmin) {
        setLoading(false)
        return
      }

      // 获取所有用户（包括 admin 和 child）
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          families:family_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // 从 API 获取邮箱映射
      let emailMap: Record<string, string> = {}
      try {
        const emailResponse = await fetch('/api/users/emails')
        if (emailResponse.ok) {
          const result = await emailResponse.json()
          emailMap = result.emailMap || {}
        } else {
          console.error('Failed to fetch emails:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Error fetching emails:', emailError)
      }
      
      // 合并数据
      const usersWithEmail = (data || []).map((user: any) => {
        const isSuperAdminUser = user.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
        
        return {
          ...user,
          email: emailMap[user.id] || '',
          family: user.families,
          is_super_admin: isSuperAdminUser
        }
      })
      
      setUsers(usersWithEmail)
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

    // 搜索：名字、邮箱、家庭名称
    if (searchQuery) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.family?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(result)
  }, [users, searchQuery])

  // 按家庭分组用户
  const groupedByFamily = filteredUsers.reduce((acc, user) => {
    const familyId = user.family_id || 'no-family'
    const familyName = user.family?.name || '未分配家庭'
    
    if (!acc[familyId]) {
      acc[familyId] = {
        familyId,
        familyName,
        isSuperAdmin: user.is_super_admin || false,
        users: []
      }
    }
    
    acc[familyId].users.push(user)
    return acc
  }, {} as Record<string, { familyId: string; familyName: string; isSuperAdmin: boolean; users: User[] }>)

  // 转换为数组并排序：超管家庭在前
  const familyGroups = Object.values(groupedByFamily).sort((a, b) => {
    if (a.isSuperAdmin) return -1
    if (b.isSuperAdmin) return 1
    return a.familyName.localeCompare(b.familyName, 'zh-CN')
  })

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

    // 不能删除自己
    if (selectedUser.id === currentUserId) {
      showError('不能删除自己')
      setIsDeleteDialogOpen(false)
      return
    }

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

  // 切换用户选择
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set())
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)))
    }
  }

  // 批量删除用户
  const handleBatchDelete = async () => {
    if (selectedUserIds.size === 0) return

    // 检查是否包含当前用户
    if (selectedUserIds.has(currentUserId)) {
      showError('不能删除自己')
      return
    }

    try {
      const idsToDelete = Array.from(selectedUserIds)
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('id', idsToDelete)

      if (error) throw error

      success(`已删除 ${idsToDelete.length} 个用户`)
      setIsBatchDeleteDialogOpen(false)
      setSelectedUserIds(new Set())
      loadUsers()
    } catch (err) {
      showError('批量删除失败')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 只有超级管理员可以访问
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <EmptyState
          icon={Shield}
          title="权限不足"
          description="只有超级管理员可以访问用户管理页面"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          用户管理
        </h1>
        <p className="text-gray-600">管理所有博客用户和家庭</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-gray-600">注册用户总数</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">当前显示用户</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Batch Actions */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索用户名、邮箱、家庭名称..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        {/* Batch Actions */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                {selectedUserIds.size > 0 ? `已选 ${selectedUserIds.size} 个用户` : '全选'}
              </span>
            </div>
            
            {selectedUserIds.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUserIds(new Set())}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消选择
                </button>
                <button
                  onClick={() => setIsBatchDeleteDialogOpen(true)}
                  disabled={selectedUserIds.has(currentUserId)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg transition-colors",
                    selectedUserIds.has(currentUserId)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  )}
                >
                  <Trash2 className="w-4 h-4 inline-block mr-1" />
                  批量删除 ({selectedUserIds.size})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Users Table - Grouped by Family */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="未找到用户"
          description={searchQuery ? '尝试调整搜索条件' : '系统中还没有用户'}
        />
      ) : (
        <div className="space-y-6">
          {familyGroups.map((group) => (
            <div key={group.familyId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Family Header */}
              <div className={cn(
                "px-6 py-4 border-b flex items-center justify-between",
                group.isSuperAdmin 
                  ? "bg-gradient-to-r from-purple-50 to-pink-50" 
                  : "bg-gray-50"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                    group.isSuperAdmin
                      ? "bg-gradient-to-br from-purple-600 to-pink-600"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  )}>
                    {group.familyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{group.familyName}</h3>
                    <p className="text-sm text-gray-500">{group.users.length} 位成员</p>
                  </div>
                  {group.isSuperAdmin && (
                    <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                      ⭐ 超级管理员家庭
                    </span>
                  )}
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 w-12">
                        <input
                          type="checkbox"
                          checked={
                            group.users.length > 0 &&
                            group.users.every(u => selectedUserIds.has(u.id))
                          }
                          onChange={() => {
                            const allSelected = group.users.every(u => selectedUserIds.has(u.id))
                            setSelectedUserIds(prev => {
                              const newSet = new Set(prev)
                              group.users.forEach(u => {
                                if (allSelected) {
                                  newSet.delete(u.id)
                                } else {
                                  newSet.add(u.id)
                                }
                              })
                              return newSet
                            })
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">邮箱</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">注册时间</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                              />
                            ) : user.avatar_color ? (
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-gray-100"
                                style={{ backgroundColor: user.avatar_color }}
                              >
                                {user.name.slice(-1)}
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              {user.bio && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {user.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.role === 'child' ? (
                              <span className="text-gray-400 italic">无邮箱</span>
                            ) : user.email ? (
                              <span className="text-gray-600">{user.email}</span>
                            ) : (
                              <span className="text-gray-400 text-xs font-mono">
                                ID: {user.id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.is_super_admin ? (
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                              ⭐ 超级管理员
                            </span>
                          ) : user.role === 'admin' ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              家长
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              孩子
                            </span>
                          )}
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
                              disabled={user.id === currentUserId}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                user.id === currentUserId
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-red-600 hover:bg-red-50"
                              )}
                              title={user.id === currentUserId ? "不能删除自己" : "删除用户"}
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
            </div>
          ))}
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
                为用户 <strong>{selectedUser.name}</strong> 选择角色：
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">提示：</p>
                <p>当前系统只支持 admin（家长）角色。</p>
              </div>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'child')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="admin">家长 (Admin)</option>
                <option value="child">孩子 (Child)</option>
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
        message={
          selectedUser?.id === currentUserId
            ? `不能删除自己`
            : `确定要删除用户"${selectedUser?.name}"吗？此操作将删除该用户的所有数据，且无法撤销。`
        }
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />

      {/* Batch Delete Confirmation */}
      <ConfirmDialog
        isOpen={isBatchDeleteDialogOpen}
        onClose={() => setIsBatchDeleteDialogOpen(false)}
        onConfirm={handleBatchDelete}
        title="批量删除用户"
        message={`确定要删除选中的 ${selectedUserIds.size} 个用户吗？此操作将删除这些用户的所有数据，且无法撤销。`}
        confirmText="批量删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
