interface ScheduledWorkout {
  id?: string | number
  previousWorkoutId?: string | number | null
  restDaysAfterPrevious?: number
}

const millisecondsPerDay = 86_400_000

function localCalendarDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / millisecondsPerDay
}

export function workoutPendingDays(
  workouts: ScheduledWorkout[],
  createdAt: string,
  today: Date,
) {
  const planStart = new Date(createdAt)
  const workoutsById = new Map(workouts.flatMap(workout =>
    workout.id === undefined ? [] : [[String(workout.id), workout] as const],
  ))
  const dueDays = new Map<string, number>()
  const resolving = new Set<string>()

  function resolveDueDay(workoutId: string): number | undefined {
    const existing = dueDays.get(workoutId)
    if (existing !== undefined)
      return existing

    const workout = workoutsById.get(workoutId)
    if (!workout || resolving.has(workoutId))
      return undefined

    resolving.add(workoutId)

    let dueDay: number | undefined
    if (workout.previousWorkoutId === null && workout.restDaysAfterPrevious === 0) {
      dueDay = localCalendarDay(planStart)
    }
    else if (
      workout.previousWorkoutId !== undefined
      && workout.previousWorkoutId !== null
      && workout.restDaysAfterPrevious !== undefined
    ) {
      const previousDueDay = resolveDueDay(String(workout.previousWorkoutId))
      if (previousDueDay !== undefined)
        dueDay = previousDueDay + workout.restDaysAfterPrevious + 1
    }

    resolving.delete(workoutId)

    if (dueDay !== undefined)
      dueDays.set(workoutId, dueDay)

    return dueDay
  }

  const currentDay = localCalendarDay(today)

  return new Map(workouts.flatMap((workout) => {
    if (workout.id === undefined)
      return []

    const workoutId = String(workout.id)
    const dueDay = resolveDueDay(workoutId)

    return dueDay === undefined ? [] : [[workoutId, dueDay - currentDay] as const]
  }))
}

export function formatWorkoutPendingDays(pendingDays: number | undefined) {
  if (pendingDays === undefined)
    return 'Schedule unavailable'
  if (pendingDays === 0)
    return 'Due today'
  if (pendingDays === 1)
    return 'Due in 1 day'
  if (pendingDays > 1)
    return `Due in ${pendingDays} days`
  if (pendingDays === -1)
    return 'Overdue by 1 day'
  return `Overdue by ${Math.abs(pendingDays)} days`
}
