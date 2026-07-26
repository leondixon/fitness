import { spawn } from 'node:child_process'
import { expect, it } from 'vitest'

const projectRoot = new URL('../../../../', import.meta.url).pathname
const { createPlanResponseSchema } = await import('../../../../server/schema/create-plan')

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForServer(baseUrl: string, serverOutput: () => string) {
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

async function withNuxtServer(callback: (baseUrl: string) => Promise<void>) {
  const port = 39_000 + Math.floor(Math.random() * 1_000)
  const baseUrl = `http://127.0.0.1:${port}`
  const output: string[] = []
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

it.skipIf(!process.env.DEEPSEEK_API_KEY)(
  'calls DeepSeek and returns a schema-valid workout plan from POST /api/plans/create',
  async () => {
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
      expect(response.status, JSON.stringify(body, null, 2)).toBe(200)

      const plan = createPlanResponseSchema.parse(body)
      expect(plan.goal).toBe(goal)
      expect(plan.version).toBe(1)
      expect(plan.id).toMatch(/^[0-9a-f-]{36}$/i)
      expect(plan.title.trim()).toBeTruthy()
      expect(plan.summary.trim()).toBeTruthy()
      expect(plan.workouts.length).toBeGreaterThan(0)
      expect(plan.changeLog).toContain(`Created plan for goal: ${goal}`)

      let scheduledDay = 0
      const scheduledWeeks = new Set([1])

      for (const [workoutIndex, workout] of plan.workouts.entries()) {
        expect(String(workout.id).trim()).toBeTruthy()
        expect(workout.previousWorkoutId).toBe(
          workoutIndex === 0 ? null : plan.workouts[workoutIndex - 1]?.id,
        )
        expect(workout.restDaysAfterPrevious).toBeGreaterThanOrEqual(0)
        if (workoutIndex > 0) {
          scheduledDay += (workout.restDaysAfterPrevious ?? 0) + 1
          scheduledWeeks.add(Math.floor(scheduledDay / 7) + 1)
        }
        expect(workout.title.trim()).toBeTruthy()
        expect(workout.exercises.length).toBeGreaterThan(0)

        for (const exercise of workout.exercises) {
          expect(String(exercise.id).trim()).toBeTruthy()
          expect(exercise.name.trim()).toBeTruthy()
          expect(exercise.sets.length).toBeGreaterThan(0)
        }
      }

      expect(scheduledDay).toBeLessThanOrEqual(83)
      expect(scheduledWeeks).toEqual(new Set(Array.from({ length: 12 }, (_, index) => index + 1)))
    })
  },
  120_000,
)
