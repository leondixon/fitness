import { z } from 'zod'

export const loggedSetSchema = z.strictObject({
  position: z.number().int().nonnegative(),
  kg: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
})

export const exerciseResultSchema = z.strictObject({
  exerciseId: z.string().uuid(),
  exerciseName: z.string(),
  completed: z.boolean(),
  sets: z.array(loggedSetSchema),
})

export const workoutSessionSchema = z.strictObject({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
  workoutTemplateId: z.string().uuid(),
  rotationPosition: z.number().int().nonnegative(),
  status: z.enum(['in_progress', 'completed']),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  results: z.array(exerciseResultSchema),
})

export const sessionResponseSchema = z.strictObject({
  session: workoutSessionSchema,
})

export const saveExerciseResultRequestSchema = z.strictObject({
  exerciseId: z.string().uuid(),
  sets: z.array(loggedSetSchema),
})

export const undoExerciseResultRequestSchema = z.strictObject({
  exerciseId: z.string().uuid(),
})

export const finishSessionParamsSchema = z.strictObject({
  id: z.string().uuid(),
})

export const finishSessionRequestSchema = z.strictObject({
  results: z.array(saveExerciseResultRequestSchema),
})

export const sessionDraftSchema = z.strictObject({
  results: z.array(exerciseResultSchema),
})

export const finishSessionResponseSchema = z.strictObject({
  session: workoutSessionSchema,
  advanced: z.boolean(),
})
