import { z } from 'zod'

import { workoutPlanSchema } from './workoutPlan'

export const updatePlanRequestSchema = z.strictObject({
  adjustment: z.string().trim().min(1, 'Adjustment is required'),
})

export const updatePlanResponseSchema = workoutPlanSchema

export type UpdatePlanRequest = z.infer<typeof updatePlanRequestSchema>
export type UpdatePlanResponse = z.infer<typeof updatePlanResponseSchema>
