'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users as UsersIcon, Search, Shield, Edit2, Trash2 } from 'lucide-react'
import { Modal, ModalBody, ModalFooter, ConfirmDialog, useToast, LoadingSpinner, EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  role: 'admin' | 'editor' | 'author' | 'child'  // 博客角色或家庭角色
  avatar_url: string | null
  avatar_color: string | null
  bio: string | null
  family_id: string | null
  created_at: string
  family?: {
    id: string
    name: string
  }
  family_role?: 'admin' | 'child'  // 家庭中的角色
  blog_role?: 'admin' | 'editor' | 'author'  // 博客系统的角色
  is_super_admin_family?: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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

      // 获取当前用户角色和家庭ID
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role, family_id')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (currentProfile) {
        setCurrentUserRole(currentProfile.role)
      }

      // 获取所有用户及其家庭信息
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
      
      // 标记超级管理员家庭的用户，并区分家庭角色和博客角色
      const usersWithFamily = (data || []).map(user => {
        const isSuperAdminFamily = user.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
        
        // 判断家庭角色：
        // - role='child' 表示孩子
        // - role='admin' 且在超管家庭 = 家长（超级管理员）
        // - role='admin' 且不在超管家庭 = 可能是博客管理员或家长
        let family_role: 'admin' | 'child' | undefined
        let blog_role: 'admin' | 'editor' | 'author' | undefined
        
        if (user.role === 'child') {
          // 明确是孩子
          family_role = 'child'
        } else if (user.role === 'admin') {
          if (isSuperAdminFamily) {
            // 超管家庭的 admin = 家长（超级管理员）
            family_role = 'admin'
            blog_role = 'admin'
          } else {
            // 其他家庭的 admin 可能是家长，也标记为家庭角色
            family_role = 'admin'
          }
        } else if (['editor', 'author'].includes(user.role)) {
          // 编辑、作者是博客角色
          blog_role = user.role as 'editor' | 'author'
        }
        
        return {
          ...user,
          family: user.families,
          family_role,
          blog_role,
          is_super_admin_family: isSuperAdminFamily
        }
      })
      
      setUsers(usersWithFamily)
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
    // 显示所有有 family_id 的用户，但排除超级管理员家庭的家长
    let result = users.filter(u => {
      // 必须有家庭
      if (!u.family_id) return false
      
      // 排除超级管理员（超管家庭的 admin）
      if (u.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171' && u.role === 'admin') {
        return false
      }
      
      return true
    })

    // 搜索
    if (searchQuery) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.family?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredUsers(result)
  }, [users, searchQuery])

  // 按家庭分组用户 - 只显示孩子（role='child'）
  const groupedByFamily = filteredUsers.reduce((acc, user) => {
      const familyId = user.family_id || 'no-family'
      const familyName = user.family?.name || '未分配家庭'
      
      if (!acc[familyId]) {
        acc[familyId] = {
          familyId,
          familyName,
          isSuperAdmin: user.is_super_admin_family || false,
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
    // 只能更改博客角色，如果用户有博客角色就使用它，否则默认为 author
    setNewRole(user.blog_role || 'author')
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

    // 检查是否是超级管理员家庭的用户
    if (selectedUser.is_super_admin_family) {
      showError('无法删除超级管理员家庭的用户')
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

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // 获取角色徽章样式
  const getRoleBadge = (role: string, type: 'blog' | 'family' = 'blog', isSuperAdmin = false) => {
    if (type === 'family') {
      const styles = {
        admin: 'bg-purple-100 text-purple-800',
        child: 'bg-orange-100 text-orange-800',
      }
      const labels = {
        admin: isSuperAdmin ? '超级管理员' : '家长',
        child: '孩子',
      }
      return { style: styles[role as keyof typeof styles], label: labels[role as keyof typeof labels] }
    }
    
    const styles = {
      admin: isSuperAdmin ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' : 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      author: 'bg-green-100 text-green-800',
    }
    const labels = {
      admin: isSuperAdmin ? '超级管理员' : '管理员',
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
    total: users.filter(u => {
      if (!u.family_id) return false
      if (u.family_id === '79ed05a1-e0e5-4d8c-9a79-d8756c488171' && u.role === 'admin') return false
      return true
    }).length,
    families: Object.keys(groupedByFamily).length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          家庭成员管理
        </h1>
        <p className="text-gray-600">查看和管理所有家庭成员</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">家庭成员总数</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.families}</div>
              <div className="text-sm text-gray-600">家庭数量</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索用户名、家庭名称..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Users Table - Grouped by Family */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="未找到家庭成员"
          description={searchQuery ? '尝试调整搜索条件' : '系统中还没有家庭成员'}
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
                <div className="text-xs font-mono text-gray-400">
                  {group.familyId !== 'no-family' && group.familyId}
                </div>
              </div>

              {/* Users Table */}
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">用户ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">家庭</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">家庭ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">注册时间</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {group.users.map((user) => {
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
                            <div className="font-medium">{user.name}</div>
                            {user.bio && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {user.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-500 max-w-[150px] truncate" title={user.id}>
                          {user.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.family ? (
                          <span className="text-sm text-gray-700">{user.family.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.family_id ? (
                          <div className="text-xs font-mono text-gray-500 max-w-[150px] truncate" title={user.family_id}>
                            {user.family_id}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {/* 家庭角色 */}
                          {user.family_role && (
                            <div>
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRoleBadge(user.family_role, 'family', user.is_super_admin_family && user.family_role === 'admin').style)}>
                                {getRoleBadge(user.family_role, 'family', user.is_super_admin_family && user.family_role === 'admin').label}
                              </span>
                            </div>
                          )}
                          
                          {/* 博客角色 */}
                          {user.blog_role && (
                            <div>
                              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getRoleBadge(user.blog_role, 'blog', user.is_super_admin_family && user.blog_role === 'admin').style)}>
                                {getRoleBadge(user.blog_role, 'blog', user.is_super_admin_family && user.blog_role === 'admin').label}
                              </span>
                            </div>
                          )}
                          
                          {/* 如果既没有家庭角色也没有博客角色 */}
                          {!user.family_role && !user.blog_role && (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
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
                            disabled={user.is_super_admin_family}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              user.is_super_admin_family
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50"
                            )}
                            title={user.is_super_admin_family ? "超级管理员家庭的用户不能删除" : "删除用户"}
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
                为用户 <strong>{selectedUser.name}</strong> 选择新的博客角色：
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">提示：</p>
                <p>这里只能更改博客系统的角色（管理员/编辑/作者）。</p>
                <p>家庭角色（家长/孩子）由家庭积分系统管理。</p>
              </div>
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
        message={
          selectedUser?.is_super_admin_family
            ? `无法删除用户"${selectedUser?.name}"，因为该用户属于超级管理员家庭。`
            : `确定要删除用户"${selectedUser?.name}"吗？此操作将删除该用户的所有数据，且无法撤销。`
        }
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
