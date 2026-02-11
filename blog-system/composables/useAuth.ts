export const useAuth = () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  const profile = useState<any>('user-profile', () => null)
  const loading = useState<boolean>('user-profile-loading', () => false)

  const fetchProfile = async (force = false) => {
    if (!user.value) {
      profile.value = null
      return
    }
    if (profile.value && !force) return
    
    loading.value = true
    try {
      const { data } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle()
      profile.value = data
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    loading,
    fetchProfile
  }
}
