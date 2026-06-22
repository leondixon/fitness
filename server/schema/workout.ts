import { z } from 'zod'

export const exerciseSetSchema = z.object({
  previous: z.string().optional(),
  warmup: z.boolean().optional(),
}).passthrough()

export const exerciseSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  restSeconds: z.number().int().positive().optional(),
  workSetSeconds: z.number().int().positive().optional(),
  sets: z.array(exerciseSetSchema),
}).passthrough()

export const workoutSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  date: z.string().optional(),
  focus: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1),
}).passthrough()

export type ExerciseSet = z.infer<typeof exerciseSetSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type Workout = z.infer<typeof workoutSchema>
