import type { H3Event } from 'h3'

import { mapRoutineRow } from '~~/server/schema/persistedPlan'
import { getSupabaseServerClient } from './supabase'

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
  const exercisesWithHistory = new Set(
    (await getExerciseHistory(event, userId)).map(({ exercise }) => normalizeExerciseName(exercise)),
  )
  const workouts = plan.workouts.map(workout => ({
    ...workout,
    exercises: workout.exercises.map(exercise =>
      exercisesWithHistory.has(normalizeExerciseName(exercise.name))
        ? exercise
        : { ...exercise, sets: exercise.sets.map(set => ({ ...set, weight: 'N/A' })) },
    ),
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
  const { data, error } = await getSupabaseServerClient(event)
    .from('exercise_results')
    .select('normalized_name,exercise_name,sets,workout_sessions!inner(completed_at,status,user_id)')
    .eq('completed', true)
    .eq('workout_sessions.status', 'completed')
    .eq('workout_sessions.user_id', userId)
    .order('updated_at', { ascending: false })

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Could not load exercise history.' })

  return aggregateExerciseHistory(data ?? [])
}

interface HistoricalResult {
  normalized_name: string
  exercise_name: string
  sets: unknown
  workout_sessions?: { completed_at?: string | null } | { completed_at?: string | null }[]
}

export function aggregateExerciseHistory(rows: HistoricalResult[]) {
  const byExercise = new Map<string, { name: string, appearances: { kg: number, reps: number }[][] }>()

  for (const row of rows) {
    const normalizedName = normalizeExerciseName(row.normalized_name)
    const sets = Array.isArray(row.sets)
      ? row.sets.flatMap((set) => {
          if (!set || typeof set !== 'object')
            return []
          const { kg, reps } = set as { kg?: unknown, reps?: unknown }
          return typeof kg === 'number' && Number.isFinite(kg)
            && typeof reps === 'number' && Number.isFinite(reps)
            ? [{ kg, reps }]
            : []
        })
      : []
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
