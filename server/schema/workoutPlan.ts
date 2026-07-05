import { z } from 'zod'

import { workoutSchema } from './workout'

export const workoutPlanSchema = z.object({
  id: z.string(),
  goal: z.string(),
  title: z.string(),
  summary: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int().positive(),
  workouts: workoutSchema.array(),
  changeLog: z.string().array(),
})

export type WorkoutPlan = z.infer<typeof workoutPlanSchema>
