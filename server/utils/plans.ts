import type { H3Event } from 'h3'

import { mapWorkoutPlanRow } from '~~/server/schema/persistedPlan'
import { getSupabaseServerClient } from './supabase'

const planColumns = 'id,user_id,goal,title,summary,workouts,change_log,version,created_at,updated_at'

export async function getCurrentPlan(event: H3Event, userId: string) {
  const { data, error } = await getSupabaseServerClient(event)
    .from('workout_plans')
    .select(planColumns)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout plan.' })
  }

  return data ? mapWorkoutPlanRow(data) : null
}

export async function getOwnedPlan(event: H3Event, userId: string, planId: string) {
  const { data, error } = await getSupabaseServerClient(event)
    .from('workout_plans')
    .select(planColumns)
    .eq('id', planId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout plan.' })
  }

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Workout plan not found.' })
  }

  return mapWorkoutPlanRow(data)
}
