<script setup lang="ts">
import type { WorkoutPlan } from '~~/server/schema/workoutPlan'

defineProps<{ plan: WorkoutPlan }>()
const emit = defineEmits<{ select: [] }>()

function totalSets(workout: WorkoutPlan['workouts'][number]) {
  return workout.exercises.reduce((count, exercise) => count + exercise.sets.length, 0)
}
</script>

<template>
  <section class="mx-auto grid w-full max-w-[860px] gap-3">
    <header class="rounded-2xl bg-slate-950 p-5 text-white shadow-lg">
      <p class="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-300">
        Repeating routine · Version {{ plan.version }}
      </p>
      <h1 class="text-2xl font-extrabold">
        Next five workouts
      </h1>
      <p class="mt-1 text-sm text-slate-300">
        Complete the first session to advance the rotation.
      </p>
    </header>

    <button
      v-for="upcoming in plan.upcoming"
      :key="upcoming.occurrence"
      class="w-full rounded-2xl border bg-white p-4 text-left shadow-sm"
      :class="upcoming.loggable ? 'border-emerald-400 hover:border-emerald-600' : 'cursor-default border-slate-200 opacity-75'"
      :disabled="!upcoming.loggable"
      type="button"
      @click="upcoming.loggable && emit('select')"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[0.65rem] font-bold uppercase tracking-wider" :class="upcoming.loggable ? 'text-emerald-700' : 'text-slate-500'">
            {{ upcoming.loggable ? 'Up next · Start or resume' : `Preview ${upcoming.occurrence + 1}` }}
          </p>
          <h2 class="text-xl font-bold text-slate-900">
            {{ upcoming.workout.title }}
          </h2>
          <p v-if="upcoming.workout.focus" class="mt-1 text-xs font-semibold text-slate-500">
            {{ upcoming.workout.focus }}
          </p>
        </div>
        <div class="rounded-xl bg-slate-100 px-3 py-2 text-center">
          <p class="text-lg font-black">
            {{ upcoming.workout.exercises.length }}
          </p>
          <p class="text-[0.6rem] font-bold uppercase text-slate-500">
            exercises
          </p>
        </div>
      </div>
      <p class="mt-3 text-xs font-semibold text-slate-500">
        {{ totalSets(upcoming.workout) }} prescribed sets
      </p>
    </button>
  </section>
</template>
