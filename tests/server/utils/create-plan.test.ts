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

it('requests only three repeating templates and sends history aggregates', async () => {
  const { client, requests } = mockClient([validPlan])
  const history = [{ exercise: 'Squat', appearances: 3, averageKg: 62.5, averageReps: 5 }]

  expect(await generatePlan(client, 'deepseek-test', 'Get stronger', history)).toEqual(validPlan)
  expect(requests[0]?.messages[0]?.content).toContain('exactly three ordered workout templates')
  expect(requests[0]?.messages[1]?.content).toContain('"averageKg":62.5')
})

it('succeeds after correcting an invalid response', async () => {
  const { client, requests } = mockClient([{ ...validPlan, workouts: [] }, validPlan])
  expect(await generatePlan(client, 'deepseek-test', 'Get stronger')).toEqual(validPlan)
  expect(requests).toHaveLength(2)
})
