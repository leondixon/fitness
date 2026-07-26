import { expect, it } from 'vitest'

import {
  formatWorkoutPendingDays,
  workoutPendingDays,
} from '../../../app/utils/workout-schedule'

const createdAt = new Date(2026, 6, 26, 12).toISOString()
const today = new Date(2026, 6, 26, 18)

it('calculates due days by following previous workout links', () => {
  const pendingDays = workoutPendingDays([
    { id: 'third', previousWorkoutId: 'second', restDaysAfterPrevious: 1 },
    { id: 'first', previousWorkoutId: null, restDaysAfterPrevious: 0 },
    { id: 'second', previousWorkoutId: 'first', restDaysAfterPrevious: 0 },
  ], createdAt, today)

  expect(pendingDays).toEqual(new Map([
    ['third', 3],
    ['first', 0],
    ['second', 1],
  ]))
})

it('does not schedule broken or cyclic workout links', () => {
  const pendingDays = workoutPendingDays([
    { id: 'missing', previousWorkoutId: 'unknown', restDaysAfterPrevious: 0 },
    { id: 'cycle-a', previousWorkoutId: 'cycle-b', restDaysAfterPrevious: 0 },
    { id: 'cycle-b', previousWorkoutId: 'cycle-a', restDaysAfterPrevious: 0 },
  ], createdAt, today)

  expect(pendingDays.size).toBe(0)
})

it('formats pending and overdue days', () => {
  expect(formatWorkoutPendingDays(undefined)).toBe('Schedule unavailable')
  expect(formatWorkoutPendingDays(0)).toBe('Due today')
  expect(formatWorkoutPendingDays(1)).toBe('Due in 1 day')
  expect(formatWorkoutPendingDays(3)).toBe('Due in 3 days')
  expect(formatWorkoutPendingDays(-1)).toBe('Overdue by 1 day')
  expect(formatWorkoutPendingDays(-3)).toBe('Overdue by 3 days')
})
