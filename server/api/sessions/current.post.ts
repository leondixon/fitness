import { sessionResponseSchema } from '~~/server/schema/session'
import { getCurrentPlan } from '~~/server/utils/plans'
import { ensureWorkoutLoads, waitUpTo } from '~~/server/utils/prescribe'
import { mapSessionRow, sessionColumns } from '~~/server/utils/sessions'
import { getSupabaseServerClient, requireUser } from '~~/server/utils/supabase'

const startPrescribeWaitMs = 5000

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const plan = await getCurrentPlan(event, user.id)
  if (!plan)
    throw createError({ statusCode: 404, statusMessage: 'No active workout routine was found.' })

  const supabase = getSupabaseServerClient(event)
  const { data: existing, error: loadError } = await supabase
    .from('workout_sessions')
    .select(sessionColumns)
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (loadError)
    throw createError({ statusCode: 500, statusMessage: 'Could not load the workout session.' })
  if (existing)
    return sessionResponseSchema.parse({ session: mapSessionRow(existing) })

  const workout = plan.workouts[plan.nextWorkoutPosition]
  const insert = {
    id: crypto.randomUUID(),
    user_id: user.id,
    routine_id: plan.id,
    workout_template_id: workout.id,
    rotation_position: plan.nextWorkoutPosition,
  }
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert(insert)
    .select(sessionColumns)
    .single()

  if (error?.code === '23505') {
    const { data: raced } = await supabase
      .from('workout_sessions')
      .select(sessionColumns)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single()
    if (raced)
      return sessionResponseSchema.parse({ session: mapSessionRow(raced) })
  }
  if (error || !data)
    throw createError({ statusCode: 500, statusMessage: 'Could not start the workout session.' })

  await waitUpTo(ensureWorkoutLoads(event, user.id, workout.id), startPrescribeWaitMs)

  return sessionResponseSchema.parse({ session: mapSessionRow(data) })
})
