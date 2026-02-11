export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  if (!user.value) {
    return navigateTo({
      path: '/auth/unified',
      query: {
        redirect: 'blog',
        returnUrl: to.fullPath
      }
    })
  }
})
