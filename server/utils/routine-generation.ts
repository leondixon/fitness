import type { H3Event } from 'h3'
import type { CreatePlanLlmResponse } from '~~/server/schema/create-plan'

import { normalizeExerciseName } from './plans'
import { getSupabaseServerClient } from './supabase'

export function buildRoutinePayload(
  generated: CreatePlanLlmResponse,
  request: string,
  version: number,
) {
  return {
    id: crypto.randomUUID(),
    request,
    version,
    title: generated.title,
    summary: generated.summary,
    workouts: generated.workouts.map((workout, position) => ({
      id: crypto.randomUUID(),
      position,
      title: workout.title,
      subtitle: workout.subtitle ?? null,
      focus: workout.focus ?? null,
      notes: workout.notes ?? null,
      exercises: workout.exercises.map((exercise, exercisePosition) => ({
        id: crypto.randomUUID(),
        position: exercisePosition,
        name: exercise.name,
        normalizedName: normalizeExerciseName(exercise.name),
        restSeconds: exercise.restSeconds ?? null,
        workSetSeconds: exercise.workSetSeconds ?? null,
        sets: exercise.sets.map((set, setPosition) => ({
          id: crypto.randomUUID(),
          position: setPosition,
          reps: set.reps,
          weight: set.weight,
          warmup: set.warmup ?? false,
        })),
      })),
    })),
  }
}

export async function activateRoutine(
  event: H3Event,
  userId: string,
  routine: ReturnType<typeof buildRoutinePayload>,
) {
  const { error } = await getSupabaseServerClient(event).rpc('activate_routine', {
    p_user_id: userId,
    p_routine: routine,
  })

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not activate the workout routine.' })
}
