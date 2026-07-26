import { expect, it } from 'vitest'

import { mapRoutineRow } from '../../../server/schema/persistedPlan'
import { aggregateExerciseHistory, normalizeExerciseName } from '../../../server/utils/plans'

function routineRow(nextWorkoutPosition: number) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    user_id: '22222222-2222-4222-8222-222222222222',
    request: 'Strength',
    title: 'ABC',
    summary: 'Repeating',
    version: 1,
    status: 'active',
    created_at: '2026-07-26T00:00:00Z',
    user_routine_state: [{ next_workout_position: nextWorkoutPosition }],
    workout_templates: ['A', 'B', 'C'].map((title, position) => ({
      id: `${position + 1}1111111-1111-4111-8111-111111111111`,
      position,
      title,
      subtitle: null,
      focus: null,
      notes: null,
      prescribed_exercises: [{
        id: `${position + 4}1111111-1111-4111-8111-111111111111`,
        position: 0,
        name: 'Squat',
        normalized_name: 'squat',
        rest_seconds: null,
        work_set_seconds: null,
        prescribed_sets: [{
          id: `${position + 7}1111111-1111-4111-8111-111111111111`,
          position: 0,
          reps: '5',
          weight: '60',
          warmup: false,
        }],
      }],
    })),
  }
}

it.each([
  [0, ['A', 'B', 'C', 'A', 'B']],
  [1, ['B', 'C', 'A', 'B', 'C']],
  [2, ['C', 'A', 'B', 'C', 'A']],
])('projects five occurrences with wraparound from position %i', (position, titles) => {
  const plan = mapRoutineRow(routineRow(position))
  expect(plan.upcoming.map(item => item.workout.title)).toEqual(titles)
  expect(plan.upcoming.map(item => item.loggable)).toEqual([true, false, false, false, false])
})

it('normalizes names and averages only the last three nonblank appearances', () => {
  expect(normalizeExerciseName('  Back   SQUAT ')).toBe('back squat')
  const rows = [
    { normalized_name: 'squat', exercise_name: 'Squat', sets: [{ kg: 90, reps: 5 }] },
    { normalized_name: ' SQUAT ', exercise_name: 'Squat', sets: [] },
    { normalized_name: 'squat', exercise_name: 'Squat', sets: [{ kg: 80, reps: 6 }] },
    { normalized_name: 'squat', exercise_name: 'Squat', sets: [{ kg: 70, reps: 7 }] },
    { normalized_name: 'squat', exercise_name: 'Squat', sets: [{ kg: 10, reps: 20 }] },
  ]
  expect(aggregateExerciseHistory(rows)).toEqual([{
    exercise: 'Squat',
    appearances: 3,
    averageKg: 80,
    averageReps: 6,
  }])
})
