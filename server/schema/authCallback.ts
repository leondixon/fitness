import { z } from 'zod'

export const authCallbackSchema = z.object({
  code: z.string().min(1),
  next: z.string().regex(/^\/(?!\/)/).optional().default('/workouts'),
})
