export default defineNuxtRouteMiddleware(async () => {
  try {
    const { plan } = await $fetch('/api/plans/current')
    if (!plan)
      return navigateTo('/')
  }
  catch {
    return navigateTo('/')
  }
})
