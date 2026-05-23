<script setup lang="ts">
const benchPressSets = [
  { warmup: true, previous: '40kg x 10' },
  { previous: '45kg x 7' },
  { previous: '45kg x 7' },
  { previous: '45kg x 6' },
] as const
</script>

<template>
  <main class="app-shell">
    <ExerciseLogger exercise-name="Bench Press" :sets="benchPressSets" />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: 24px;
  background: #f1f5f9;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
</style>
