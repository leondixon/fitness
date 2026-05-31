<script setup lang="ts">
interface WorkoutLoggerSet {
  previous?: string
  warmup?: boolean
}

interface WorkoutLoggerExercise {
  id: string | number
  name: string
  sets: WorkoutLoggerSet[]
}

interface WorkoutLoggerWorkout {
  title: string
  subtitle?: string
  date?: string
  duration?: string
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

const totalSets = computed(() => props.workout.exercises.reduce(
  (count, exercise) => count + exercise.sets.length,
  0,
))
</script>

<template>
  <section class="mx-auto grid w-full max-w-[860px] gap-5">
    <header class="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgb(15_23_42_/_18%)] sm:p-7">
      <p class="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">
        Workout Logger
      </p>

      <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <h1 class="text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-none">
            {{ workout.title }}
          </h1>
          <p v-if="workout.subtitle" class="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            {{ workout.subtitle }}
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center sm:min-w-[320px]">
          <div class="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <p class="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-400">
              Exercises
            </p>
            <p class="mt-1 text-2xl font-black">
              {{ workout.exercises.length }}
            </p>
          </div>
          <div class="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <p class="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-400">
              Sets
            </p>
            <p class="mt-1 text-2xl font-black">
              {{ totalSets }}
            </p>
          </div>
          <div class="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <p class="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-400">
              Time
            </p>
            <p class="mt-1 text-2xl font-black">
              {{ workout.duration ?? '—' }}
            </p>
          </div>
        </div>
      </div>

      <dl class="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
        <div v-if="workout.date" class="rounded-2xl bg-slate-900 p-3">
          <dt class="font-bold uppercase tracking-[0.08em] text-slate-500">
            Date
          </dt>
          <dd class="mt-1 text-white">
            {{ workout.date }}
          </dd>
        </div>
        <div v-if="workout.focus" class="rounded-2xl bg-slate-900 p-3">
          <dt class="font-bold uppercase tracking-[0.08em] text-slate-500">
            Focus
          </dt>
          <dd class="mt-1 text-white">
            {{ workout.focus }}
          </dd>
        </div>
        <div v-if="workout.notes" class="rounded-2xl bg-slate-900 p-3 sm:col-span-1">
          <dt class="font-bold uppercase tracking-[0.08em] text-slate-500">
            Notes
          </dt>
          <dd class="mt-1 text-white">
            {{ workout.notes }}
          </dd>
        </div>
      </dl>
    </header>

    <div class="grid gap-5">
      <exercise-logger
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        :exercise-name="exercise.name"
        :sets="exercise.sets"
      />
    </div>
  </section>
</template>
