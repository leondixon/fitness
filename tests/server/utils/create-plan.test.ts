import type OpenAI from 'openai'

import { beforeAll, expect, it, vi } from 'vitest'

import { generatePlan } from '../../../server/utils/create-plan'

beforeAll(() => {
  vi.stubGlobal('createError', (options: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(options.statusMessage), options))
})

const workout = {
  title: 'Workout',
  exercises: [{ name: 'Squat', sets: [{ reps: '5', weight: '60' }] }],
}
const validPlan = {
  title: 'Strength routine',
  summary: 'A repeating strength routine.',
  workouts: [workout, workout, workout],
}

function mockClient(responses: unknown[]) {
  const requests: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming[] = []
  return {
    requests,
    client: {
      chat: { completions: { create: async (request) => {
        requests.push(request)
        return { choices: [{ message: { content: JSON.stringify(responses.shift()) } }] }
      } } },
    } as OpenAI,
  }
}

it('requests only three repeating templates and sends history aggregates and body notes', async () => {
  const { client, requests } = mockClient([validPlan])
  const history = [{ exercise: 'Squat', appearances: 3, averageKg: 62.5, averageReps: 5 }]

  expect(await generatePlan(client, 'deepseek-test', 'Get stronger', history, 'Left knee gets sore after deep squats.')).toEqual(validPlan)
  expect(requests[0]?.messages[0]?.content).toContain('exactly three ordered workout templates')
  expect(requests[0]?.messages[0]?.content).toContain('bodyNotes with injuries, imbalances')
  expect(requests[0]?.messages[1]?.content).toContain('"averageKg":62.5')
  expect(requests[0]?.messages[1]?.content).toContain('"bodyNotes":"Left knee gets sore after deep squats."')
})

it('succeeds after correcting an invalid response', async () => {
  const { client, requests } = mockClient([{ ...validPlan, workouts: [] }, validPlan])
  expect(await generatePlan(client, 'deepseek-test', 'Get stronger')).toEqual({
    ...validPlan,
    workouts: validPlan.workouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({ ...set, weight: 'N/A' })),
      })),
    })),
  })
  expect(requests).toHaveLength(2)
})
