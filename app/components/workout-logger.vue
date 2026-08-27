<script setup lang="ts">
import type { z } from 'zod'
import type { workoutSessionSchema } from '~~/server/schema/session'
import type { Workout } from '~~/server/schema/workout'

type WorkoutSession = z.infer<typeof workoutSessionSchema>

const props = defineProps<{
  workout: Workout
  session: WorkoutSession
  finishing?: boolean
}>()

const emit = defineEmits<{
  save: [exerciseId: string, sets: WorkoutSession['results'][number]['sets']]
  undo: [exerciseId: string]
  finish: []
}>()

function resultFor(exerciseId: string) {
  return props.session.results.find(result => result.exerciseId === exerciseId)
}
</script>

<template>
  <section class="mx-auto grid w-full max-w-[860px] gap-3">
    <header class="rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
      <p class="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-300">
        Current workout
      </p>
      <h1 class="text-2xl font-extrabold">
        {{ workout.title }}
      </h1>
      <p v-if="workout.focus" class="mt-1 text-sm text-slate-300">
        {{ workout.focus }}
      </p>
    </header>

    <exercise-logger
      v-for="exercise in workout.exercises"
      :key="exercise.id"
      :completed="resultFor(exercise.id)?.completed"
      :exercise="exercise"
      :initial-sets="resultFor(exercise.id)?.sets ?? exercise.lastSets"
      @done="emit('save', exercise.id, $event)"
      @undo="emit('undo', exercise.id)"
    />

    <button class="rounded-2xl bg-slate-950 px-4 py-3 text-base font-black text-white disabled:opacity-50" :disabled="finishing" type="button" @click="emit('finish')">
      {{ finishing ? 'Finishing…' : 'Finish workout' }}
    </button>
    <p class="text-center text-xs text-slate-500">
      Leave an exercise after filling every set to collapse it. Finish workout logs what you entered.
    </p>
  </section>
</template>
