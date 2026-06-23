<script setup lang="ts">
import type { WorkoutPlanWorkout } from '~/composables/useWorkoutPlan'

const upcomingWorkouts = useWorkoutPlan()
const showPlanFeedback = ref(false)
const planEditFeedback = ref('')
const planEditPending = ref(false)
const planEditMessage = ref('')

function errorMessage(error: unknown, fallback: string) {
  return error && typeof error === 'object' && 'statusMessage' in error
    ? String(error.statusMessage)
    : fallback
}

async function submitPlanEditFeedback() {
  const feedback = planEditFeedback.value.trim()

  if (!feedback || planEditPending.value) {
    return
  }

  planEditPending.value = true
  planEditMessage.value = ''

  try {
    const response = await $fetch<{ editedWorkouts: WorkoutPlanWorkout[] }>('/api/workout/plan/edit', {
      method: 'POST',
      body: {
        workouts: upcomingWorkouts.value,
        feedback,
      },
    })

    upcomingWorkouts.value.splice(0, upcomingWorkouts.value.length, ...response.editedWorkouts)
    planEditFeedback.value = ''
    planEditMessage.value = 'Plan updated with DeepSeek.'
  }
  catch (error) {
    planEditMessage.value = errorMessage(error, 'Could not update plan. Please try again.')
  }
  finally {
    planEditPending.value = false
  }
}

function openWorkout(workout: WorkoutPlanWorkout) {
  return navigateTo(`/workouts/${workout.id}`)
}
</script>

<template>
  <main class="app-shell">
    <div class="mx-auto grid w-full max-w-[860px] gap-3">
      <div class="flex justify-end">
        <button
          class="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          type="button"
          @click="showPlanFeedback = !showPlanFeedback"
        >
          {{ showPlanFeedback ? 'Hide plan feedback' : 'Give plan feedback' }}
        </button>
      </div>

      <section v-if="showPlanFeedback" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgb(15_23_42_/_7%)] sm:p-5">
        <div class="mb-3">
          <p class="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-emerald-700">
            Edit plan
          </p>
          <h2 class="text-xl font-extrabold leading-tight text-slate-900">
            Ask for changes to the full workout plan
          </h2>
          <p class="mt-1 text-sm leading-5 text-slate-500">
            Describe changes across the whole plan, like changing the weekly split, adding recovery, or shifting the focus.
          </p>
        </div>

        <form class="grid gap-3" @submit.prevent="submitPlanEditFeedback">
          <label class="grid gap-1.5">
            <span class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Plan feedback</span>
            <textarea
              v-model="planEditFeedback"
              class="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              placeholder="Example: Make this a 3-day plan with more mobility and less knee-dominant work."
            />
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
              :disabled="!planEditFeedback.trim() || planEditPending"
            >
              {{ planEditPending ? 'Sending…' : 'Update plan' }}
            </button>
            <p v-if="planEditMessage" class="text-sm font-semibold text-slate-500">
              {{ planEditMessage }}
            </p>
          </div>
        </form>
      </section>

      <workout-plan
        :workouts="upcomingWorkouts"
        @select="openWorkout"
      />
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 12px;
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
