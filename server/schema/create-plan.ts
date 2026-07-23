import { z } from 'zod'
import { workoutPlanSchema } from './workoutPlan'

export const createPlanRequestSchema = z.object({
  goal: z.string().trim().min(1, 'Goal is required'),
})

const createPlanLlmSetSchema = z.strictObject({
  reps: z.string().trim().min(1, 'Reps are required'),
  weight: z.string().trim().min(1, 'Weight is required'),
  previous: z.string().optional(),
  warmup: z.boolean().optional(),
})

const createPlanLlmExerciseSchema = z.strictObject({
  name: z.string().trim().min(1, 'Exercise name is required'),
  restSeconds: z.number().int().positive().optional(),
  workSetSeconds: z.number().int().positive().optional(),
  sets: z.array(createPlanLlmSetSchema).min(1, 'At least one set is required'),
})

const createPlanLlmWorkoutSchema = z.strictObject({
  title: z.string().trim().min(1, 'Workout title is required'),
  subtitle: z.string().optional(),
  date: z.string().optional(),
  focus: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(createPlanLlmExerciseSchema).min(1, 'At least one exercise is required'),
})

export const createPlanLlmResponseSchema = z.strictObject({
  title: z.string().trim().min(1, 'Plan title is required'),
  summary: z.string().trim().min(1, 'Plan summary is required'),
  workouts: z.array(createPlanLlmWorkoutSchema).min(1, 'At least one workout is required'),
})

export const createPlanLlmResponseJsonSchema = z.toJSONSchema(createPlanLlmResponseSchema)

export const createPlanResponseSchema = workoutPlanSchema

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type CreatePlanLlmResponse = z.infer<typeof createPlanLlmResponseSchema>
