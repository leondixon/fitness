import type OpenAI from 'openai'

import { beforeAll, expect, it, vi } from 'vitest'

import { generatePlan } from '../../../server/utils/create-plan'

beforeAll(() => {
  vi.stubGlobal('createError', (options: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(options.statusMessage), options))
})

const validPlan = {
  title: 'Strength plan',
  summary: 'A balanced strength plan.',
  workouts: Array.from({ length: 12 }, (_, index) => ({
    restDaysAfterPrevious: index === 0 ? 0 : 6,
    title: `Workout ${index + 1}`,
    exercises: [{
      name: 'Squat',
      sets: [{ reps: '5', weight: 'heavy' }],
    }],
  })),
}

function mockClient(responses: unknown[]) {
  const requests: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming[] = []

  return {
    requests,
    client: {
      chat: {
        completions: {
          create: async (request) => {
            requests.push(request)
            return {
              choices: [{
                message: { content: JSON.stringify(responses.shift()) },
              }],
            }
          },
        },
      },
    } as OpenAI,
  }
}

it('succeeds after correcting an invalid response', async () => {
  const { client, requests } = mockClient([
    { ...validPlan, workouts: [] },
    validPlan,
  ])

  expect(await generatePlan(client, 'deepseek-test', 'Get stronger')).toEqual(validPlan)
  expect(requests).toHaveLength(2)
  expect(requests[0]?.messages[0]?.content).toContain('"additionalProperties":false')
  expect(requests[1]?.messages.at(-1)?.content).toContain('Validation issues:')
  expect(requests[1]?.messages.at(-1)?.content).toContain('Required JSON Schema:')
})

it('returns 502 after two invalid responses', async () => {
  const { client, requests } = mockClient([
    { ...validPlan, workouts: [] },
    { ...validPlan, workouts: [] },
  ])

  await expect(generatePlan(client, 'deepseek-test', 'Get stronger')).rejects.toMatchObject({
    statusCode: 502,
    statusMessage: 'LLM returned an invalid plan response.',
  })
  expect(requests).toHaveLength(2)
})
