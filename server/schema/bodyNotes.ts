import { z } from 'zod'

export const bodyNotesSchema = z.string().trim().max(2000, 'Body notes must be 2,000 characters or fewer')

export const bodyNotesResponseSchema = z.strictObject({
  bodyNotes: bodyNotesSchema.nullable(),
})

export const updateBodyNotesRequestSchema = z.strictObject({
  bodyNotes: bodyNotesSchema,
})

export type BodyNotesResponse = z.infer<typeof bodyNotesResponseSchema>
export type UpdateBodyNotesRequest = z.infer<typeof updateBodyNotesRequestSchema>
