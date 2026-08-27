import { expect, it } from 'vitest'

import {
  prescribeWorkoutLlmResponseJsonSchema,
  prescribeWorkoutLlmResponseSchema,
} from '../../../server/schema/prescribe'

const response = {
  exercises: [{
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    sets: [{
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      reps: '5',
      weight: '62.5',
    }],
  }],
}

it('accepts load prescriptions keyed by existing exercise and set ids', () => {
  expect(prescribeWorkoutLlmResponseSchema.parse(response)).toEqual(response)
  expect(prescribeWorkoutLlmResponseSchema.safeParse({
    exercises: [{ id: 'squat', sets: [{ id: '1', reps: '5', weight: '60' }] }],
  }).success).toBe(false)
  expect(prescribeWorkoutLlmResponseSchema.safeParse({
    ...response,
    notes: 'add sets',
  }).success).toBe(false)
})

it('serializes strict generated data to JSON Schema', () => {
  expect(prescribeWorkoutLlmResponseJsonSchema.required).toEqual(['exercises'])
  expect(prescribeWorkoutLlmResponseJsonSchema.additionalProperties).toBe(false)
})
