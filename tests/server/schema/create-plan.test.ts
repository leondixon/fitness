import { expect, it } from 'vitest'

import {
  createPlanLlmResponseJsonSchema,
  createPlanLlmResponseSchema,
} from '../../../server/schema/create-plan'

const workout = {
  title: 'Workout A',
  exercises: [{
    name: 'Back squat',
    restSeconds: 120,
    sets: [
      { reps: '5', weight: '20', warmup: true },
      { reps: '5', weight: '60' },
    ],
  }],
}

const response = {
  title: 'Three-workout strength split',
  summary: 'A repeating strength routine.',
  workouts: [workout, { ...workout, title: 'Workout B' }, { ...workout, title: 'Workout C' }],
}

it('accepts exactly three templates without scheduling fields', () => {
  expect(createPlanLlmResponseSchema.parse(response)).toEqual(response)
  expect(createPlanLlmResponseSchema.safeParse({ ...response, workouts: response.workouts.slice(0, 2) }).success).toBe(false)
  expect(createPlanLlmResponseSchema.safeParse({
    ...response,
    workouts: response.workouts.map(item => ({ ...item, restDaysAfterPrevious: 1 })),
  }).success).toBe(false)
})

it('serializes strict generated data to JSON Schema', () => {
  expect(createPlanLlmResponseJsonSchema.required).toEqual(['title', 'summary', 'workouts'])
  expect(createPlanLlmResponseJsonSchema.additionalProperties).toBe(false)
  expect(createPlanLlmResponseJsonSchema.properties.workouts.minItems).toBe(3)
  expect(createPlanLlmResponseJsonSchema.properties.workouts.maxItems).toBe(3)
})
