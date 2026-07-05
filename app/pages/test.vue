<script setup lang="ts">
async function createPlanRequest(goal: string) {
  return await $fetch('/api/plans/create', {
    method: 'POST',
    body: { goal },
  })
}

type WorkoutPlan = Awaited<ReturnType<typeof createPlanRequest>>

const plan = useState<WorkoutPlan | null>('test-workout-plan', () => null)
const actionInput = ref('')
const pendingAction = ref<'create' | 'edit-plan' | 'edit-workout' | null>(null)
const message = ref('')

const hasPlan = computed(() => plan.value !== null)
const todayWorkout = computed(() => plan.value?.workouts[0] ?? null)
const inputLabel = computed(() => hasPlan.value ? 'Adjustment' : 'Plan goal')
const inputPlaceholder = computed(() => hasPlan.value
  ? 'Example: Make today easier on my knees and add more core work.'
  : 'Example: Build a 3-day strength plan for functional fitness.',
)
const rawPlan = computed(() => JSON.stringify(plan.value, null, 2))

function errorMessage(error: unknown, fallback: string) {
  return error && typeof error === 'object' && 'statusMessage' in error
    ? String(error.statusMessage)
    : fallback
}

async function updatePlanRequest(currentPlan: WorkoutPlan, adjustment: string): Promise<WorkoutPlan> {
  return await $fetch<WorkoutPlan>(`/api/plans/${currentPlan.id}`, {
    method: 'PATCH',
    body: { plan: currentPlan, adjustment },
  })
}

async function updateWorkoutRequest(currentPlan: WorkoutPlan, workoutId: string, adjustment: string): Promise<WorkoutPlan> {
  return await $fetch<WorkoutPlan>(`/api/plans/${currentPlan.id}/workouts/${workoutId}`, {
    method: 'PATCH',
    body: { plan: currentPlan, adjustment },
  })
}

async function createPlan() {
  const goal = actionInput.value.trim()

  if (!goal || pendingAction.value || hasPlan.value) {
    return
  }

  pendingAction.value = 'create'
  message.value = ''

  try {
    plan.value = await createPlanRequest(goal)
    actionInput.value = ''
    message.value = 'Plan created. Plan actions are now available.'
  }
  catch (error) {
    message.value = errorMessage(error, 'Could not create plan. Please try again.')
  }
  finally {
    pendingAction.value = null
  }
}

async function editPlan() {
  const adjustment = actionInput.value.trim()
  const currentPlan = plan.value

  if (!adjustment || !currentPlan || pendingAction.value) {
    return
  }

  pendingAction.value = 'edit-plan'
  message.value = ''

  try {
    plan.value = await updatePlanRequest(currentPlan, adjustment)
    actionInput.value = ''
    message.value = 'Plan updated.'
  }
  catch (error) {
    message.value = errorMessage(error, 'Could not update plan. Please try again.')
  }
  finally {
    pendingAction.value = null
  }
}

async function editTodayWorkout() {
  const adjustment = actionInput.value.trim()
  const currentPlan = plan.value
  const workout = todayWorkout.value

  if (!adjustment || !currentPlan || !workout?.id || pendingAction.value) {
    return
  }

  pendingAction.value = 'edit-workout'
  message.value = ''

  try {
    plan.value = await updateWorkoutRequest(currentPlan, String(workout.id), adjustment)
    actionInput.value = ''
    message.value = 'Today\'s workout updated.'
  }
  catch (error) {
    message.value = errorMessage(error, 'Could not update today\'s workout. Please try again.')
  }
  finally {
    pendingAction.value = null
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-4 text-slate-950 sm:p-6">
    <div class="mx-auto grid w-full max-w-5xl gap-4">
      <header class="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_50px_rgb(15_23_42_/_14%)] sm:p-6">
        <p class="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
          Test harness
        </p>
        <h1 class="text-3xl font-black tracking-tight sm:text-4xl">
          Workout plan actions
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Create a plan first, then use the same input to mutate the persisted plan state through plan and workout actions.
        </p>
      </header>

      <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgb(15_23_42_/_8%)] sm:p-5">
        <form class="grid gap-3" @submit.prevent="hasPlan ? editPlan() : createPlan()">
          <label class="grid gap-1.5">
            <span class="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{{ inputLabel }}</span>
            <textarea
              v-model="actionInput"
              class="min-h-28 w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              :placeholder="inputPlaceholder"
            />
          </label>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="!hasPlan"
              class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
              :disabled="!actionInput.trim() || pendingAction !== null"
            >
              {{ pendingAction === 'create' ? 'Creating...' : 'Create plan' }}
            </button>

            <template v-else>
              <button
                class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                type="submit"
                :disabled="!actionInput.trim() || pendingAction !== null"
              >
                {{ pendingAction === 'edit-plan' ? 'Updating plan...' : 'Edit plan' }}
              </button>
              <button
                class="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                type="button"
                :disabled="!actionInput.trim() || !todayWorkout || pendingAction !== null"
                @click="editTodayWorkout"
              >
                {{ pendingAction === 'edit-workout' ? 'Updating workout...' : 'Edit today\'s workout' }}
              </button>
            </template>
          </div>

          <p v-if="message" class="text-sm font-semibold text-slate-500">
            {{ message }}
          </p>
        </form>
      </section>

      <section v-if="!plan" class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 text-center text-sm font-semibold text-slate-500">
        Create a plan to unlock plan and workout actions.
      </section>

      <section v-else class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article class="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgb(15_23_42_/_8%)] sm:p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">
                Plan v{{ plan.version }}
              </p>
              <h2 class="text-2xl font-black text-slate-950">
                {{ plan.title }}
              </h2>
              <p class="mt-1 text-sm font-semibold text-slate-500">
                Goal: {{ plan.goal }}
              </p>
            </div>
            <div class="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-emerald-900 ring-1 ring-emerald-100">
              <p class="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">
                Workouts
              </p>
              <p class="text-2xl font-black leading-none">
                {{ plan.workouts.length }}
              </p>
            </div>
          </div>

          <p class="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
            {{ plan.summary }}
          </p>

          <div class="mt-4 grid gap-2">
            <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
              Change log
            </h3>
            <ol class="grid gap-1 text-sm text-slate-600">
              <li v-for="entry in plan.changeLog" :key="entry" class="rounded-xl bg-slate-50 px-3 py-2">
                {{ entry }}
              </li>
            </ol>
          </div>
        </article>

        <article class="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgb(15_23_42_/_8%)] sm:p-5">
          <p class="mb-1 text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">
            Today's workout
          </p>
          <h2 class="text-2xl font-black text-slate-950">
            {{ todayWorkout?.title ?? 'No workout' }}
          </h2>
          <p v-if="todayWorkout?.focus" class="mt-1 text-sm font-semibold text-slate-500">
            {{ todayWorkout.focus }}
          </p>
          <p v-if="todayWorkout?.notes" class="mt-3 text-sm leading-6 text-slate-600">
            {{ todayWorkout.notes }}
          </p>

          <div v-if="todayWorkout" class="mt-4 grid gap-2">
            <div
              v-for="exercise in todayWorkout.exercises"
              :key="exercise.id ?? exercise.name"
              class="rounded-2xl bg-slate-50 p-3"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-bold text-slate-900">
                  {{ exercise.name }}
                </p>
                <p class="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                  {{ exercise.sets.length }} sets
                </p>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgb(15_23_42_/_8%)] lg:col-span-2 sm:p-5">
          <h2 class="mb-3 text-lg font-black text-slate-950">
            Plan workouts
          </h2>
          <div class="grid gap-3 md:grid-cols-3">
            <div
              v-for="workout in plan.workouts"
              :key="workout.id ?? workout.title"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <p class="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                {{ workout.date ?? 'Upcoming' }}
              </p>
              <h3 class="mt-1 font-black text-slate-950">
                {{ workout.title }}
              </h3>
              <p v-if="workout.focus" class="mt-1 text-sm font-semibold text-slate-500">
                {{ workout.focus }}
              </p>
              <p class="mt-3 text-sm font-bold text-emerald-700">
                {{ workout.exercises.length }} exercises
              </p>
            </div>
          </div>
        </article>

        <details class="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_14px_40px_rgb(15_23_42_/_10%)] lg:col-span-2 sm:p-5">
          <summary class="cursor-pointer text-sm font-bold uppercase tracking-[0.1em] text-emerald-300">
            Raw plan state
          </summary>
          <pre class="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-5 text-slate-200">{{ rawPlan }}</pre>
        </details>
      </section>
    </div>
  </main>
</template>
