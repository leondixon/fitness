<script setup lang="ts">
import type { z } from 'zod'
import type { workoutSessionSchema } from '~~/server/schema/session'
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

type WorkoutSession = z.infer<typeof workoutSessionSchema>

definePageMeta({ middleware: 'require-plan' })

const route = useRoute()
const { data: planData } = await useFetch('/api/plans/current')
const plan = computed(() => planData.value?.plan as WorkoutPlan | null | undefined)
const nextWorkout = computed(() => plan.value?.upcoming[0]?.workout)
const isNextWorkout = computed(() => nextWorkout.value?.id === route.params.id)
const session = ref<WorkoutSession>()
const savingExerciseId = ref('')
const finishing = ref(false)
const requestError = ref('')

if (isNextWorkout.value) {
  const response = await $fetch('/api/sessions/current', { method: 'POST' })
  session.value = response.session
}

async function saveExercise(exerciseId: string, sets: { position: number, kg: number, reps: number }[]) {
  if (!session.value)
    return
  savingExerciseId.value = exerciseId
  requestError.value = ''
  try {
    const response = await $fetch(`/api/sessions/${session.value.id}/exercises`, {
      method: 'PUT',
      body: { exerciseId, sets },
    })
    session.value = response.session
  }
  catch (error) {
    requestError.value = error instanceof Error ? error.message : 'Could not save this exercise.'
  }
  finally {
    savingExerciseId.value = ''
  }
}

async function undoExercise(exerciseId: string) {
  if (!session.value)
    return
  savingExerciseId.value = exerciseId
  try {
    const response = await $fetch(`/api/sessions/${session.value.id}/exercises`, {
      method: 'DELETE',
      body: { exerciseId },
    })
    session.value = response.session
  }
  finally {
    savingExerciseId.value = ''
  }
}

async function finish() {
  if (!session.value || finishing.value)
    return
  finishing.value = true
  requestError.value = ''
  try {
    await $fetch(`/api/sessions/${session.value.id}/finish`, { method: 'POST' })
    await navigateTo('/workouts')
  }
  catch (error) {
    requestError.value = error instanceof Error ? error.message : 'Could not finish the workout.'
  }
  finally {
    finishing.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-3">
    <div class="mx-auto grid w-full max-w-[860px] gap-3">
      <NuxtLink class="w-fit rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm" to="/workouts">
        ← Back to routine
      </NuxtLink>
      <p v-if="requestError" class="rounded-xl bg-white p-3 text-sm font-semibold text-red-700">
        {{ requestError }}
      </p>
      <section v-if="!isNextWorkout || !nextWorkout" class="rounded-2xl bg-white p-4">
        <h1 class="text-xl font-extrabold">
          Preview workouts cannot be started
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Finish the current workout to advance the rotation.
        </p>
      </section>
      <workout-logger
        v-else-if="session"
        :finishing="finishing"
        :saving-exercise-id="savingExerciseId"
        :session="session"
        :workout="nextWorkout"
        @finish="finish"
        @save="saveExercise"
        @undo="undoExercise"
      />
    </div>
  </main>
</template>
