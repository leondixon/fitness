<script setup lang="ts">
const mockWorkout = {
  title: 'Upper Body Strength',
  subtitle: 'A full push-focused session with heavy pressing, accessory volume, and arm work.',
  date: 'Today',
  duration: '75m',
  focus: 'Chest, shoulders, triceps',
  notes: 'Keep 1–2 reps in reserve on working sets.',
  exercises: [
    {
      id: 'bench-press',
      name: 'Bench Press',
      sets: [
        { warmup: true, previous: '40kg x 10' },
        { warmup: true, previous: '50kg x 5' },
        { previous: '60kg x 8' },
        { previous: '60kg x 7' },
        { previous: '57.5kg x 8' },
      ],
    },
    {
      id: 'incline-dumbbell-press',
      name: 'Incline Dumbbell Press',
      sets: [
        { previous: '22.5kg x 10' },
        { previous: '22.5kg x 9' },
        { previous: '20kg x 11' },
      ],
    },
    {
      id: 'seated-shoulder-press',
      name: 'Seated Shoulder Press',
      sets: [
        { warmup: true, previous: '25kg x 10' },
        { previous: '35kg x 8' },
        { previous: '35kg x 7' },
        { previous: '32.5kg x 9' },
      ],
    },
    {
      id: 'cable-fly',
      name: 'Cable Fly',
      sets: [
        { previous: '15kg x 12' },
        { previous: '15kg x 12' },
        { previous: '12.5kg x 15' },
      ],
    },
    {
      id: 'triceps-pushdown',
      name: 'Triceps Pushdown',
      sets: [
        { previous: '30kg x 12' },
        { previous: '30kg x 11' },
        { previous: '27.5kg x 13' },
      ],
    },
  ],
}
</script>

<template>
  <main class="app-shell">
    <workout-logger :workout="mockWorkout" />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
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
