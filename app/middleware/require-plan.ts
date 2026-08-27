export default defineNuxtRouteMiddleware(async () => {
  try {
    await $fetch('/api/plans/current')
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401)
      return navigateTo('/')
  }
})
