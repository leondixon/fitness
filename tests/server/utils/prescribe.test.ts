import type OpenAI from 'openai'
import { setTimeout as delay } from 'node:timers/promises'

import { beforeAll, expect, it, vi } from 'vitest'

import { applyEvidenceBasedLoads, alignSetPrescriptions, generateWorkoutPrescription, isLoadPrescriptionStale, waitUpTo } from '../../../server/utils/prescribe'

beforeAll(() => {
  vi.stubGlobal('createError', (options: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(options.statusMessage), options))
})

const squatId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const setId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const workout = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  title: 'Lower',
  exercises: [{
    id: squatId,
    name: 'Squat',
    sets: [{ id: setId, position: 0, reps: '5', weight: '60', warmup: false }],
  }],
}

const generated = {
  exercises: [{
    id: squatId,
    sets: [{ id: setId, reps: '5', weight: '62.5' }],
  }],
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

it('keeps only prescriptions that match the template exercise and set ids', () => {
  expect(alignSetPrescriptions(workout, generated)).toEqual([{ id: setId, reps: '5', weight: '62.5' }])
  expect(alignSetPrescriptions(workout, {
    exercises: [{
      id: squatId,
      sets: [{ id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', reps: '5', weight: '62.5' }],
    }],
  })).toBeUndefined()
  expect(alignSetPrescriptions(workout, { exercises: [...generated.exercises, ...generated.exercises] })).toBeUndefined()
})

it('forces N/A weights when an exercise has no matching history', () => {
  expect(applyEvidenceBasedLoads(workout, [{ id: setId, reps: '5', weight: '62.5' }], new Map())).toEqual([
    { id: setId, reps: '5', weight: 'N/A' },
  ])
  expect(applyEvidenceBasedLoads(workout, [{ id: setId, reps: '5', weight: '62.5' }], new Map([['squat', 60]]))).toEqual([
    { id: setId, reps: '5', weight: '62.5' },
  ])
})

it('replaces percentage weights with last logged kilograms', () => {
  expect(applyEvidenceBasedLoads(workout, [{ id: setId, reps: '5', weight: '75%' }], new Map([['squat', 80]]))).toEqual([
    { id: setId, reps: '5', weight: '80' },
  ])
})

it('sends the workout, full session history, and body notes to the coach', async () => {
  const { client, requests } = mockClient([generated])
  const history = [{
    exercise: 'Squat',
    sessions: [{ completedAt: '2026-08-01T00:00:00Z', sets: [{ position: 0, kg: 60, reps: 5 }] }],
  }]

  expect(await generateWorkoutPrescription(client, 'deepseek-test', workout, history, 'Left knee gets sore.')).toEqual([
    { id: setId, reps: '5', weight: '62.5' },
  ])
  expect(requests[0]?.messages[0]?.content).toContain('same exercises')
  expect(requests[0]?.messages[1]?.content).toContain('"kg":60')
  expect(requests[0]?.messages[1]?.content).toContain('"bodyNotes":"Left knee gets sore."')
})

it('succeeds after correcting an invalid response', async () => {
  const { client, requests } = mockClient([{ exercises: [] }, generated])
  expect(await generateWorkoutPrescription(client, 'deepseek-test', workout, [])).toEqual([
    { id: setId, reps: '5', weight: '62.5' },
  ])
  expect(requests).toHaveLength(2)
})

it('treats loads as stale when a newer completed session exists', () => {
  expect(isLoadPrescriptionStale(undefined, undefined)).toBe(false)
  expect(isLoadPrescriptionStale(undefined, squatId)).toBe(true)
  expect(isLoadPrescriptionStale(squatId, squatId)).toBe(false)
  expect(isLoadPrescriptionStale(squatId, setId)).toBe(true)
})

it('stops waiting when work is still running', async () => {
  const started = Date.now()
  await waitUpTo(delay(1000), 20)
  expect(Date.now() - started).toBeLessThan(200)
})
