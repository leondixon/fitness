<script setup lang="ts">
interface WorkoutLoggerSet {
  previous?: string
  warmup?: boolean
}

interface WorkoutLoggerExercise {
  id: string | number
  name: string
  restSeconds?: number
  workSetSeconds?: number
  sets: WorkoutLoggerSet[]
}

interface WorkoutLoggerWorkout {
  title: string
  subtitle?: string
  date?: string
  focus?: string
  notes?: string
  exercises: WorkoutLoggerExercise[]
}

const props = withDefaults(
  defineProps<{
    workout?: WorkoutLoggerWorkout
  }>(),
  {
    workout: () => ({
      title: 'Workout',
      exercises: [],
    }),
  },
)

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

function displayDurationSeconds(seconds: number) {
  if (seconds < 60) {
    return seconds
  }

  return Math.ceil(seconds / 60) * 60
}

function exerciseDurationSeconds(exercise: WorkoutLoggerExercise) {
  const workSetSeconds = exercise.workSetSeconds ?? 45
  const restSeconds = exercise.restSeconds ?? 90
  const setCount = exercise.sets.length
  const restCount = Math.max(setCount - 1, 0)

  return setCount * workSetSeconds + restCount * restSeconds
}

function estimatedExerciseDisplaySeconds(exercise: WorkoutLoggerExercise) {
  return displayDurationSeconds(exerciseDurationSeconds(exercise))
}

const totalSets = computed(() => props.workout.exercises.reduce(
  (count, exercise) => count + exercise.sets.length,
  0,
))

const estimatedWorkoutSeconds = computed(() => props.workout.exercises.reduce(
  (seconds, exercise) => seconds + estimatedExerciseDisplaySeconds(exercise),
  0,
))

const estimatedWorkoutTime = computed(() => formatDuration(estimatedWorkoutSeconds.value))

function restTime(exercise: WorkoutLoggerExercise) {
  return formatDuration(exercise.restSeconds ?? 90)
}

function workSetTime(exercise: WorkoutLoggerExercise) {
  return formatDuration(exercise.workSetSeconds ?? 45)
}

function estimatedExerciseTime(exercise: WorkoutLoggerExercise) {
  return formatDuration(estimatedExerciseDisplaySeconds(exercise))
}
</script>

<template>
  <section class="mx-auto grid w-full max-w-[860px] gap-3">
    <header class="rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-[0_10px_30px_rgb(15_23_42_/_12%)] dark:border-slate-800 sm:p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="mb-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-emerald-300">
            Workout
          </p>
          <h1 class="truncate text-2xl font-extrabold leading-tight">
            {{ workout.title }}
          </h1>
          <p v-if="workout.focus" class="mt-1 truncate text-xs font-medium text-slate-300">
            {{ workout.focus }}
          </p>
        </div>

        <div class="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/10">
          <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-slate-400">
            Est
          </p>
          <p class="text-lg font-black leading-none">
            {{ estimatedWorkoutTime }}
          </p>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-1.5 text-center">
        <div class="rounded-xl bg-white/10 px-2 py-1.5 ring-1 ring-white/10">
          <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-slate-400">
            Exercises
          </p>
          <p class="text-lg font-black leading-tight">
            {{ workout.exercises.length }}
          </p>
        </div>
        <div class="rounded-xl bg-white/10 px-2 py-1.5 ring-1 ring-white/10">
          <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-slate-400">
            Sets
          </p>
          <p class="text-lg font-black leading-tight">
            {{ totalSets }}
          </p>
        </div>
        <div class="rounded-xl bg-white/10 px-2 py-1.5 ring-1 ring-white/10">
          <p class="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-slate-400">
            Date
          </p>
          <p class="truncate text-sm font-bold leading-tight">
            {{ workout.date ?? '—' }}
          </p>
        </div>
      </div>

      <p v-if="workout.notes" class="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">
        {{ workout.notes }}
      </p>
    </header>

    <div class="grid gap-3">
      <exercise-logger
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        :exercise-name="exercise.name"
        :estimated-time="estimatedExerciseTime(exercise)"
        :rest-time="restTime(exercise)"
        :work-set-time="workSetTime(exercise)"
        :sets="exercise.sets"
      />
    </div>
  </section>
</template>
