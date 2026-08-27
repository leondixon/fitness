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
  <section class="flex flex-1 flex-col">
    <h1 class="text-[1.75rem] leading-none tracking-tight">
      {{ workout.title }}
    </h1>
    <p v-if="workout.focus" class="mt-2 text-[15px] text-mute">
      {{ workout.focus }}
    </p>

    <div class="mt-8 border-b border-rule">
      <exercise-logger
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        :completed="resultFor(exercise.id)?.completed"
        :exercise="exercise"
        :initial-sets="resultFor(exercise.id)?.sets ?? exercise.lastSets"
        @done="emit('save', exercise.id, $event)"
        @undo="emit('undo', exercise.id)"
      />
    </div>

    <button class="btn-ink mt-auto" :disabled="finishing" type="button" @click="emit('finish')">
      {{ finishing ? 'Finishing…' : 'Finish' }}
    </button>
  </section>
</template>
