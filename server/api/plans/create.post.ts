import { createPlanRequestSchema, createPlanResponseSchema } from '../../schema/createPlan'

export default defineEventHandler(async (event) => {
  const input = createPlanRequestSchema.parse(await readBody(event))
  const now = new Date().toISOString()

  const foundationTitle = 'Foundation Strength'
  const plan = {
    id: crypto.randomUUID(),
    goal: input.goal,
    title: `Workout plan for ${input.goal}`,
    summary: `A testable workout plan for ${input.goal}. It includes multiple workout types and repeated workouts with different rep ranges.`,
    createdAt: now,
    updatedAt: now,
    version: 1,
    workouts: [
      {
        id: crypto.randomUUID(),
        title: foundationTitle,
        subtitle: 'Baseline strength session built around squat, push, and pull patterns.',
        date: 'Today',
        type: 'strength',
        focus: 'Full body baseline work',
        notes: 'Start conservative and leave two reps in reserve on every working set.',
        repeatOf: null,
        repRange: '5-8',
        exercises: [
          {
            id: 'squat',
            name: 'Squat',
            restSeconds: 120,
            workSetSeconds: 45,
            repRange: '5-8',
            sets: [
              { warmup: true, previous: 'Bodyweight x 10' },
              { previous: '70kg x 6' },
              { previous: '70kg x 6' },
              { previous: '70kg x 6' },
            ],
          },
          {
            id: 'bench-press',
            name: 'Bench Press',
            restSeconds: 120,
            workSetSeconds: 45,
            repRange: '5-8',
            sets: [
              { warmup: true, previous: '40kg x 8' },
              { previous: '60kg x 6' },
              { previous: '60kg x 6' },
              { previous: '60kg x 6' },
            ],
          },
          {
            id: 'row',
            name: 'Row',
            restSeconds: 90,
            workSetSeconds: 45,
            repRange: '6-10',
            sets: [
              { previous: '45kg x 8' },
              { previous: '45kg x 8' },
              { previous: '45kg x 8' },
            ],
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Foundation Strength Repeat',
        subtitle: 'Repeat the baseline movement pattern at higher reps.',
        date: 'Wednesday',
        type: 'strength-repeat',
        focus: 'Repeat baseline work at higher reps',
        notes: 'Keep the same exercise intent while using lighter loads and cleaner reps.',
        repeatOf: foundationTitle,
        repRange: '8-12',
        exercises: [
          {
            id: 'squat-repeat',
            name: 'Squat',
            restSeconds: 90,
            workSetSeconds: 45,
            repRange: '8-12',
            sets: [
              { previous: '60kg x 10' },
              { previous: '60kg x 10' },
              { previous: '60kg x 10' },
            ],
          },
          {
            id: 'bench-press-repeat',
            name: 'Bench Press',
            restSeconds: 90,
            workSetSeconds: 45,
            repRange: '8-12',
            sets: [
              { previous: '50kg x 10' },
              { previous: '50kg x 10' },
              { previous: '50kg x 10' },
            ],
          },
          {
            id: 'row-repeat',
            name: 'Row',
            restSeconds: 75,
            workSetSeconds: 45,
            repRange: '10-12',
            sets: [
              { previous: '40kg x 12' },
              { previous: '40kg x 12' },
              { previous: '40kg x 12' },
            ],
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Accessory Volume',
        subtitle: 'Support work for posterior chain, shoulders, and upper back.',
        date: 'Friday',
        type: 'accessory',
        focus: 'Support work and hypertrophy volume',
        notes: 'Use smooth tempo and stop each set before form changes.',
        repeatOf: null,
        repRange: '10-15',
        exercises: [
          {
            id: 'romanian-deadlift',
            name: 'Romanian Deadlift',
            restSeconds: 90,
            workSetSeconds: 50,
            repRange: '10-12',
            sets: [
              { previous: '70kg x 10' },
              { previous: '70kg x 10' },
              { previous: '70kg x 10' },
            ],
          },
          {
            id: 'overhead-press',
            name: 'Overhead Press',
            restSeconds: 90,
            workSetSeconds: 45,
            repRange: '8-12',
            sets: [
              { previous: '35kg x 8' },
              { previous: '35kg x 8' },
              { previous: '35kg x 8' },
            ],
          },
          {
            id: 'lat-pulldown',
            name: 'Lat Pulldown',
            restSeconds: 75,
            workSetSeconds: 45,
            repRange: '12-15',
            sets: [
              { previous: '50kg x 12' },
              { previous: '50kg x 12' },
              { previous: '50kg x 12' },
            ],
          },
        ],
      },
    ],
    changeLog: [`Created plan for goal: ${input.goal}`],
  }

  return createPlanResponseSchema.parse(plan)
})
