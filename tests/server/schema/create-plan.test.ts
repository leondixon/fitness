import { expect, it } from 'vitest'

import {
  createPlanLlmResponseJsonSchema,
  createPlanLlmResponseSchema,
} from '../../../server/schema/create-plan'

const canonicalResponse = {
  title: 'Three-day strength plan',
  summary: 'Full-body strength training on alternating days.',
  workouts: [{
    title: 'Workout A',
    subtitle: 'Squat emphasis',
    date: 'Monday',
    focus: 'Strength',
    notes: 'Leave two reps in reserve.',
    exercises: [{
      name: 'Back squat',
      restSeconds: 120,
      workSetSeconds: 45,
      sets: [{
        reps: '8-10',
        weight: 'moderate',
        previous: '60 kg',
        warmup: false,
      }],
    }],
  }],
}

it('accepts a complete create-plan LLM response', () => {
  expect(createPlanLlmResponseSchema.parse(canonicalResponse)).toEqual(canonicalResponse)
})

it('rejects invalid generated plans', () => {
  const invalidPlans = [
    { ...canonicalResponse, summary: undefined },
    { ...canonicalResponse, workouts: [] },
    {
      ...canonicalResponse,
      workouts: [{ ...canonicalResponse.workouts[0], exercises: [] }],
    },
    {
      ...canonicalResponse,
      workouts: [{
        ...canonicalResponse.workouts[0],
        exercises: [{ ...canonicalResponse.workouts[0].exercises[0], sets: [] }],
      }],
    },
    {
      ...canonicalResponse,
      workouts: [{
        ...canonicalResponse.workouts[0],
        exercises: [{ ...canonicalResponse.workouts[0].exercises[0], restSeconds: '120' }],
      }],
    },
    { ...canonicalResponse, version: 1 },
  ]

  for (const invalidPlan of invalidPlans) {
    expect(createPlanLlmResponseSchema.safeParse(invalidPlan).success).toBe(false)
  }
})

it('serializes the Zod required and optional fields to JSON Schema', () => {
  expect(createPlanLlmResponseJsonSchema.required).toEqual(['title', 'summary', 'workouts'])
  expect(createPlanLlmResponseJsonSchema.additionalProperties).toBe(false)

  const workoutSchema = createPlanLlmResponseJsonSchema.properties.workouts.items
  expect(workoutSchema.required).toEqual(['title', 'exercises'])
  expect(workoutSchema.additionalProperties).toBe(false)

  const exerciseSchema = workoutSchema.properties.exercises.items
  expect(exerciseSchema.required).toEqual(['name', 'sets'])
  expect(exerciseSchema.additionalProperties).toBe(false)

  const setSchema = exerciseSchema.properties.sets.items
  expect(setSchema.required).toEqual(['reps', 'weight'])
  expect(setSchema.additionalProperties).toBe(false)
})
