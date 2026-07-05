import { z } from 'zod'
import { workoutPlanSchema } from './workoutPlan'

export const createPlanRequestSchema = z.object({
  goal: z.string().trim().min(1, 'Goal is required'),
})

export const createPlanResponseSchema = workoutPlanSchema

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type CreatePlanResponse = z.infer<typeof createPlanResponseSchema>
