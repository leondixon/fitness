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
  finish: [results: { exerciseId: string, sets: WorkoutSession['results'][number]['sets'] }[]]
}>()

interface Logger {
  snapshot: () => { exerciseId: string, sets: WorkoutSession['results'][number]['sets'] }
}
const loggers = new Map<string, Logger>()

function bindLogger(id: string, el: unknown) {
  const logger = el as Logger | null
  if (logger)
    loggers.set(id, logger)
  else
    loggers.delete(id)
}

function resultFor(exerciseId: string) {
  return props.session.results.find(result => result.exerciseId === exerciseId)
}

function collectResults() {
  return [...loggers.values()].flatMap((logger) => {
    const snapshot = logger.snapshot()
    if (!snapshot.sets.length)
      return []
    return [{ exerciseId: snapshot.exerciseId, sets: snapshot.sets }]
  })
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
        :ref="(el) => bindLogger(exercise.id, el)"
        :completed="resultFor(exercise.id)?.completed"
        :exercise="exercise"
        :initial-sets="resultFor(exercise.id)?.sets"
        @done="emit('save', exercise.id, $event)"
        @undo="emit('undo', exercise.id)"
      />
    </div>

    <button class="btn-ink mt-auto" :disabled="finishing" type="button" @click="emit('finish', collectResults())">
      {{ finishing ? 'Finishing…' : 'Finish' }}
    </button>
  </section>
</template>
