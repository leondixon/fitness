import { z } from 'zod'
import { workoutSchema } from './workout'
import { workoutPlanSchema } from './workoutPlan'

export const createPlanRequestSchema = z.object({
  goal: z.string().trim().min(1, 'Goal is required'),
})

export const createPlanLlmResponseSchema = z.object({
  title: z.string().trim().min(1, 'Plan title is required'),
  summary: z.string().trim().min(1, 'Plan summary is required'),
  workouts: z.array(workoutSchema).min(1, 'At least one workout is required'),
})

export const createPlanResponseSchema = workoutPlanSchema

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type CreatePlanLlmResponse = z.infer<typeof createPlanLlmResponseSchema>
export type CreatePlanResponse = z.infer<typeof createPlanResponseSchema>
