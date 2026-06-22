import { z } from 'zod'

export const exerciseSetSchema = z.object({
  previous: z.string().optional(),
  warmup: z.boolean().optional(),
})

export const exerciseSchema = z.object({
  name: z.string(),
  sets: z.array(exerciseSetSchema),
})

export const workoutSchema = z.object({
  name: z.string(),
  exercises: z.array(exerciseSchema),
})

export type ExerciseSet = z.infer<typeof exerciseSetSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type Workout = z.infer<typeof workoutSchema>
