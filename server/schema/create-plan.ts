import { z } from 'zod'
import { workoutPlanSchema } from './workoutPlan'

export const createPlanRequestSchema = z.strictObject({
  goal: z.string().trim().min(1, 'Goal is required'),
})

const generatedSetSchema = z.strictObject({
  reps: z.string().trim().min(1),
  weight: z.string().trim().min(1),
  warmup: z.boolean().optional(),
})

const generatedExerciseSchema = z.strictObject({
  name: z.string().trim().min(1),
  restSeconds: z.number().int().nonnegative().optional(),
  workSetSeconds: z.number().int().positive().optional(),
  sets: z.array(generatedSetSchema).min(1),
})

const generatedWorkoutSchema = z.strictObject({
  title: z.string().trim().min(1),
  subtitle: z.string().optional(),
  focus: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(generatedExerciseSchema).min(1),
})

export const createPlanLlmResponseSchema = z.strictObject({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  workouts: z.array(generatedWorkoutSchema).length(3),
})

export const createPlanLlmResponseJsonSchema = z.toJSONSchema(createPlanLlmResponseSchema)
export const createPlanResponseSchema = workoutPlanSchema

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type CreatePlanLlmResponse = z.infer<typeof createPlanLlmResponseSchema>
