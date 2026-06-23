<script setup lang="ts">
await navigateTo('/workouts', { replace: true })
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-slate-100 p-4">
    <NuxtLink class="text-sm font-bold text-emerald-700 hover:text-emerald-800" to="/workouts">
      Go to upcoming workouts
    </NuxtLink>
  </main>
</template>
