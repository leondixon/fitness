<script setup lang="ts">
interface WorkoutPlanExercise {
  id: string | number
  name: string
  restSeconds?: number
  workSetSeconds?: number
  sets: unknown[]
}

interface WorkoutPlanWorkout {
  id?: string | number
  title: string
  subtitle?: string
  date?: string
  focus?: string
  notes?: string
  exercises: WorkoutPlanExercise[]
}

withDefaults(
  defineProps<{
    workouts?: WorkoutPlanWorkout[]
  }>(),
  {
    workouts: () => [],
  },
)

const emit = defineEmits<{
  select: [workout: WorkoutPlanWorkout]
}>()

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.ceil(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`
}

function exerciseDurationSeconds(exercise: WorkoutPlanExercise) {
  const workSetSeconds = exercise.workSetSeconds ?? 45
  const restSeconds = exercise.restSeconds ?? 90
  const setCount = exercise.sets.length
  const restCount = Math.max(setCount - 1, 0)

  return setCount * workSetSeconds + restCount * restSeconds
}

function displayDurationSeconds(seconds: number) {
  if (seconds < 60) {
    return seconds
  }

  return Math.ceil(seconds / 60) * 60
}

function workoutDuration(workout: WorkoutPlanWorkout) {
  const seconds = workout.exercises.reduce(
    (total, exercise) => total + displayDurationSeconds(exerciseDurationSeconds(exercise)),
    0,
  )

  return formatDuration(seconds)
}

function totalSets(workout: WorkoutPlanWorkout) {
  return workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)
}
</script>

<template>
  <section class="mx-auto grid w-full max-w-[860px] gap-3">
    <header class="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_10px_30px_rgb(15_23_42_/_12%)] dark:border-slate-800 sm:p-5">
      <p class="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-emerald-300">
        Plan
      </p>
      <h1 class="text-2xl font-extrabold leading-tight">
        Upcoming workouts
      </h1>
      <p class="mt-1 text-sm leading-5 text-slate-300">
        Pick a session to open the workout logger.
      </p>
    </header>

    <div class="grid gap-3">
      <button
        v-for="workout in workouts"
        :key="workout.id ?? workout.title"
        class="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_10px_30px_rgb(15_23_42_/_7%)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_16px_40px_rgb(15_23_42_/_10%)] focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700 sm:p-4"
        type="button"
        @click="emit('select', workout)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="mb-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              {{ workout.date ?? 'Upcoming' }}
            </p>
            <h2 class="truncate text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">
              {{ workout.title }}
            </h2>
            <p v-if="workout.focus" class="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
              {{ workout.focus }}
            </p>
          </div>

          <div class="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-right text-emerald-900 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">
              Est
            </p>
            <p class="text-lg font-black leading-none">
              {{ workoutDuration(workout) }}
            </p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-1.5 text-center">
          <div class="rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-800">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Exercises
            </p>
            <p class="text-lg font-black leading-tight text-slate-900 dark:text-slate-100">
              {{ workout.exercises.length }}
            </p>
          </div>
          <div class="rounded-xl bg-slate-50 px-2 py-1.5 dark:bg-slate-800">
            <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              Sets
            </p>
            <p class="text-lg font-black leading-tight text-slate-900 dark:text-slate-100">
              {{ totalSets(workout) }}
            </p>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
