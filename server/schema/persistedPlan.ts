import { z } from 'zod'

import { workoutPlanSchema } from './workoutPlan'

export const workoutPlanRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  goal: z.string(),
  title: z.string(),
  summary: z.string(),
  workouts: z.unknown(),
  change_log: z.unknown(),
  version: z.number().int().positive(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const currentPlanResponseSchema = z.object({
  plan: workoutPlanSchema.nullable(),
})

export const persistedPlanInsertSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  goal: z.string(),
  title: z.string(),
  summary: z.string(),
  workouts: z.unknown(),
  change_log: z.unknown(),
  version: z.number().int().positive(),
})

export function mapWorkoutPlanRow(row: unknown) {
  const parsed = workoutPlanRowSchema.parse(row)

  return workoutPlanSchema.parse({
    id: parsed.id,
    goal: parsed.goal,
    title: parsed.title,
    summary: parsed.summary,
    workouts: parsed.workouts,
    changeLog: parsed.change_log,
    version: parsed.version,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  })
}

export type WorkoutPlanRow = z.infer<typeof workoutPlanRowSchema>
export type CurrentPlanResponse = z.infer<typeof currentPlanResponseSchema>
