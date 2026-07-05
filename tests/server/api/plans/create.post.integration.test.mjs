import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { createJiti } from 'jiti'

const projectRoot = new URL('../../../../', import.meta.url).pathname
const jiti = createJiti(import.meta.url)
const { createPlanResponseSchema } = jiti('../../../../server/schema/createPlan.ts')

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForServer(baseUrl, serverOutput) {
  const deadline = Date.now() + 60_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) {
        return
      }
    }
    catch {
      // Server is still starting.
    }

    await wait(500)
  }

  throw new Error(`Nuxt dev server did not start in time. Output:\n${serverOutput()}`)
}

async function withNuxtServer(callback) {
  const port = 39_000 + Math.floor(Math.random() * 1_000)
  const baseUrl = `http://127.0.0.1:${port}`
  const output = []
  const server = spawn('npx', ['nuxt', 'dev', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  server.stdout.on('data', chunk => output.push(chunk.toString()))
  server.stderr.on('data', chunk => output.push(chunk.toString()))

  try {
    await waitForServer(baseUrl, () => output.join(''))
    await callback(baseUrl)
  }
  finally {
    server.kill('SIGTERM')
    await Promise.race([
      new Promise(resolve => server.once('exit', resolve)),
      wait(5_000).then(() => server.kill('SIGKILL')),
    ])
  }
}

test('POST /api/plans/create calls DeepSeek and returns a schema-valid workout plan', {
  timeout: 120_000,
  skip: process.env.DEEPSEEK_API_KEY ? false : 'Set DEEPSEEK_API_KEY to run the real DeepSeek integration test.',
}, async () => {
  await withNuxtServer(async (baseUrl) => {
    const goal = 'Build full-body strength with three gym workouts per week'
    const response = await fetch(`${baseUrl}/api/plans/create`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    })

    const body = await response.json().catch(async () => ({ raw: await response.text() }))
    assert.equal(response.status, 200, JSON.stringify(body, null, 2))

    const plan = createPlanResponseSchema.parse(body)
    assert.equal(plan.goal, goal)
    assert.equal(plan.version, 1)
    assert.match(plan.id, /^[0-9a-f-]{36}$/i)
    assert.ok(plan.title.trim())
    assert.ok(plan.summary.trim())
    assert.ok(plan.workouts.length > 0)
    assert.ok(plan.changeLog.includes(`Created plan for goal: ${goal}`))

    for (const workout of plan.workouts) {
      assert.ok(String(workout.id).trim())
      assert.ok(workout.title.trim())
      assert.ok(workout.exercises.length > 0)

      for (const exercise of workout.exercises) {
        assert.ok(String(exercise.id).trim())
        assert.ok(exercise.name.trim())
        assert.ok(exercise.sets.length > 0)
      }
    }
  })
})
