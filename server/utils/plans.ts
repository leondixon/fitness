import type { H3Event } from 'h3'
import type { z } from 'zod'

import type { loggedSetSchema } from '~~/server/schema/session'
import { mapRoutineRow } from '~~/server/schema/persistedPlan'
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

export function parseKilogramWeight(weight: string) {
  const trimmed = weight.trim()
  if (!trimmed || trimmed.toUpperCase() === 'N/A' || trimmed.includes('%'))
    return undefined
  const kg = Number(trimmed.replace(/kg$/i, '').trim())
  return Number.isFinite(kg) && kg >= 0 ? kg : undefined
}

export function prescribedKilograms(weight: string, fallbackKg?: number) {
  const kg = parseKilogramWeight(weight)
  if (kg !== undefined)
    return String(kg)
  return fallbackKg === undefined ? 'N/A' : String(fallbackKg)
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
  const lastKg = lastWorkingKgByExerciseName(rows)
  const workouts = plan.workouts.map(workout => ({
    ...workout,
    exercises: workout.exercises.map((exercise) => {
      const fallbackKg = lastKg.get(normalizeExerciseName(exercise.name))
      return {
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          weight: fallbackKg === undefined ? 'N/A' : prescribedKilograms(set.weight, fallbackKg),
        })),
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

export interface HistoricalResult {
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

export function lastWorkingKgByExerciseName(rows: HistoricalResult[]) {
  const last = new Map<string, number>()
  for (const row of rows) {
    const key = normalizeExerciseName(row.normalized_name)
    if (last.has(key))
      continue
    const sets = parseLoggedSets(row.sets)
    if (sets.length === 0)
      continue
    last.set(key, Math.max(...sets.map(set => set.kg)))
  }
  return last
}

function sessionCompletedAt(row: HistoricalResult) {
  const session = row.workout_sessions
  const value = Array.isArray(session) ? session[0] : session
  return value?.completed_at
}

export function sessionHistoryByExerciseName(rows: HistoricalResult[]) {
  const byExercise = new Map<string, {
    exercise: string
    sessions: { completedAt: string, sets: LoggedSet[] }[]
  }>()

  for (const row of rows) {
    const sets = parseLoggedSets(row.sets)
    if (sets.length === 0)
      continue
    const key = normalizeExerciseName(row.normalized_name)
    const entry = byExercise.get(key) ?? { exercise: row.exercise_name, sessions: [] }
    entry.sessions.push({
      completedAt: sessionCompletedAt(row) ?? '',
      sets,
    })
    byExercise.set(key, entry)
  }

  return [...byExercise.values()].map(entry => ({
    ...entry,
    sessions: [...entry.sessions].sort((a, b) => a.completedAt.localeCompare(b.completedAt)),
  }))
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
