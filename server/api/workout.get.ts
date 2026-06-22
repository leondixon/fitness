import { workoutSchema } from '~~/server/schema/workout'

export default defineEventHandler(() => {
  return workoutSchema.parse({
    name: 'Push Day',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { warmup: true, previous: '40kg x 10' },
          { previous: '45kg x 7' },
          { previous: '45kg x 7' },
          { previous: '45kg x 6' },
        ],
      },
      {
        name: 'Overhead Press',
        sets: [
          { warmup: true, previous: '20kg x 10' },
          { previous: '35kg x 8' },
          { previous: '35kg x 8' },
          { previous: '35kg x 6' },
        ],
      },
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { previous: '22kg x 10' },
          { previous: '22kg x 9' },
          { previous: '22kg x 8' },
        ],
      },
      {
        name: 'Triceps Pushdown',
        sets: [
          { previous: '30kg x 12' },
          { previous: '30kg x 12' },
          { previous: '30kg x 10' },
        ],
      },
    ],
  })
})
