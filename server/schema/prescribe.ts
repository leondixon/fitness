import { z } from 'zod'

export const prescribedLoadSetSchema = z.strictObject({
  id: z.string().uuid(),
  reps: z.string().trim().min(1),
  weight: z.string().trim().min(1),
})

export const prescribedLoadExerciseSchema = z.strictObject({
  id: z.string().uuid(),
  sets: z.array(prescribedLoadSetSchema).min(1),
})

export const prescribeWorkoutLlmResponseSchema = z.strictObject({
  exercises: z.array(prescribedLoadExerciseSchema).min(1),
})

export const prescribeWorkoutLlmResponseJsonSchema = z.toJSONSchema(prescribeWorkoutLlmResponseSchema)

export type PrescribeWorkoutLlmResponse = z.infer<typeof prescribeWorkoutLlmResponseSchema>
