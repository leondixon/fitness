export default defineNuxtRouteMiddleware(async () => {
  const { error } = await useFetch('/api/plans/current')

  if (error.value?.statusCode === 401) {
    return navigateTo('/')
  }
})
