import { z } from 'zod'

import { loggedSetSchema } from './session'

export const prescribedSetSchema = z.strictObject({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
  reps: z.string().trim().min(1),
  weight: z.string().trim().min(1),
  warmup: z.boolean(),
})

export const exerciseSchema = z.strictObject({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
  name: z.string().trim().min(1),
  normalizedName: z.string().trim().min(1),
  restSeconds: z.number().int().nonnegative().nullable(),
  workSetSeconds: z.number().int().positive().nullable(),
  sets: z.array(prescribedSetSchema).min(1),
  lastSets: z.array(loggedSetSchema).optional(),
})

export const workoutSchema = z.strictObject({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
  title: z.string().trim().min(1),
  subtitle: z.string().nullable(),
  focus: z.string().nullable(),
  notes: z.string().nullable(),
  exercises: z.array(exerciseSchema).min(1),
})

export type Exercise = z.infer<typeof exerciseSchema>
export type Workout = z.infer<typeof workoutSchema>
