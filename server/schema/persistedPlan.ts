import { z } from 'zod'

import { workoutSchema } from './workout'
import { workoutPlanSchema } from './workoutPlan'

export const routineRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  request: z.string(),
  title: z.string(),
  summary: z.string(),
  version: z.number().int().positive(),
  status: z.literal('active'),
  created_at: z.string(),
  workout_templates: z.array(z.object({
    id: z.string().uuid(),
    position: z.number().int().nonnegative(),
    title: z.string(),
    subtitle: z.string().nullable(),
    focus: z.string().nullable(),
    notes: z.string().nullable(),
    prescribed_exercises: z.array(z.object({
      id: z.string().uuid(),
      position: z.number().int().nonnegative(),
      name: z.string(),
      normalized_name: z.string(),
      rest_seconds: z.number().int().nonnegative().nullable(),
      work_set_seconds: z.number().int().positive().nullable(),
      prescribed_sets: z.array(z.object({
        id: z.string().uuid(),
        position: z.number().int().nonnegative(),
        reps: z.string(),
        weight: z.string(),
        warmup: z.boolean(),
      })),
    })),
  })),
  user_routine_state: z.array(z.object({
    next_workout_position: z.number().int().nonnegative(),
  })).length(1),
})

export const currentPlanResponseSchema = z.strictObject({
  plan: workoutPlanSchema.nullable(),
})

export function mapRoutineRow(row: unknown) {
  const parsed = routineRowSchema.parse(row)
  const workouts = parsed.workout_templates
    .sort((a, b) => a.position - b.position)
    .map(workout => workoutSchema.parse({
      id: workout.id,
      position: workout.position,
      title: workout.title,
      subtitle: workout.subtitle,
      focus: workout.focus,
      notes: workout.notes,
      exercises: workout.prescribed_exercises
        .sort((a, b) => a.position - b.position)
        .map(exercise => ({
          id: exercise.id,
          position: exercise.position,
          name: exercise.name,
          normalizedName: exercise.normalized_name,
          restSeconds: exercise.rest_seconds,
          workSetSeconds: exercise.work_set_seconds,
          sets: exercise.prescribed_sets
            .sort((a, b) => a.position - b.position)
            .map(set => ({
              id: set.id,
              position: set.position,
              reps: set.reps,
              weight: set.weight,
              warmup: set.warmup,
            })),
        })),
    }))
  const nextWorkoutPosition = parsed.user_routine_state[0].next_workout_position

  return workoutPlanSchema.parse({
    id: parsed.id,
    request: parsed.request,
    title: parsed.title,
    summary: parsed.summary,
    version: parsed.version,
    status: parsed.status,
    createdAt: parsed.created_at,
    nextWorkoutPosition,
    workouts,
    upcoming: Array.from({ length: 5 }, (_, occurrence) => ({
      occurrence,
      loggable: occurrence === 0,
      workout: workouts[(nextWorkoutPosition + occurrence) % workouts.length],
    })),
  })
}

export type CurrentPlanResponse = z.infer<typeof currentPlanResponseSchema>
