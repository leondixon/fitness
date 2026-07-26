<script setup lang="ts">
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

definePageMeta({ middleware: 'require-plan' })

const { data, error } = await useFetch('/api/plans/current')
const plan = computed(() => data.value?.plan as WorkoutPlan | null | undefined)
const endingPlan = ref(false)
const endPlanError = ref('')

function openWorkout(workout: WorkoutPlan['workouts'][number]) {
  return navigateTo(`/workouts/${workout.id}`)
}

async function endPlan() {
  if (!plan.value || endingPlan.value)
    return

  endingPlan.value = true
  endPlanError.value = ''

  try {
    await $fetch(`/api/plans/${plan.value.id}`, { method: 'DELETE' })
    await navigateTo('/')
  }
  catch (requestError) {
    endPlanError.value = requestError instanceof Error ? requestError.message : 'Could not end your workout plan.'
  }
  finally {
    endingPlan.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-3">
    <div class="mx-auto grid w-full max-w-[860px] gap-3">
      <p v-if="error" class="rounded-2xl bg-white p-4 text-sm font-semibold text-red-700">
        Could not load your workout plan.
      </p>
      <p v-else-if="endPlanError" class="rounded-2xl bg-white p-4 text-sm font-semibold text-red-700">
        {{ endPlanError }}
      </p>
      <workout-plan
        v-if="plan"
        :created-at="plan.createdAt"
        :ending-plan="endingPlan"
        :workouts="plan.workouts"
        @end-plan="endPlan"
        @select="openWorkout"
      />
      <p v-else class="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600">
        There isn't a current workout plan yet.
      </p>
    </div>
  </main>
</template>
