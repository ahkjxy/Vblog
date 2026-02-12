<script setup lang="ts">
import { Users as UsersIcon, Search, Shield, Trash2, Mail, Copy, Check } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

// 复制状态
const copiedFamilyId = ref<string | null>(null)

// 分页状态
const currentPage = ref(1)
const itemsPerPage = 3

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'child'
  avatar_url: string | null
  avatar_color: string | null
  bio: string | null
  family_id: string | null
  created_at: string
  families?: {
    id: string
    name: string
  }
  is_super_admin?: boolean
}

const users = ref<User[]>([])
const filteredUsers = ref<User[]>([])
const loading = ref(true)
const searchQuery = ref('')
const isRoleDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isBatchDeleteDialogOpen = ref(false)
const selectedUser = ref<User | null>(null)
const selectedUserIds = ref<Set<string>>(new Set())
const newRole = ref<'admin' | 'child'>('admin')
const isSuperAdmin = ref(false)

// 检查权限
const { data: profile } = await useAsyncData('user-profile', async () => {
  if (!user.value) return null
  const { data } = await client
    .from('profiles')
    .select('role, family_id')
    .eq('id', user.value.id)
    .single()
  return data
})

const SUPER_ADMIN_FAMILY_ID = '79ed05a1-e0e5-4d8c-9a79-d8756c488171'
isSuperAdmin.value = profile.value?.role === 'admin' && profile.value?.family_id === SUPER_ADMIN_FAMILY_ID

// 加载用户列表
const loadUsers = async () => {
  try {
    if (!isSuperAdmin.value) {
      loading.value = false
      return
    }

    const { data, error } = await client
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
    
    // 获取邮箱映射
    let emailMap: Record<string, string> = {}
    try {
      const emailResponse = await fetch('/api/users/emails')
      if (emailResponse.ok) {
        const result = await emailResponse.json()
        emailMap = result.emailMap || {}
      }
    } catch (emailError) {
      console.error('Error fetching emails:', emailError)
    }
    
    // 合并数据
    const usersWithEmail = (data || []).map((u: any) => {
      const isSuperAdminUser = u.family_id === SUPER_ADMIN_FAMILY_ID
      
      return {
        ...u,
        email: emailMap[u.id] || '',
        is_super_admin: isSuperAdminUser
      }
    })
    
    users.value = usersWithEmail
  } catch (err) {
    console.error('加载用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 搜索和过滤
watch([users, searchQuery], () => {
  let result = users.value

  if (searchQuery.value) {
    result = result.filter(u =>
      u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.families?.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  filteredUsers.value = result
})

// 按家庭分组
const groupedByFamily = computed(() => {
  const groups = filteredUsers.value.reduce((acc, u) => {
    const familyId = u.family_id || 'no-family'
    const familyName = u.families?.name || '未分配家庭'
    
    if (!acc[familyId]) {
      acc[familyId] = {
        familyId,
        familyName,
        isSuperAdmin: u.is_super_admin || false,
        users: []
      }
    }
    
    acc[familyId].users.push(u)
    return acc
  }, {} as Record<string, { familyId: string; familyName: string; isSuperAdmin: boolean; users: User[] }>)

  return Object.values(groups).sort((a, b) => {
    if (a.isSuperAdmin) return -1
    if (b.isSuperAdmin) return 1
    return a.familyName.localeCompare(b.familyName, 'zh-CN')
  })
})

// 分页后的家庭组
const paginatedGroups = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return groupedByFamily.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(groupedByFamily.value.length / itemsPerPage)
})

// 切换页码
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 搜索时重置页码
watch(searchQuery, () => {
  currentPage.value = 1
})

// 打开角色更改对话框
const openRoleDialog = (u: User) => {
  selectedUser.value = u
  newRole.value = u.role
  isRoleDialogOpen.value = true
}

// 更新用户角色
const handleRoleUpdate = async () => {
  if (!selectedUser.value) return

  try {
    const { error } = await client
      .from('profiles')
      .update({ role: newRole.value })
      .eq('id', selectedUser.value.id)

    if (error) throw error
    isRoleDialogOpen.value = false
    await loadUsers()
  } catch (err) {
    console.error('更新角色失败:', err)
  }
}

// 删除用户
const handleDeleteUser = async () => {
  if (!selectedUser.value) return

  if (selectedUser.value.id === user.value?.id) {
    isDeleteDialogOpen.value = false
    return
  }

  try {
    const { error } = await client
      .from('profiles')
      .delete()
      .eq('id', selectedUser.value.id)

    if (error) throw error
    isDeleteDialogOpen.value = false
    await loadUsers()
  } catch (err) {
    console.error('删除用户失败:', err)
  }
}

// 切换用户选择
const toggleUserSelection = (userId: string) => {
  const newSet = new Set(selectedUserIds.value)
  if (newSet.has(userId)) {
    newSet.delete(userId)
  } else {
    newSet.add(userId)
  }
  selectedUserIds.value = newSet
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedUserIds.value.size === filteredUsers.value.length) {
    selectedUserIds.value = new Set()
  } else {
    selectedUserIds.value = new Set(filteredUsers.value.map(u => u.id))
  }
}

// 批量删除用户
const handleBatchDelete = async () => {
  if (selectedUserIds.value.size === 0) return

  if (selectedUserIds.value.has(user.value?.id || '')) {
    return
  }

  try {
    const idsToDelete = Array.from(selectedUserIds.value)
    
    const { error } = await client
      .from('profiles')
      .delete()
      .in('id', idsToDelete)

    if (error) throw error
    isBatchDeleteDialogOpen.value = false
    selectedUserIds.value = new Set()
    await loadUsers()
  } catch (err) {
    console.error('批量删除失败:', err)
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

// 复制家庭 ID
const copyFamilyId = async (familyId: string) => {
  try {
    await navigator.clipboard.writeText(familyId)
    copiedFamilyId.value = familyId
    setTimeout(() => {
      copiedFamilyId.value = null
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

onMounted(() => {
  loadUsers()
})

</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        用户管理
      </h1>
      <p class="text-gray-600">管理所有博客用户和家庭</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>

    <!-- No Permission -->
    <div v-else-if="!isSuperAdmin" class="bg-white rounded-2xl p-12 text-center border border-gray-100">
      <Shield class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">权限不足</h3>
      <p class="text-gray-600">只有超级管理员可以访问用户管理页面</p>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <UsersIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ users.length }}</div>
              <div class="text-sm text-gray-600">注册用户总数</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ filteredUsers.length }}</div>
              <div class="text-sm text-gray-600">当前显示用户</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Batch Actions -->
      <div class="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
        <div class="relative mb-4">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索用户名、邮箱、家庭名称..."
            class="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <!-- Batch Actions -->
        <div v-if="filteredUsers.length > 0" class="flex items-center justify-between pt-4 border-t">
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0"
              @change="toggleSelectAll"
              class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span class="text-sm text-gray-600">
              {{ selectedUserIds.size > 0 ? `已选 ${selectedUserIds.size} 个用户` : '全选' }}
            </span>
          </div>
          
          <div v-if="selectedUserIds.size > 0" class="flex gap-2">
            <button
              @click="selectedUserIds = new Set()"
              class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消选择
            </button>
            <button
              @click="isBatchDeleteDialogOpen = true"
              :disabled="selectedUserIds.has(user?.id || '')"
              :class="[
                'px-4 py-2 text-sm rounded-lg transition-colors',
                selectedUserIds.has(user?.id || '')
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              ]"
            >
              <Trash2 class="w-4 h-4 inline-block mr-1" />
              批量删除 ({{ selectedUserIds.size }})
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table - Grouped by Family -->
      <div v-if="filteredUsers.length === 0" class="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <UsersIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">未找到用户</h3>
        <p class="text-gray-600">{{ searchQuery ? '尝试调整搜索条件' : '系统中还没有用户' }}</p>
      </div>

      <!-- 家庭列表 -->
      <div v-else>
        <!-- 调试信息 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
          <p class="text-blue-800">
            📊 调试信息: 共 {{ groupedByFamily.length }} 个家庭 | 
            当前第 {{ currentPage }} 页 / 共 {{ totalPages }} 页 | 
            每页 {{ itemsPerPage }} 个 | 
            当前显示 {{ paginatedGroups.length }} 个家庭
          </p>
        </div>

        <!-- 家庭卡片列表 -->
        <div class="space-y-6">
          <div
            v-for="group in paginatedGroups"
            :key="group.familyId"
            class="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm"
          >
            <!-- 家庭头部 -->
            <div
              :class="[
                'px-6 py-5 border-b-2',
                group.isSuperAdmin 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-gray-50 border-gray-200'
              ]"
            >
              <div class="flex items-start gap-4">
                <!-- 家庭图标 -->
                <div
                  :class="[
                    'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl flex-shrink-0 shadow-md',
                    group.isSuperAdmin
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  ]"
                >
                  {{ group.familyName.charAt(0) }}
                </div>

                <!-- 家庭信息 -->
                <div class="flex-1 min-w-0">
                  <!-- 家庭名称和标签 -->
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-bold text-xl text-gray-900">{{ group.familyName }}</h3>
                    <span
                      v-if="group.isSuperAdmin"
                      class="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200"
                    >
                      ⭐ 超级管理员家庭
                    </span>
                  </div>

                  <!-- 成员数和家庭 ID -->
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="text-sm text-gray-600 font-medium">
                      👥 {{ group.users.length }} 位成员
                    </span>
                    
                    <span class="text-gray-300">•</span>
                    
                    <!-- 家庭 ID 显示区域 -->
                    <div class="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border-2 border-gray-300">
                      <span class="text-xs text-gray-500 font-semibold">家庭ID:</span>
                      <code class="text-sm font-mono text-gray-800 font-bold">
                        {{ group.familyId === 'no-family' ? '未分配' : group.familyId.slice(0, 12) + '...' }}
                      </code>
                      <button
                        v-if="group.familyId !== 'no-family'"
                        @click="copyFamilyId(group.familyId)"
                        :class="[
                          'p-1.5 rounded-md transition-all',
                          copiedFamilyId === group.familyId 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        ]"
                        :title="copiedFamilyId === group.familyId ? '✓ 已复制！' : '点击复制完整 ID'"
                      >
                        <Check v-if="copiedFamilyId === group.familyId" class="w-4 h-4" />
                        <Copy v-else class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Users Table -->
            <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50/50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600 w-12">
                    <input
                      type="checkbox"
                      :checked="group.users.length > 0 && group.users.every(u => selectedUserIds.has(u.id))"
                      @change="() => {
                        const allSelected = group.users.every(u => selectedUserIds.has(u.id))
                        const newSet = new Set(selectedUserIds)
                        group.users.forEach(u => {
                          if (allSelected) {
                            newSet.delete(u.id)
                          } else {
                            newSet.add(u.id)
                          }
                        })
                        selectedUserIds = newSet
                      }"
                      class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600">邮箱</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                  <th class="px-6 py-3 text-left text-sm font-medium text-gray-600">注册时间</th>
                  <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="u in group.users"
                  :key="u.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <input
                      type="checkbox"
                      :checked="selectedUserIds.has(u.id)"
                      @change="toggleUserSelection(u.id)"
                      class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="u.avatar_url"
                        :src="u.avatar_url"
                        :alt="u.name"
                        class="w-10 h-10 rounded-full ring-2 ring-gray-100"
                      />
                      <div
                        v-else-if="u.avatar_color"
                        class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-gray-100"
                        :style="{ backgroundColor: u.avatar_color }"
                      >
                        {{ u.name.slice(-1) }}
                      </div>
                      <div
                        v-else
                        class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold"
                      >
                        {{ u.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ u.name }}</div>
                        <div v-if="u.bio" class="text-sm text-gray-500 truncate max-w-xs">
                          {{ u.bio }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 text-sm">
                      <Mail class="w-4 h-4 text-gray-400" />
                      <span v-if="u.role === 'child'" class="text-gray-400 italic">无邮箱</span>
                      <span v-else-if="u.email" class="text-gray-600">{{ u.email }}</span>
                      <span v-else class="text-gray-400 text-xs font-mono">
                        ID: {{ u.id.slice(0, 8) }}...
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      v-if="u.is_super_admin"
                      class="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200"
                    >
                      ⭐ 超级管理员
                    </span>
                    <span
                      v-else-if="u.role === 'admin'"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      家长
                    </span>
                    <span
                      v-else
                      class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                    >
                      孩子
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ formatDate(u.created_at) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        @click="openRoleDialog(u)"
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="更改角色"
                      >
                        <Shield class="w-4 h-4" />
                      </button>
                      <button
                        @click="() => {
                          selectedUser = u
                          isDeleteDialogOpen = true
                        }"
                        :disabled="u.id === user?.id"
                        :class="[
                          'p-2 rounded-lg transition-colors',
                          u.id === user?.id
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        ]"
                        :title="u.id === user?.id ? '不能删除自己' : '删除用户'"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>

        <!-- 分页组件 - 始终显示 -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-5 mt-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- 统计信息 -->
            <div class="text-sm font-semibold text-gray-700">
              📄 显示第 <span class="text-purple-600">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - 
              <span class="text-purple-600">{{ Math.min(currentPage * itemsPerPage, groupedByFamily.length) }}</span> 个家庭，
              共 <span class="text-purple-600">{{ groupedByFamily.length }}</span> 个
              <span v-if="totalPages > 1" class="text-gray-500 ml-2">
                (第 {{ currentPage }}/{{ totalPages }} 页)
              </span>
            </div>
            
            <!-- 分页按钮 -->
            <div v-if="totalPages > 1" class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all',
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700 shadow-sm'
                ]"
              >
                ← 上一页
              </button>
              
              <div class="flex items-center gap-1">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'w-10 h-10 rounded-xl text-sm font-bold transition-all',
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                      : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all',
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-purple-100 hover:text-purple-700 shadow-sm'
                ]"
              >
                下一页 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Role Change Modal -->
    <div
      v-if="isRoleDialogOpen && selectedUser"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="isRoleDialogOpen = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">更改用户角色</h3>
        <div class="space-y-4">
          <p class="text-gray-700">
            为用户 <strong>{{ selectedUser.name }}</strong> 选择角色：
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p class="font-medium mb-1">提示：</p>
            <p>当前系统只支持 admin（家长）角色。</p>
          </div>
          <select
            v-model="newRole"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="admin">家长 (Admin)</option>
            <option value="child">孩子 (Child)</option>
          </select>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="isRoleDialogOpen = false"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleRoleUpdate"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            确认更改
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="isDeleteDialogOpen && selectedUser"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="isDeleteDialogOpen = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">删除用户</h3>
        <p class="text-gray-600 mb-6">
          {{ selectedUser.id === user?.id
            ? '不能删除自己'
            : `确定要删除用户"${selectedUser.name}"吗？此操作将删除该用户的所有数据，且无法撤销。`
          }}
        </p>
        <div class="flex gap-3">
          <button
            @click="isDeleteDialogOpen = false"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleDeleteUser"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- Batch Delete Confirmation -->
    <div
      v-if="isBatchDeleteDialogOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="isBatchDeleteDialogOpen = false"
    >
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">批量删除用户</h3>
        <p class="text-gray-600 mb-6">
          确定要删除选中的 {{ selectedUserIds.size }} 个用户吗？此操作将删除这些用户的所有数据，且无法撤销。
        </p>
        <div class="flex gap-3">
          <button
            @click="isBatchDeleteDialogOpen = false"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleBatchDelete"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            批量删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
