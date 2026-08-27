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
        :session="session"
        :workout="nextWorkout"
        @finish="finish"
        @save="saveExercise"
        @undo="undoExercise"
      />
    </div>
  </main>
</template>
