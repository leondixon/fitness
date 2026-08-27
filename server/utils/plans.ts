import type { H3Event } from 'h3'
import type { z } from 'zod'

import { mapRoutineRow } from '~~/server/schema/persistedPlan'
import { loggedSetSchema } from '~~/server/schema/session'
import { getSupabaseServerClient } from './supabase'

type LoggedSet = z.infer<typeof loggedSetSchema>

const routineQuery = `
  id,user_id,request,title,summary,version,status,created_at,
  workout_templates(
    id,position,title,subtitle,focus,notes,
    prescribed_exercises(
      id,position,name,normalized_name,rest_seconds,work_set_seconds,
      prescribed_sets(id,position,reps,weight,warmup)
    )
  ),
  user_routine_state!user_routine_state_routine_id_fkey(next_workout_position)
`

export function normalizeExerciseName(name: string) {
  return name.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

export async function getCurrentPlan(event: H3Event, userId: string) {
  const { data, error } = await getSupabaseServerClient(event)
    .from('routine_versions')
    .select(routineQuery)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout routine.' })

  if (!data)
    return null

  const plan = mapRoutineRow(data)
  const rows = await loadCompletedExerciseResults(event, userId)
  const exercisesWithHistory = new Set(
    aggregateExerciseHistory(rows).map(({ exercise }) => normalizeExerciseName(exercise)),
  )
  const lastSetsByExerciseId = lastLoggedSetsByExerciseId(rows)
  const workouts = plan.workouts.map(workout => ({
    ...workout,
    exercises: workout.exercises.map((exercise) => {
      const lastSets = lastSetsByExerciseId.get(exercise.id)
      return {
        ...exercise,
        sets: exercisesWithHistory.has(normalizeExerciseName(exercise.name))
          ? exercise.sets
          : exercise.sets.map(set => ({ ...set, weight: 'N/A' })),
        ...(lastSets ? { lastSets } : {}),
      }
    }),
  }))

  return {
    ...plan,
    workouts,
    upcoming: plan.upcoming.map(upcoming => ({
      ...upcoming,
      workout: workouts.find(workout => workout.id === upcoming.workout.id)!,
    })),
  }
}

export async function getExerciseHistory(event: H3Event, userId: string) {
  return aggregateExerciseHistory(await loadCompletedExerciseResults(event, userId))
}

async function loadCompletedExerciseResults(event: H3Event, userId: string) {
  const { data, error } = await getSupabaseServerClient(event)
    .from('exercise_results')
    .select('exercise_id,normalized_name,exercise_name,sets,workout_sessions!inner(completed_at,status,user_id)')
    .eq('completed', true)
    .eq('workout_sessions.status', 'completed')
    .eq('workout_sessions.user_id', userId)
    .order('updated_at', { ascending: false })

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not load exercise history.' })

  return data ?? []
}

export type HistoricalResult = {
  exercise_id?: string
  normalized_name: string
  exercise_name: string
  sets: unknown
  workout_sessions?: { completed_at?: string | undefined } | { completed_at?: string | undefined }[]
}

function parseLoggedSets(sets: unknown): LoggedSet[] {
  if (!Array.isArray(sets))
    return []

  return sets.flatMap((set, index) => {
    if (!set || typeof set !== 'object')
      return []
    const { position, kg, reps } = set as { position?: unknown, kg?: unknown, reps?: unknown }
    const setPosition = typeof position === 'number' && Number.isInteger(position) && position >= 0
      ? position
      : index
    return typeof kg === 'number' && Number.isFinite(kg)
      && typeof reps === 'number' && Number.isFinite(reps)
      ? [{ position: setPosition, kg, reps }]
      : []
  })
}

export function lastLoggedSetsByExerciseId(rows: HistoricalResult[]) {
  const last = new Map<string, LoggedSet[]>()
  for (const row of rows) {
    if (!row.exercise_id || last.has(row.exercise_id))
      continue
    const sets = parseLoggedSets(row.sets)
    if (sets.length === 0)
      continue
    last.set(row.exercise_id, sets)
  }
  return last
}

export function aggregateExerciseHistory(rows: HistoricalResult[]) {
  const byExercise = new Map<string, { name: string, appearances: { kg: number, reps: number }[][] }>()

  for (const row of rows) {
    const normalizedName = normalizeExerciseName(row.normalized_name)
    const sets = parseLoggedSets(row.sets)
    if (sets.length === 0)
      continue

    const entry = byExercise.get(normalizedName) ?? { name: row.exercise_name, appearances: [] }
    if (entry.appearances.length < 3)
      entry.appearances.push(sets)
    byExercise.set(normalizedName, entry)
  }

  return [...byExercise.values()].map(({ name, appearances }) => {
    const sets = appearances.flat()
    return {
      exercise: name,
      appearances: appearances.length,
      averageKg: Number((sets.reduce((sum, set) => sum + set.kg, 0) / sets.length).toFixed(2)),
      averageReps: Number((sets.reduce((sum, set) => sum + set.reps, 0) / sets.length).toFixed(2)),
    }
  })
}
