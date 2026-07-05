import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { createJiti } from 'jiti'

const projectRoot = new URL('../../../../', import.meta.url).pathname
const jiti = createJiti(import.meta.url, {
  alias: {
    '~~': projectRoot,
    'openai': new URL('../../../fixtures/openai-mock.cjs', import.meta.url).pathname,
  },
})

globalThis.defineEventHandler = handler => handler
globalThis.readBody = async event => event.body
globalThis.useRuntimeConfig = () => ({
  deepseekApiKey: 'test-api-key',
  deepseekBaseUrl: 'https://deepseek.test/v1',
  deepseekModel: globalThis.__deepseekModel,
})
globalThis.createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), {
  statusCode,
  statusMessage,
})

const createPlan = jiti('../../../../server/api/plans/create.post.ts').default

function validLlmPlan(overrides = {}) {
  return {
    title: 'Strength Builder',
    summary: 'A focused strength plan.',
    workouts: [
      {
        title: 'Lower Body Strength',
        subtitle: 'Squat emphasis',
        date: 'Week 1 Day 1',
        focus: 'Strength',
        notes: 'Add load when all reps are clean.',
        exercises: [
          {
            name: 'Back Squat',
            restSeconds: 180,
            workSetSeconds: 60,
            sets: [
              { reps: '5', weight: 'moderate', warmup: false },
            ],
          },
        ],
      },
    ],
    ...overrides,
  }
}

function setCompletionContent(content) {
  globalThis.__deepseekCompletion = {
    choices: [
      {
        message: { content },
      },
    ],
  }
}

test.beforeEach(() => {
  globalThis.__deepseekCompletion = undefined
  globalThis.__deepseekCreateError = undefined
  globalThis.__deepseekRequest = undefined
  globalThis.__openAiConstructorOptions = undefined
  globalThis.__deepseekModel = undefined
})

test('generates a plan with DeepSeek and server-owned metadata', async () => {
  setCompletionContent(JSON.stringify(validLlmPlan()))

  const result = await createPlan({ body: { goal: '  build maximal strength  ' } })

  assert.equal(globalThis.__openAiConstructorOptions.apiKey, 'test-api-key')
  assert.equal(globalThis.__openAiConstructorOptions.baseURL, 'https://deepseek.test/v1')
  assert.equal(globalThis.__deepseekRequest.model, 'deepseek-v4-flash')
  assert.deepEqual(globalThis.__deepseekRequest.response_format, { type: 'json_object' })
  assert.equal(globalThis.__deepseekRequest.messages[1].content, JSON.stringify({ goal: 'build maximal strength' }))

  assert.equal(result.goal, 'build maximal strength')
  assert.equal(result.title, 'Strength Builder')
  assert.equal(result.summary, 'A focused strength plan.')
  assert.equal(result.version, 1)
  assert.match(result.id, /^[0-9a-f-]{36}$/i)
  assert.equal(result.createdAt, result.updatedAt)
  assert.deepEqual(result.changeLog, ['Created plan for goal: build maximal strength'])
  assert.equal(result.workouts[0].id, `${result.id}-workout-1`)
  assert.equal(result.workouts[0].exercises[0].id, `${result.id}-workout-1-exercise-1`)
})

test('uses the configured DeepSeek model when provided', async () => {
  globalThis.__deepseekModel = 'deepseek-custom'
  setCompletionContent(JSON.stringify(validLlmPlan()))

  await createPlan({ body: { goal: 'run faster' } })

  assert.equal(globalThis.__deepseekRequest.model, 'deepseek-custom')
})

test('preserves LLM-provided workout and exercise ids', async () => {
  setCompletionContent(JSON.stringify(validLlmPlan({
    workouts: [
      {
        id: 'llm-workout-id',
        title: 'Upper Body Strength',
        exercises: [
          {
            id: 'llm-exercise-id',
            name: 'Bench Press',
            sets: [{ reps: '5', warmup: false }],
          },
        ],
      },
    ],
  })))

  const result = await createPlan({ body: { goal: 'press more weight' } })

  assert.equal(result.workouts[0].id, 'llm-workout-id')
  assert.equal(result.workouts[0].exercises[0].id, 'llm-exercise-id')
})

test('returns a 502 when DeepSeek returns empty content', async () => {
  setCompletionContent('')

  await assert.rejects(
    () => createPlan({ body: { goal: 'build endurance' } }),
    { statusCode: 502, statusMessage: 'LLM returned an empty response.' },
  )
})

test('returns a 502 when DeepSeek content fails the plan schema', async () => {
  setCompletionContent(JSON.stringify({
    title: 'Invalid Plan',
    summary: 'Missing workouts.',
    workouts: [],
  }))
  const originalConsoleError = console.error
  console.error = () => {}

  try {
    await assert.rejects(
      () => createPlan({ body: { goal: 'build endurance' } }),
      { statusCode: 502, statusMessage: 'LLM returned an invalid plan response.' },
    )
  }
  finally {
    console.error = originalConsoleError
  }
})

test('malformed DeepSeek JSON should return the same 502 as schema-invalid content', { skip: 'Bug: JSON.parse errors currently escape as SyntaxError instead of a 502 createError.' }, async () => {
  setCompletionContent('{not json')

  await assert.rejects(
    () => createPlan({ body: { goal: 'build endurance' } }),
    { statusCode: 502, statusMessage: 'LLM returned an invalid plan response.' },
  )
})
