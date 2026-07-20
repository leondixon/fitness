<script setup lang="ts">
import type { WorkoutPlanWorkout } from '~/composables/useWorkoutPlan'

const route = useRoute()
const upcomingWorkouts = useWorkoutPlan()
const showWorkoutFeedback = ref(false)
const workoutEditFeedback = ref('')
const workoutEditPending = ref(false)
const workoutEditMessage = ref('')

const workoutId = computed(() => String(route.params.id))
const selectedWorkout = computed(() => upcomingWorkouts.value.find(workout => String(workout.id) === workoutId.value))

function errorMessage(error: unknown, fallback: string) {
  return error && typeof error === 'object' && 'statusMessage' in error
    ? String(error.statusMessage)
    : fallback
}

async function submitWorkoutEditFeedback() {
  const feedback = workoutEditFeedback.value.trim()
  const workout = selectedWorkout.value

  if (!feedback || !workout || workoutEditPending.value) {
    return
  }

  workoutEditPending.value = true
  workoutEditMessage.value = ''

  try {
    const response = await $fetch<{ editedWorkout: WorkoutPlanWorkout }>('/api/workout/edit', {
      method: 'POST',
      body: {
        workout,
        feedback,
      },
    })

    const workoutIndex = upcomingWorkouts.value.findIndex(item => item.id === workout.id)

    if (workoutIndex !== -1) {
      upcomingWorkouts.value.splice(workoutIndex, 1, response.editedWorkout)
    }

    workoutEditFeedback.value = ''
    workoutEditMessage.value = 'Workout updated with DeepSeek.'

    if (response.editedWorkout.id && String(response.editedWorkout.id) !== workoutId.value) {
      await navigateTo(`/workouts/${response.editedWorkout.id}`, { replace: true })
    }
  }
  catch (error) {
    workoutEditMessage.value = errorMessage(error, 'Could not update workout. Please try again.')
  }
  finally {
    workoutEditPending.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-3 dark:bg-slate-950">
    <div class="mx-auto grid w-full max-w-[860px] gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <NuxtLink
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
          to="/workouts"
        >
          ← Back to plan
        </NuxtLink>

        <button
          v-if="selectedWorkout"
          class="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10"
          type="button"
          @click="showWorkoutFeedback = !showWorkoutFeedback"
        >
          {{ showWorkoutFeedback ? 'Hide workout feedback' : 'Give workout feedback' }}
        </button>
      </div>

      <section v-if="!selectedWorkout" class="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_10px_30px_rgb(15_23_42_/_7%)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:p-5">
        <h1 class="text-xl font-extrabold">
          Workout not found
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This workout is not in the current plan.
        </p>
      </section>

      <section v-if="selectedWorkout && showWorkoutFeedback" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgb(15_23_42_/_7%)] dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div class="mb-3">
          <p class="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-400">
            Edit workout
          </p>
          <h2 class="text-xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
            Ask for changes to {{ selectedWorkout.title }}
          </h2>
          <p class="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
            Describe changes for this workout only, like swapping exercises, changing intensity, or working around soreness.
          </p>
        </div>

        <form class="grid gap-3" @submit.prevent="submitWorkoutEditFeedback">
          <label class="grid gap-1.5">
            <span class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Workout feedback</span>
            <textarea
              v-model="workoutEditFeedback"
              class="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-emerald-500/20"
              placeholder="Example: Make this easier on my knees and add more core work."
            />
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
              type="submit"
              :disabled="!workoutEditFeedback.trim() || workoutEditPending"
            >
              {{ workoutEditPending ? 'Sending…' : 'Update workout' }}
            </button>
            <p v-if="workoutEditMessage" class="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {{ workoutEditMessage }}
            </p>
          </div>
        </form>
      </section>

      <workout-logger v-if="selectedWorkout" :workout="selectedWorkout" />
    </div>
  </main>
</template>
