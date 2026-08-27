import { expect, it } from 'vitest'

import { finishSessionRequestSchema } from '../../../server/schema/session'

it('accepts logged sets only when finishing a workout', () => {
  expect(finishSessionRequestSchema.parse({
    results: [{
      exerciseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      sets: [{ position: 1, kg: 80, reps: 5 }],
    }],
  }).results).toHaveLength(1)
  expect(finishSessionRequestSchema.parse({ results: [] })).toEqual({ results: [] })
})
