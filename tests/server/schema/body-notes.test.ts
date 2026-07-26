import { expect, it } from 'vitest'

import { updateBodyNotesRequestSchema } from '../../../server/schema/bodyNotes'

it('trims body notes and permits clearing them', () => {
  expect(updateBodyNotesRequestSchema.parse({ bodyNotes: '  Tight right shoulder  ' })).toEqual({
    bodyNotes: 'Tight right shoulder',
  })
  expect(updateBodyNotesRequestSchema.parse({ bodyNotes: '   ' })).toEqual({ bodyNotes: '' })
})

it('rejects body notes longer than 2,000 characters', () => {
  expect(updateBodyNotesRequestSchema.safeParse({ bodyNotes: 'a'.repeat(2001) }).success).toBe(false)
})
