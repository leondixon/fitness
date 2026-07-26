<script setup lang="ts">
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'
import { workoutPendingDays } from '~/utils/workout-schedule'

definePageMeta({ middleware: 'require-plan' })

const route = useRoute()
const { data } = await useFetch('/api/plans/current')
const plan = computed(() => data.value?.plan as WorkoutPlan | null | undefined)
const selectedWorkout = computed(() => plan.value?.workouts.find(workout => String(workout.id) === String(route.params.id)))
const now = new Date()

const selectedWorkoutPendingDays = computed(() => {
  if (!plan.value || !selectedWorkout.value?.id)
    return undefined

  return workoutPendingDays(plan.value.workouts, plan.value.createdAt, now)
    .get(String(selectedWorkout.value.id))
})
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-3">
    <div class="mx-auto grid w-full max-w-[860px] gap-3">
      <NuxtLink class="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:text-emerald-700" to="/workouts">
        ← Back to plan
      </NuxtLink>
      <section v-if="!selectedWorkout" class="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
        <h1 class="text-xl font-extrabold">
          Workout not found
        </h1><p class="mt-1 text-sm text-slate-500">
          This workout is not in your current plan.
        </p>
      </section>
      <workout-logger v-else :pending-days="selectedWorkoutPendingDays" :workout="selectedWorkout" />
    </div>
  </main>
</template>
