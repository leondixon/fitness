import { z } from 'zod'

import { workoutSchema } from './workout'

export const upcomingWorkoutSchema = z.strictObject({
  occurrence: z.number().int().nonnegative(),
  loggable: z.boolean(),
  workout: workoutSchema,
})

export const workoutPlanSchema = z.strictObject({
  id: z.string().uuid(),
  request: z.string(),
  title: z.string(),
  summary: z.string(),
  version: z.number().int().positive(),
  status: z.literal('active'),
  createdAt: z.string(),
  nextWorkoutPosition: z.number().int().nonnegative(),
  workouts: z.array(workoutSchema).min(1),
  upcoming: z.array(upcomingWorkoutSchema).length(5),
})

export type WorkoutPlan = z.infer<typeof workoutPlanSchema>
