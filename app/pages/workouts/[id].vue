<script setup lang="ts">
import type { z } from 'zod'
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'
import { sessionDraftSchema, workoutSessionSchema } from '~~/server/schema/session'

type WorkoutSession = z.infer<typeof workoutSessionSchema>

definePageMeta({ middleware: 'require-plan' })

function draftKey(sessionId: string) {
  return `fitness-session-draft:${sessionId}`
}

function readDraft(sessionId: string) {
  if (!import.meta.client)
    return undefined
  const raw = localStorage.getItem(draftKey(sessionId))
  if (!raw)
    return undefined
  try {
    const parsed = sessionDraftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data.results : undefined
  }
  catch {
    return undefined
  }
}

function writeDraft(sessionId: string, results: WorkoutSession['results']) {
  if (!import.meta.client)
    return
  localStorage.setItem(draftKey(sessionId), JSON.stringify({ results }))
}

function clearDraft(sessionId: string) {
  if (!import.meta.client)
    return
  localStorage.removeItem(draftKey(sessionId))
}

const route = useRoute()
const { data: planData, refresh } = await useFetch('/api/plans/current', {
  getCachedData: () => undefined,
})
await refresh()
const plan = computed(() => planData.value?.plan as WorkoutPlan | null | undefined)
const nextWorkout = computed(() => plan.value?.upcoming[0]?.workout)
const isNextWorkout = computed(() => nextWorkout.value?.id === String(route.params.id ?? ''))
const session = ref<WorkoutSession>()
const finishing = ref(false)
const requestError = ref('')

if (isNextWorkout.value) {
  const response = await $fetch('/api/sessions/current', { method: 'POST' })
  const draft = readDraft(response.session.id)
  session.value = {
    ...response.session,
    results: draft ?? response.session.results,
  }
}

function saveExercise(exerciseId: string, sets: WorkoutSession['results'][number]['sets']) {
  const current = session.value
  const exercise = nextWorkout.value?.exercises.find(item => item.id === exerciseId)
  if (!current || !exercise)
    return
  const results = [
    ...current.results.filter(result => result.exerciseId !== exerciseId),
    { exerciseId, exerciseName: exercise.name, completed: true, sets },
  ]
  session.value = { ...current, results }
  writeDraft(current.id, results)
}

function undoExercise(exerciseId: string) {
  const current = session.value
  if (!current)
    return
  const results = current.results.filter(result => result.exerciseId !== exerciseId)
  session.value = { ...current, results }
  writeDraft(current.id, results)
}

async function finish() {
  const current = session.value
  if (!current || finishing.value)
    return
  finishing.value = true
  requestError.value = ''
  try {
    await $fetch(`/api/sessions/${current.id}/finish`, {
      method: 'POST',
      body: {
        results: current.results.map(result => ({
          exerciseId: result.exerciseId,
          sets: result.sets,
        })),
      },
    })
    clearDraft(current.id)
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
  <main class="page">
    <NuxtLink class="link-mute w-fit no-underline" to="/workouts">
      Back
    </NuxtLink>
    <p v-if="requestError" class="mt-6 text-[15px] text-red-700">
      {{ requestError }}
    </p>
    <section v-if="!isNextWorkout || !nextWorkout" class="mt-10">
      <h1 class="text-[1.75rem] leading-none tracking-tight">
        Preview workouts cannot be started
      </h1>
      <p class="mt-3 text-[15px] text-mute">
        Finish the current workout to advance the rotation.
      </p>
    </section>
    <workout-logger
      v-else-if="session"
      class="mt-8"
      :finishing="finishing"
      :session="session"
      :workout="nextWorkout"
      @finish="finish"
      @save="saveExercise"
      @undo="undoExercise"
    />
  </main>
</template>
