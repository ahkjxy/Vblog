<script setup lang="ts">
import { 
  Users, 
  Shield, 
  Trash2, 
  Mail, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronRight,
  AtSign,
  AlertTriangle,
  Loader2,
  X,
  Check
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const client = useSupabaseClient()
const { user: currentUser, profile } = useAuth()
const { formatDate } = useUtils()

// 权限检查
onMounted(() => {
  if (profile.value && profile.value.role !== 'admin') {
    useRouter().push('/dashboard')
  }
})

interface UserProfile {
  id: string
  name: string | null
  avatar_url: string | null
  email: string
  role: string
  created_at: string
}

const { data: users, refresh } = await useAsyncData<UserProfile[]>('dashboard-users-list', async () => {
  // 获取所有 profile，并尝试关联对应的 auth.users 的 email (如果权限允许)
  // 在 Supabase 中，普通用户无法直接查询 auth.users 表。
  // 我们依赖 profiles 表中的数据，如果 profiles 表没有 email 字段，我们可能只能显示 profiles
  const { data: profiles, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取用户列表失败:', error)
    return []
  }
  return (profiles as any[]) || []
})

const searchQuery = ref('')
const roleFilter = ref('all')
const selectedUserIds = ref(new Set<string>())

const filteredUsers = computed(() => {
  if (!users.value) return []
  return users.value.filter(user => {
    const matchesSearch = !searchQuery.value || 
      (user.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

const isRoleModalOpen = ref(false)
const selectedUser = ref<any>(null)
const newRole = ref('')

const openRoleModal = (user: any) => {
  selectedUser.value = user
  newRole.value = user.role
  isRoleModalOpen.value = true
}

const handleUpdateRole = async () => {
  if (!selectedUser.value) return
  const { error } = await client
    .from('profiles')
    .update({ role: newRole.value })
    .eq('id', selectedUser.value.id)
  
  if (error) alert('更新失败: ' + error.message)
  else {
    isRoleModalOpen.value = false
    refresh()
  }
}

const handleDeleteUser = async (id: string, name: string) => {
  if (id === currentUser.value?.id) {
    alert('不能删除当前登录账号')
    return
  }
  if (!confirm(`确定要删除用户 "${name}" 吗？此操作将永久移除该用户的所有资料。`)) return
  
  const { error } = await client.from('profiles').delete().eq('id', id)
  if (error) alert('删除失败: ' + error.message)
  else refresh()
}

const toggleSelectAll = () => {
  if (selectedUserIds.value.size === filteredUsers.value.length) {
    selectedUserIds.value.clear()
  } else {
    selectedUserIds.value = new Set(filteredUsers.value.map(u => u.id))
  }
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent mb-2 tracking-tight">
          全量用户矩阵
        </h1>
        <p class="text-gray-500 font-medium font-mono text-xs uppercase tracking-widest">Global user management and system access control</p>
      </div>
      
      <div class="flex items-center gap-3">
         <div class="px-6 py-3 bg-white rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
            <Users class="w-5 h-5 text-brand-purple" />
            <span class="text-lg font-black text-gray-900">{{ users?.length || 0 }}</span>
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</span>
         </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="bg-white rounded-[40px] border border-gray-100 p-6 sm:p-8 shadow-xl space-y-6">
       <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="flex-1 relative w-full">
             <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 focus-within:text-brand-pink transition-colors" />
             <input 
               v-model="searchQuery"
               type="text" 
               placeholder="通过名称、邮箱或 ID 搜索用户..." 
               class="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brand-pink/5 transition-all focus:bg-white"
             />
          </div>
          
          <select 
            v-model="roleFilter"
            class="w-full md:w-48 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 appearance-none focus:ring-4 focus:ring-brand-pink/5 transition-all"
          >
             <option value="all">所有职能</option>
             <option value="admin">超级管理员</option>
             <option value="user">普通用户</option>
          </select>

          <button @click="refresh" class="px-6 py-4 bg-gray-50 text-brand-purple rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
             同步数据
          </button>
       </div>
    </div>

    <!-- Users Table Container -->
    <div class="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden relative">
       <!-- Bulk Action Bar -->
       <Transition name="slide">
          <div v-if="selectedUserIds.size > 0" class="absolute top-0 left-0 right-0 z-30 bg-gray-900 text-white p-4 flex items-center justify-between shadow-2xl">
             <div class="flex items-center gap-6 px-4">
                <span class="text-xs font-black uppercase tracking-widest">Selected: {{ selectedUserIds.size }} Users</span>
             </div>
             <div class="flex items-center gap-2">
                <button class="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Export</button>
                <button class="px-6 py-2 bg-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Batch Deactivate</button>
                <button @click="selectedUserIds.clear()" class="p-2 hover:text-brand-pink"><X class="w-5 h-5" /></button>
             </div>
          </div>
       </Transition>

       <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
             <thead>
                <tr class="bg-gray-50/50">
                   <th class="pl-10 pr-4 py-8 w-16">
                      <button @click="toggleSelectAll" class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all" :class="selectedUserIds.size > 0 ? 'bg-brand-pink border-brand-pink text-white' : 'border-gray-200'">
                         <Check v-if="selectedUserIds.size > 0" class="w-4 h-4" />
                      </button>
                   </th>
                   <th class="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">身份识别 / IDENTITY</th>
                   <th class="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">数字坐标 / COORDINATES</th>
                   <th class="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">系统权限 / CLEARANCE</th>
                   <th class="px-6 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right pr-10">核心指令 / COMMANDS</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-gray-50">
                <tr v-if="filteredUsers.length === 0" class="hover:bg-gray-50/30 transition-colors">
                   <td colspan="5" class="px-10 py-32 text-center text-gray-300 font-bold uppercase tracking-[0.3em] text-[10px]">
                      GRID EMPTY: NO USERS FOUND IN THIS SECTOR
                   </td>
                </tr>
                <tr 
                  v-for="user in filteredUsers" 
                  :key="user.id"
                  class="hover:bg-gray-50/50 transition-all group"
                  :class="{ 'bg-brand-pink/[0.02]': selectedUserIds.has(user.id) }"
                >
                   <td class="pl-10 pr-4 py-6">
                      <button 
                         @click="selectedUserIds.has(user.id) ? selectedUserIds.delete(user.id) : selectedUserIds.add(user.id)"
                         :class="['w-6 h-6 rounded border-2 flex items-center justify-center transition-all', selectedUserIds.has(user.id) ? 'bg-brand-pink border-brand-pink text-white rotate-0' : 'bg-white border-gray-100 opacity-60 group-hover:opacity-100']"
                      >
                         <Check v-if="selectedUserIds.has(user.id)" class="w-4 h-4" />
                      </button>
                   </td>
                   <td class="px-6 py-6">
                      <div class="flex items-center gap-5">
                         <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 p-0.5 shadow-sm overflow-hidden flex items-center justify-center font-black text-brand-pink text-xl group-hover:scale-105 transition-transform duration-500">
                            <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
                            <span v-else>{{ user.name?.[0]?.toUpperCase() || '?' }}</span>
                         </div>
                         <div>
                            <h4 class="font-black text-gray-900 leading-none mb-1 group-hover:text-brand-pink transition-colors">{{ user.name }}</h4>
                            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">CID: {{ user.id.slice(0, 8) }}...</p>
                         </div>
                      </div>
                   </td>
                   <td class="px-6 py-6 hidden md:table-cell">
                      <div class="flex flex-col gap-1">
                         <div class="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <Mail class="w-3.5 h-3.5 text-gray-300" />
                            {{ user.email || 'No Linked Email' }}
                         </div>
                         <div class="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            Joined {{ formatDate(user.created_at) }}
                         </div>
                      </div>
                   </td>
                   <td class="px-6 py-6">
                      <span :class="['px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2', 
                        user.role === 'admin' ? 'bg-brand-purple/5 text-brand-purple border border-brand-purple/10' : 'bg-brand-pink/5 text-brand-pink border border-brand-pink/10']">
                         <Shield v-if="user.role === 'admin'" class="w-3 h-3" />
                         {{ user.role === 'admin' ? 'SUPER ADMIN' : 'CONTRIBUTOR' }}
                      </span>
                   </td>
                   <td class="px-6 py-6 text-right pr-10">
                      <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                         <button 
                           @click="openRoleModal(user)"
                           class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                           title="权限设置"
                         >
                            <Shield class="w-4 h-4" />
                         </button>
                         <button 
                           v-if="user.id !== currentUser?.id"
                           @click="handleDeleteUser(user.id, user.name)"
                           class="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                           title="强制移除"
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

    <!-- Role Modal -->
    <Transition name="fade">
       <div v-if="isRoleModalOpen && selectedUser" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md" @click="isRoleModalOpen = false">
          <div class="bg-white rounded-[40px] max-w-lg w-full p-10 shadow-2xl animate-scale-in relative border border-gray-100" @click.stop>
             <div class="space-y-8 text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-brand-pink/10 to-brand-purple/10 rounded-[32px] flex items-center justify-center text-brand-pink mx-auto">
                   <Shield class="w-10 h-10" />
                </div>
                
                <div>
                   <h2 class="text-2xl font-black text-gray-900 mb-2">调整系统权限</h2>
                   <p class="text-xs font-medium text-gray-500">正在修改创作者 <span class="font-black text-brand-pink">{{ selectedUser.name }}</span> 的全局访问级别</p>
                </div>

                <div class="space-y-4">
                   <div 
                      @click="newRole = 'admin'"
                      :class="['p-6 rounded-[32px] border-4 transition-all cursor-pointer text-left flex items-start gap-4', newRole === 'admin' ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-50 bg-gray-50/50 hover:border-gray-100']"
                   >
                      <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0', newRole === 'admin' ? 'border-brand-purple bg-brand-purple text-white' : 'border-gray-200 bg-white']">
                         <div v-if="newRole === 'admin'" class="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <h4 class="font-black text-gray-900 uppercase tracking-widest text-xs">Super Admin (超级管理员)</h4>
                        <p class="text-[10px] text-gray-400 font-bold mt-1">完全权限：审核文章、管理分类、用户及系统设置</p>
                      </div>
                   </div>

                   <div 
                      @click="newRole = 'user'"
                      :class="['p-6 rounded-[32px] border-4 transition-all cursor-pointer text-left flex items-start gap-4', newRole === 'user' ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-50 bg-gray-50/50 hover:border-gray-100']"
                   >
                      <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0', newRole === 'user' ? 'border-brand-pink bg-brand-pink text-white' : 'border-gray-200 bg-white']">
                         <div v-if="newRole === 'user'" class="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <h4 class="font-black text-gray-900 uppercase tracking-widest text-xs">Contributor (投稿作者)</h4>
                        <p class="text-[10px] text-gray-400 font-bold mt-1">创作权限：发布文章、管理评论，但内容需经过审核</p>
                      </div>
                   </div>
                </div>

                <div class="pt-6 flex gap-4">
                   <button @click="isRoleModalOpen = false" class="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">放弃修改</button>
                   <button @click="handleUpdateRole" class="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand-purple transition-all">确认提权/降权</button>
                </div>
             </div>
          </div>
       </div>
    </Transition>
  </div>
</template>

<style scoped>
.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.slide-enter-active, .slide-leave-active { transition: transform 0.3s; }
.slide-enter-from, .slide-leave-to { transform: translateY(-100%); }
</style>
