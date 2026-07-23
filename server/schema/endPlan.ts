import { z } from 'zod'

export const endPlanParamsSchema = z.object({
  id: z.string().uuid(),
})

export const endPlanResponseSchema = z.object({
  endedPlanId: z.string().uuid(),
})

export type EndPlanParams = z.infer<typeof endPlanParamsSchema>
export type EndPlanResponse = z.infer<typeof endPlanResponseSchema>
